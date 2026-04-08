const http_status_codes = require("http-status-codes");
const api_response = require("../utils/api-response");
const pagination = require("../utils/pagination");
const contacts_service = require("../service/contacts.service");
const { handleControllerError } = require("../utils/controller-error");
exports.createContactMessageController = async (req, res, next) => {
    try {
            const data = await contacts_service.createContactMessageService(req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.CREATED, "Gui lien he thanh cong", data);
    }
    catch (error) {
        return handleControllerError(res, error, "contacts");
    }
};
exports.listContactMessagesController = async (req, res, next) => {
    try {
            const { page, pageSize, offset } = pagination.getPaginationParams(req);
            const result = await contacts_service.getContactMessagesAdmin(pageSize, offset);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lay danh sach lien he thanh cong", result.rows, pagination.toPaginationMeta(page, pageSize, result.total));
    }
    catch (error) {
        return handleControllerError(res, error, "contacts");
    }
};
exports.contactMessageDetailController = async (req, res, next) => {
    try {
            const data = await contacts_service.getContactMessageDetailAdmin(req.params.messageId);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lay chi tiet lien he thanh cong", data);
    }
    catch (error) {
        return handleControllerError(res, error, "contacts");
    }
};
