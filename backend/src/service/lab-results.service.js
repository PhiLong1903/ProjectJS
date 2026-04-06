const http_status_codes_1 = require("http-status-codes");
const app_error_1 = require("../utils/app-error");
const SequelizeModels_1 = require("../schemas/SequelizeModels");
const toRecord = (row) => ({
    id: row.id,
    patient_id: row.patient_id,
    patient_code: row.patient?.patient_code ?? "",
    patient_name: row.patient?.user?.full_name ?? "",
    test_code: row.test_code,
    test_name: row.test_name,
    result_summary: row.result_summary,
    result_detail: row.result_detail,
    conclusion: row.conclusion,
    status: row.status,
    performed_at: row.performed_at ? row.performed_at.toISOString() : null,
    created_at: row.created_at.toISOString(),
});
const includePatient = [
    {
        model: SequelizeModels_1.PatientModel,
        as: "patient",
        required: true,
        include: [{ model: SequelizeModels_1.UserModel, as: "user", required: true }],
    },
];
const lookupLabResults = async (patientCode, phoneNumber) => {
    const rows = await SequelizeModels_1.LabResultModel.findAll({
        where: { is_deleted: false },
        include: [
            {
                model: SequelizeModels_1.PatientModel,
                as: "patient",
                required: true,
                where: { patient_code: patientCode, phone_number: phoneNumber },
                include: [{ model: SequelizeModels_1.UserModel, as: "user", required: true }],
            },
        ],
        order: [["created_at", "DESC"]],
        limit: 20,
    });
    return rows.map((row) => toRecord(row));
};
exports.lookupLabResults = lookupLabResults;
const listLabResultsAdmin = async (limit, offset) => {
    const { rows, count } = await SequelizeModels_1.LabResultModel.findAndCountAll({
        where: { is_deleted: false },
        include: includePatient,
        order: [["created_at", "DESC"]],
        limit,
        offset,
    });
    return {
        rows: rows.map((row) => toRecord(row)),
        total: count,
    };
};
exports.listLabResultsAdmin = listLabResultsAdmin;
const findPatientByCode = async (patientCode) => {
    const row = await SequelizeModels_1.PatientModel.findOne({
        attributes: ["id", "patient_code"],
        where: { patient_code: patientCode },
    });
    return row ? { id: row.id, patient_code: row.patient_code } : null;
};
exports.findPatientByCode = findPatientByCode;
const findLabResultById = async (labResultId) => {
    const row = await SequelizeModels_1.LabResultModel.findOne({
        where: { id: labResultId, is_deleted: false },
        include: includePatient,
    });
    return row
        ? toRecord(row)
        : null;
};
exports.findLabResultById = findLabResultById;
const createLabResult = async (input) => {
    const row = await SequelizeModels_1.LabResultModel.create({
        patient_id: input.patientId,
        test_code: input.testCode,
        test_name: input.testName,
        result_summary: input.resultSummary ?? null,
        result_detail: input.resultDetail ?? null,
        conclusion: input.conclusion ?? null,
        status: input.status,
        performed_at: input.performedAt ? new Date(input.performedAt) : null,
    });
    const detail = await SequelizeModels_1.LabResultModel.findOne({
        where: { id: row.id },
        include: includePatient,
    });
    return toRecord(detail);
};
exports.createLabResult = createLabResult;
const updateLabResult = async (labResultId, input) => {
    const row = await SequelizeModels_1.LabResultModel.findOne({
        where: { id: labResultId, is_deleted: false },
    });
    if (!row) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "Không tìm thấy kết quả cận lâm sàng");
    }
    await row.update({
        test_code: input.testCode,
        test_name: input.testName,
        result_summary: input.resultSummary ?? null,
        result_detail: input.resultDetail ?? null,
        conclusion: input.conclusion ?? null,
        status: input.status,
        performed_at: input.performedAt ? new Date(input.performedAt) : null,
        updated_at: new Date(),
    });
    const detail = await SequelizeModels_1.LabResultModel.findOne({
        where: { id: row.id },
        include: includePatient,
    });
    return toRecord(detail);
};
exports.updateLabResult = updateLabResult;
const deleteLabResult = async (labResultId) => {
    await SequelizeModels_1.LabResultModel.update({
        is_deleted: true,
        updated_at: new Date(),
    }, { where: { id: labResultId } });
};
exports.deleteLabResult = deleteLabResult;
const lookupLabResultService = async (payload) => {
    const results = await exports.lookupLabResults(payload.patientCode, payload.phoneNumber);
    if (results.length === 0) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "Không tìm thấy kết quả cận lâm sàng. Vui lòng kiểm tra lại mã bệnh nhân và số điện thoại.");
    }
    return results;
};
exports.lookupLabResultService = lookupLabResultService;
const getLabResultsAdmin = (pageSize, offset) => exports.listLabResultsAdmin(pageSize, offset);
exports.getLabResultsAdmin = getLabResultsAdmin;
const getLabResultDetailAdmin = async (labResultId) => {
    const detail = await exports.findLabResultById(labResultId);
    if (!detail) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "Khong tim thay ket qua can lam sang");
    }
    return detail;
};
exports.getLabResultDetailAdmin = getLabResultDetailAdmin;
const createLabResultService = async (payload) => {
    const patient = await exports.findPatientByCode(payload.patientCode);
    if (!patient) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "Không tìm thấy bệnh nhân theo mã cung cấp");
    }
    return exports.createLabResult({
        patientId: patient.id,
        testCode: payload.testCode,
        testName: payload.testName,
        resultSummary: payload.resultSummary,
        resultDetail: payload.resultDetail,
        conclusion: payload.conclusion,
        status: payload.status,
        performedAt: payload.performedAt,
    });
};
exports.createLabResultService = createLabResultService;
const updateLabResultService = async (labResultId, payload) => {
    const existing = await exports.findLabResultById(labResultId);
    if (!existing) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "Không tìm thấy kết quả cận lâm sàng");
    }
    return exports.updateLabResult(labResultId, payload);
};
exports.updateLabResultService = updateLabResultService;
const deleteLabResultService = async (labResultId) => {
    const existing = await exports.findLabResultById(labResultId);
    if (!existing) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "Không tìm thấy kết quả cận lâm sàng");
    }
    await exports.deleteLabResult(labResultId);
};
exports.deleteLabResultService = deleteLabResultService;
