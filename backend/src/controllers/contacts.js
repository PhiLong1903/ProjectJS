const http_status_codes_1 = require("http-status-codes");
const api_response_1 = require("../utils/api-response");
const pagination_1 = require("../utils/pagination");
const contacts_service_1 = require("../service/contacts.service");
const { handleControllerError } = require("../utils/controller-error");
exports.createContactMessageController = async (req, res, next) => {
    try {
            const data = await contacts_service_1.createContactMessageService(req.body);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.CREATED, "Gui lien he thanh cong", data);
    }
    catch (error) {
        return handleControllerError(res, error, "contacts");
    }
};
exports.listContactMessagesController = async (req, res, next) => {
    try {
            const { page, pageSize, offset } = pagination_1.getPaginationParams(req);
            const result = await contacts_service_1.getContactMessagesAdmin(pageSize, offset);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Lay danh sach lien he thanh cong", result.rows, pagination_1.toPaginationMeta(page, pageSize, result.total));
    }
    catch (error) {
        return handleControllerError(res, error, "contacts");
    }
};
exports.contactMessageDetailController = async (req, res, next) => {
    try {
            const data = await contacts_service_1.getContactMessageDetailAdmin(req.params.messageId);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Lay chi tiet lien he thanh cong", data);
    }
    catch (error) {
        return handleControllerError(res, error, "contacts");
    }
};
