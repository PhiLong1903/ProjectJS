const { StatusCodes } = require("http-status-codes");
const { sendSuccess } = require("../utils/api-response");
const { lookupPatientRecordService } = require("../service/patient-records.service");
const { handleControllerError } = require("../utils/controller-error");

exports.lookupPatientRecordController = async (req, res, _next) => {
  try {
    const data = await lookupPatientRecordService(req.body);
    return sendSuccess(res, StatusCodes.OK, "Tra cuu ho so kham benh thanh cong", data);
  } catch (error) {
    return handleControllerError(res, error, "patient-records");
  }
};
