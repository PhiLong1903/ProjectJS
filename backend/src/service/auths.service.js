const crypto = require("crypto");
const http_status_codes = require("http-status-codes");
const env = require("../config/env");
const audit_log = require("../utils/audit-log");
const app_error = require("../utils/app-error");
const password = require("../utils/password");
const password_reset_mailer = require("../utils/password-reset-mailer");
const tokenUtils = require("../utils/token");
const sequelize = require("../config/sequelize");
const SequelizeModels = require("../schemas/SequelizeModels");
const mapUserRecord = (user) => {
    if (!user) {
        return null;
    }
    const roles = Array.from(new Set((user.user_roles ?? [])
        .map((userRole) => userRole.role?.name)
        .filter((roleName) => Boolean(roleName))));
    return {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        password_hash: user.password_hash,
        password_reset_token: user.password_reset_token ?? null,
        password_reset_expires: user.password_reset_expires ? user.password_reset_expires.toISOString() : null,
        is_active: user.is_active,
        roles,
        patient_id: user.patient?.id ?? null,
        patient_code: user.patient?.patient_code ?? null,
        phone_number: user.patient?.phone_number ?? null,
    };
};
const findUserByEmail = async (email) => {
    const row = await SequelizeModels.UserModel.findOne({
        where: { email, is_deleted: false },
        include: [
            {
                model: SequelizeModels.UserRoleModel,
                as: "user_roles",
                required: false,
                include: [{ model: SequelizeModels.RoleModel, as: "role", required: false }],
            },
            { model: SequelizeModels.PatientModel, as: "patient", required: false },
        ],
    });
    return mapUserRecord(row);
};
exports.findUserByEmail = findUserByEmail;
const findUserById = async (userId) => {
    const row = await SequelizeModels.UserModel.findOne({
        where: { id: userId, is_deleted: false },
        include: [
            {
                model: SequelizeModels.UserRoleModel,
                as: "user_roles",
                required: false,
                include: [{ model: SequelizeModels.RoleModel, as: "role", required: false }],
            },
            { model: SequelizeModels.PatientModel, as: "patient", required: false },
        ],
    });
    return mapUserRecord(row);
};
exports.findUserById = findUserById;
const findPatientUserByIdentifier = async (identifier) => {
    const normalized = identifier.trim();
    if (!normalized) {
        return null;
    }
    const include = [
        {
            model: SequelizeModels.UserRoleModel,
            as: "user_roles",
            required: false,
            include: [{ model: SequelizeModels.RoleModel, as: "role", required: false }],
        },
        { model: SequelizeModels.PatientModel, as: "patient", required: false },
    ];
    if (normalized.includes("@")) {
        const row = await SequelizeModels.UserModel.findOne({
            where: {
                email: normalizeEmail(normalized),
                is_deleted: false,
            },
            include,
        });
        const user = mapUserRecord(row);
        return user?.roles.includes("PATIENT") ? user : null;
    }
    const patientCode = normalized.toUpperCase();
    const row = await SequelizeModels.UserModel.findOne({
        where: { is_deleted: false },
        include: [
            include[0],
            {
                model: SequelizeModels.PatientModel,
                as: "patient",
                required: true,
                where: { patient_code: patientCode },
            },
        ],
    });
    const user = mapUserRecord(row);
    return user?.roles.includes("PATIENT") ? user : null;
};
const findPatientUserByResetTokenHash = async (tokenHash) => {
    const row = await SequelizeModels.UserModel.findOne({
        where: {
            password_reset_token: tokenHash,
            is_deleted: false,
        },
        include: [
            {
                model: SequelizeModels.UserRoleModel,
                as: "user_roles",
                required: false,
                include: [{ model: SequelizeModels.RoleModel, as: "role", required: false }],
            },
            { model: SequelizeModels.PatientModel, as: "patient", required: false },
        ],
    });
    const user = mapUserRecord(row);
    return user?.roles.includes("PATIENT") ? user : null;
};
const updatePasswordResetToken = async (userId, tokenHash, expiresAt) => {
    await SequelizeModels.UserModel.update({
        password_reset_token: tokenHash,
        password_reset_expires: expiresAt,
    }, {
        where: { id: userId },
    });
};
const clearPasswordResetToken = async (userId) => {
    await SequelizeModels.UserModel.update({
        password_reset_token: null,
        password_reset_expires: null,
    }, {
        where: { id: userId },
    });
};
const updatePasswordAndClearResetToken = async (userId, passwordHash) => {
    await SequelizeModels.UserModel.update({
        password_hash: passwordHash,
        password_reset_token: null,
        password_reset_expires: null,
    }, {
        where: { id: userId },
    });
};
const revokeAllSessionsByUserId = async (userId) => {
    await SequelizeModels.AuthSessionModel.update({
        is_revoked: true,
    }, {
        where: { user_id: userId, is_revoked: false },
    });
};
const isPhoneTaken = async (phoneNumber) => {
    const total = await SequelizeModels.PatientModel.count({ where: { phone_number: phoneNumber } });
    return total > 0;
};
exports.isPhoneTaken = isPhoneTaken;
const isPatientCodeTaken = async (patientCode) => {
    const total = await SequelizeModels.PatientModel.count({ where: { patient_code: patientCode } });
    return total > 0;
};
exports.isPatientCodeTaken = isPatientCodeTaken;
const createPatientUser = async (input) => {
    return sequelize.sequelize.transaction(async (transaction) => {
        const user = await SequelizeModels.UserModel.create({
            email: input.email,
            full_name: input.fullName,
            password_hash: input.passwordHash,
        }, { transaction });
        let patientRole = await SequelizeModels.RoleModel.findOne({
            where: { name: "PATIENT" },
            transaction,
        });
        if (!patientRole) {
            patientRole = await SequelizeModels.RoleModel.create({
                name: "PATIENT",
                description: "Bệnh nhân sử dụng cổng đặt lịch",
            }, { transaction });
        }
        await SequelizeModels.UserRoleModel.findOrCreate({
            where: { user_id: user.id, role_id: patientRole.id },
            defaults: { user_id: user.id, role_id: patientRole.id },
            transaction,
        });
        const patient = await SequelizeModels.PatientModel.create({
            user_id: user.id,
            patient_code: input.patientCode,
            phone_number: input.phoneNumber,
            date_of_birth: input.dateOfBirth ?? null,
            gender: input.gender ?? null,
            address: input.address ?? null,
        }, { transaction });
        return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            password_hash: user.password_hash,
            is_active: user.is_active,
            roles: ["PATIENT"],
            patient_id: patient.id,
            patient_code: input.patientCode,
            phone_number: input.phoneNumber,
        };
    });
};
exports.createPatientUser = createPatientUser;
const createAuthSession = async (userId, refreshTokenHash, expiresAt, ipAddress, userAgent) => {
    await SequelizeModels.AuthSessionModel.create({
        user_id: userId,
        refresh_token_hash: refreshTokenHash,
        expires_at: expiresAt,
        ip_address: ipAddress ?? null,
        user_agent: userAgent ?? null,
        is_revoked: false,
    });
};
exports.createAuthSession = createAuthSession;
const findSessionByTokenHash = async (refreshTokenHash) => {
    const row = await SequelizeModels.AuthSessionModel.findOne({
        where: { refresh_token_hash: refreshTokenHash },
    });
    return row
        ? {
            id: row.id,
            user_id: row.user_id,
            refresh_token_hash: row.refresh_token_hash,
            expires_at: row.expires_at.toISOString(),
            is_revoked: row.is_revoked,
        }
        : null;
};
exports.findSessionByTokenHash = findSessionByTokenHash;
const revokeSessionByTokenHash = async (refreshTokenHash) => {
    await SequelizeModels.AuthSessionModel.update({ is_revoked: true }, { where: { refresh_token_hash: refreshTokenHash } });
};
exports.revokeSessionByTokenHash = revokeSessionByTokenHash;
const touchUserLastLogin = async (userId) => {
    await SequelizeModels.UserModel.update({ last_login_at: new Date() }, { where: { id: userId } });
};
exports.touchUserLastLogin = touchUserLastLogin;
const getLoginAttemptByEmail = async (email) => {
    const row = await SequelizeModels.AuthLoginAttemptModel.findByPk(email);
    return row
        ? {
            email: row.email,
            failed_count: row.failed_count,
            locked_until: row.locked_until ? row.locked_until.toISOString() : null,
        }
        : null;
};
exports.getLoginAttemptByEmail = getLoginAttemptByEmail;
const clearLoginAttemptByEmail = async (email) => {
    await SequelizeModels.AuthLoginAttemptModel.destroy({ where: { email } });
};
exports.clearLoginAttemptByEmail = clearLoginAttemptByEmail;
const recordFailedLoginAttemptByEmail = async (email, maxFailedAttempts, lockMinutes) => {
    return sequelize.sequelize.transaction(async (transaction) => {
        const existing = await SequelizeModels.AuthLoginAttemptModel.findOne({
            where: { email },
            lock: transaction.LOCK.UPDATE,
            transaction,
        });
        const now = new Date();
        const failedCount = (existing?.failed_count ?? 0) + 1;
        const lockedUntil = failedCount >= maxFailedAttempts ? new Date(now.getTime() + lockMinutes * 60 * 1000) : null;
        if (!existing) {
            await SequelizeModels.AuthLoginAttemptModel.create({
                email,
                failed_count: failedCount,
                first_failed_at: now,
                last_failed_at: now,
                locked_until: lockedUntil,
                updated_at: now,
            }, { transaction });
        }
        else {
            await existing.update({
                failed_count: failedCount,
                first_failed_at: existing.first_failed_at ?? now,
                last_failed_at: now,
                locked_until: lockedUntil,
                updated_at: now,
            }, { transaction });
        }
        return {
            email,
            failed_count: failedCount,
            locked_until: lockedUntil ? lockedUntil.toISOString() : null,
        };
    });
};
exports.recordFailedLoginAttemptByEmail = recordFailedLoginAttemptByEmail;
const roleTitleMap = {
    ADMIN: "quản trị",
    DOCTOR: "bác sĩ",
    PATIENT: "bệnh nhân",
    STAFF: "nhân vián",
};
const writeAuditLogSafe = async (input) => {
    try {
        await audit_log.writeAuditLog(input);
    }
    catch (error) {
        console.error("Audit log failed:", error);
    }
};
const generatePatientCode = async () => {
    let code = "";
    let isTaken = true;
    while (isTaken) {
        const random = Math.floor(1000 + Math.random() * 9000);
        code = `BN${new Date().toISOString().slice(2, 10).replace(/-/g, "")}${random}`;
        isTaken = await exports.isPatientCodeTaken(code);
    }
    return code;
};
const toAuthPayload = (input) => {
    const accessToken = tokenUtils.signAccessToken({
        sub: input.id,
        email: input.email,
        fullName: input.fullName,
        roles: input.roles,
    });
    return {
        token: accessToken,
        user: {
            id: input.id,
            email: input.email,
            fullName: input.fullName,
            roles: input.roles,
            patientCode: input.patientCode,
        },
    };
};
const normalizeEmail = (email) => email.trim().toLowerCase();
const PASSWORD_RESET_GENERIC_MESSAGE = "Neu tai khoan ton tai, email dat lai mat khau da duoc gui.";
const createRawPasswordResetToken = () => crypto.randomBytes(32).toString("hex");
const getPasswordResetExpiresAt = () => {
    const ttlMinutes = env.env.PASSWORD_RESET_TOKEN_EXPIRES_MINUTES;
    return new Date(Date.now() + ttlMinutes * 60 * 1000);
};
const buildPasswordResetLink = (rawToken) => {
    const baseUrl = env.env.PASSWORD_RESET_URL ?? `${env.env.CLIENT_URL ?? "http://localhost:5173"}/reset-password`;
    const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    return `${normalizedBase}/${rawToken}`;
};
const register = async (payload) => {
    const normalizedEmail = normalizeEmail(payload.email);
    const existingUser = await exports.findUserByEmail(normalizedEmail);
    if (existingUser) {
        throw new app_error.AppError(http_status_codes.StatusCodes.CONFLICT, "Email đã tồn tại trong hệ thống");
    }
    const phoneTaken = await exports.isPhoneTaken(payload.phoneNumber);
    if (phoneTaken) {
        throw new app_error.AppError(http_status_codes.StatusCodes.CONFLICT, "Số điện thoại đã được sử dụng");
    }
    const patientCode = await generatePatientCode();
    const passwordHash = await password.hashPassword(payload.password);
    try {
        await exports.createPatientUser({
            email: normalizedEmail,
            fullName: payload.fullName,
            passwordHash,
            patientCode,
            phoneNumber: payload.phoneNumber,
            dateOfBirth: payload.dateOfBirth,
            gender: payload.gender,
            address: payload.address,
        });
    }
    catch (error) {
        const pgCode = error?.code;
        const pgDetail = error?.detail ?? "";
        if (pgCode === "23505") {
            if (pgDetail.includes("(email)")) {
                throw new app_error.AppError(http_status_codes.StatusCodes.CONFLICT, "Email đã tồn tại trong hệ thống");
            }
            if (pgDetail.includes("(phone_number)")) {
                throw new app_error.AppError(http_status_codes.StatusCodes.CONFLICT, "Số điện thoại đã được sử dụng");
            }
            throw new app_error.AppError(http_status_codes.StatusCodes.CONFLICT, "Dữ liệu đăng ký đã tồn tại");
        }
        if (pgCode === "42P01") {
            throw new app_error.AppError(http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR, "Database chưa khởi tạo đầy đủ. Vui lòng chạy lệnh npm run db:init trong backend.");
        }
        throw error;
    }
    return { patientCode };
};
exports.register = register;
const login = async (payload, meta) => {
    const normalizedEmail = normalizeEmail(payload.email);
    const lockAttempt = await exports.getLoginAttemptByEmail(normalizedEmail);
    if (lockAttempt?.locked_until && new Date(lockAttempt.locked_until) > new Date()) {
        await writeAuditLogSafe({
            action: "AUTH_LOGIN_BLOCKED",
            actorEmail: normalizedEmail,
            actorRole: payload.role,
            targetType: "AUTH",
            status: "FAILED",
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
            metadata: {
                lockedUntil: lockAttempt.locked_until,
                reason: "TEMP_LOCK_ACTIVE",
            },
        });
        throw new app_error.AppError(http_status_codes.StatusCodes.LOCKED, `Tài khoản đăng nhập tạm thời bị khóa đến ${lockAttempt.locked_until}. Vui lòng thử lại sau.`);
    }
    const user = await exports.findUserByEmail(normalizedEmail);
    const passwordValid = user
        ? await password.comparePassword(payload.password, user.password_hash)
        : false;
    if (!user || !passwordValid) {
        const attempt = await exports.recordFailedLoginAttemptByEmail(normalizedEmail, env.env.LOGIN_MAX_FAILED_ATTEMPTS, env.env.LOGIN_LOCK_MINUTES);
        const isLockedNow = Boolean(attempt.locked_until) && new Date(attempt.locked_until) > new Date();
        await writeAuditLogSafe({
            action: "AUTH_LOGIN_FAILED",
            actorEmail: normalizedEmail,
            actorRole: payload.role,
            targetType: "AUTH",
            status: "FAILED",
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
            metadata: {
                failedCount: attempt.failed_count,
                lockedUntil: attempt.locked_until,
            },
        });
        if (isLockedNow) {
            throw new app_error.AppError(http_status_codes.StatusCodes.LOCKED, `Tài khoản đã bị khóa tạm thời trong ${env.env.LOGIN_LOCK_MINUTES} phút do đăng nhập sai nhiều lần.`);
        }
        throw new app_error.AppError(http_status_codes.StatusCodes.UNAUTHORIZED, "Email hoặc mật khẩu không đúng");
    }
    if (!user.is_active) {
        await writeAuditLogSafe({
            action: "AUTH_LOGIN_FAILED",
            actorUserId: user.id,
            actorEmail: user.email,
            actorRole: payload.role,
            targetType: "AUTH",
            status: "FAILED",
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
            metadata: { reason: "ACCOUNT_DISABLED" },
        });
        throw new app_error.AppError(http_status_codes.StatusCodes.FORBIDDEN, "Tài khoản đã bị khóa");
    }
    if (!user.roles.includes(payload.role)) {
        const attempt = await exports.recordFailedLoginAttemptByEmail(normalizedEmail, env.env.LOGIN_MAX_FAILED_ATTEMPTS, env.env.LOGIN_LOCK_MINUTES);
        await writeAuditLogSafe({
            action: "AUTH_LOGIN_FAILED",
            actorUserId: user.id,
            actorEmail: user.email,
            actorRole: payload.role,
            targetType: "AUTH",
            targetId: user.id,
            status: "FAILED",
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
            metadata: {
                reason: "ROLE_MISMATCH",
                availableRoles: user.roles,
                failedCount: attempt.failed_count,
                lockedUntil: attempt.locked_until,
            },
        });
        throw new app_error.AppError(http_status_codes.StatusCodes.FORBIDDEN, `Tài khoản không có quyền đăng nhập cổng ${roleTitleMap[payload.role]}`);
    }
    const refreshToken = tokenUtils.signRefreshToken({
        sub: user.id,
        type: "refresh",
    });
    const refreshTokenPayload = tokenUtils.verifyRefreshToken(refreshToken);
    const expiresAt = typeof refreshTokenPayload === "object" && refreshTokenPayload.exp
        ? new Date(refreshTokenPayload.exp * 1000)
        : tokenUtils.refreshTokenExpiresAt();
    const refreshTokenHash = tokenUtils.hashToken(refreshToken);
    await exports.createAuthSession(user.id, refreshTokenHash, expiresAt, meta.ipAddress, meta.userAgent);
    await exports.touchUserLastLogin(user.id);
    await exports.clearLoginAttemptByEmail(normalizedEmail);
    const { token, user: authUser } = toAuthPayload({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        roles: user.roles,
        patientCode: user.patient_code,
    });
    await writeAuditLogSafe({
        action: "AUTH_LOGIN_SUCCESS",
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: payload.role,
        targetType: "AUTH",
        targetId: user.id,
        status: "SUCCESS",
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        metadata: {
            roles: user.roles,
        },
    });
    return {
        user: authUser,
        accessToken: token,
        refreshToken,
    };
};
exports.login = login;
const forgotPassword = async (payload, meta) => {
    const user = await findPatientUserByIdentifier(payload.identifier);
    if (!user || !user.is_active) {
        return { message: PASSWORD_RESET_GENERIC_MESSAGE };
    }
    const rawToken = createRawPasswordResetToken();
    const tokenHash = tokenUtils.hashToken(rawToken);
    const expiresAt = getPasswordResetExpiresAt();
    await updatePasswordResetToken(user.id, tokenHash, expiresAt);
    const resetLink = buildPasswordResetLink(rawToken);
    try {
        await password_reset_mailer.sendPasswordResetEmail({
            toEmail: user.email,
            fullName: user.full_name,
            resetLink,
            expiresInMinutes: env.env.PASSWORD_RESET_TOKEN_EXPIRES_MINUTES,
        });
    }
    catch (error) {
        console.error("[auth][forgot-password] email send failed:", error);
    }
    await writeAuditLogSafe({
        action: "AUTH_FORGOT_PASSWORD_REQUEST",
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: "PATIENT",
        targetType: "AUTH",
        targetId: user.id,
        status: "SUCCESS",
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        metadata: {
            expiresAt: expiresAt.toISOString(),
        },
    });
    return { message: PASSWORD_RESET_GENERIC_MESSAGE };
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (rawToken, payload, meta) => {
    if (!rawToken || typeof rawToken !== "string") {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Token khong hop le. Hay yeu cau lai lien ket.");
    }
    const tokenHash = tokenUtils.hashToken(rawToken);
    const user = await findPatientUserByResetTokenHash(tokenHash);
    if (!user || !user.password_reset_token) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Token khong hop le. Hay yeu cau lai lien ket.");
    }
    if (!user.password_reset_expires || new Date(user.password_reset_expires) <= new Date()) {
        await clearPasswordResetToken(user.id);
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Token da het han. Hay yeu cau lai lien ket.");
    }
    const newPasswordHash = await password.hashPassword(payload.password, 12);
    await updatePasswordAndClearResetToken(user.id, newPasswordHash);
    await revokeAllSessionsByUserId(user.id);
    await clearLoginAttemptByEmail(user.email);
    await writeAuditLogSafe({
        action: "AUTH_RESET_PASSWORD_SUCCESS",
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: "PATIENT",
        targetType: "AUTH",
        targetId: user.id,
        status: "SUCCESS",
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
    });
    return { message: "Dat lai mat khau thanh cong. Vui long dang nhap lai." };
};
exports.resetPassword = resetPassword;
const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new app_error.AppError(http_status_codes.StatusCodes.UNAUTHORIZED, "Thieu refresh token");
    }
    let refreshTokenPayload;
    try {
        refreshTokenPayload = tokenUtils.verifyRefreshToken(refreshToken);
    }
    catch (_error) {
        throw new app_error.AppError(http_status_codes.StatusCodes.UNAUTHORIZED, "Refresh token khong hop le hoac da het han");
    }
    if (typeof refreshTokenPayload !== "object" ||
        !refreshTokenPayload ||
        !refreshTokenPayload.sub ||
        refreshTokenPayload.type !== "refresh") {
        throw new app_error.AppError(http_status_codes.StatusCodes.UNAUTHORIZED, "Refresh token khong hop le");
    }
    const tokenHash = tokenUtils.hashToken(refreshToken);
    const session = await exports.findSessionByTokenHash(tokenHash);
    if (!session || session.is_revoked) {
        throw new app_error.AppError(http_status_codes.StatusCodes.UNAUTHORIZED, "Phien dang nhap khong hop le");
    }
    if (String(refreshTokenPayload.sub) !== session.user_id) {
        throw new app_error.AppError(http_status_codes.StatusCodes.UNAUTHORIZED, "Phien dang nhap khong hop le");
    }
    if (new Date(session.expires_at) < new Date()) {
        throw new app_error.AppError(http_status_codes.StatusCodes.UNAUTHORIZED, "Phien dang nhap da het han");
    }
    const user = await exports.findUserById(session.user_id);
    if (!user || !user.is_active) {
        throw new app_error.AppError(http_status_codes.StatusCodes.UNAUTHORIZED, "Tai khoan khong con hop le");
    }
    const { token } = toAuthPayload({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        roles: user.roles,
        patientCode: user.patient_code,
    });
    return { accessToken: token };
};
exports.refreshAccessToken = refreshAccessToken;
const logout = async (refreshToken) => {
    if (!refreshToken) {
        return;
    }
    const tokenHash = tokenUtils.hashToken(refreshToken);
    await exports.revokeSessionByTokenHash(tokenHash);
};
exports.logout = logout;
const getCurrentUser = async (userId) => {
    const user = await exports.findUserById(userId);
    if (!user) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
    }
    return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        roles: user.roles,
        patientCode: user.patient_code,
    };
};
exports.getCurrentUser = getCurrentUser;
