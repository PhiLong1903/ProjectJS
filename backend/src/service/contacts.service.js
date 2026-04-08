const http_status_codes = require("http-status-codes");
const SequelizeModels = require("../schemas/SequelizeModels");
const app_error = require("../utils/app-error");
const createContactMessage = async (input) => {
    const row = await SequelizeModels.ContactMessageModel.create({
        full_name: input.fullName,
        phone_number: input.phoneNumber ?? null,
        email: input.email ?? null,
        subject: input.subject,
        message: input.message,
    });
    return {
        id: row.id,
        full_name: row.full_name,
        phone_number: row.phone_number,
        email: row.email,
        subject: row.subject,
        message: row.message,
        created_at: row.created_at.toISOString(),
    };
};
exports.createContactMessage = createContactMessage;
const listContactMessages = async (limit, offset) => {
    const { rows, count } = await SequelizeModels.ContactMessageModel.findAndCountAll({
        order: [["created_at", "DESC"]],
        limit,
        offset,
    });
    return {
        rows: rows.map((row) => ({
            id: row.id,
            full_name: row.full_name,
            phone_number: row.phone_number,
            email: row.email,
            subject: row.subject,
            message: row.message,
            created_at: row.created_at.toISOString(),
        })),
        total: count,
    };
};
exports.listContactMessages = listContactMessages;
const createContactMessageService = (payload) => exports.createContactMessage(payload);
exports.createContactMessageService = createContactMessageService;
const getContactMessagesAdmin = (pageSize, offset) => exports.listContactMessages(pageSize, offset);
exports.getContactMessagesAdmin = getContactMessagesAdmin;
const getContactMessageDetailAdmin = async (messageId) => {
    const row = await SequelizeModels.ContactMessageModel.findByPk(messageId);
    if (!row) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Khong tim thay tin nhan lien he");
    }
    return {
        id: row.id,
        full_name: row.full_name,
        phone_number: row.phone_number,
        email: row.email,
        subject: row.subject,
        message: row.message,
        created_at: row.created_at.toISOString(),
    };
};
exports.getContactMessageDetailAdmin = getContactMessageDetailAdmin;
