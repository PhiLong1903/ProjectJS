const { StatusCodes } = require("http-status-codes");

const resolveErrorStatus = (error) => {
  if (typeof error?.statusCode === "number") {
    return error.statusCode;
  }
  if (typeof error?.status === "number") {
    return error.status;
  }
  return StatusCodes.INTERNAL_SERVER_ERROR;
};

const resolveErrorMessage = (error) => {
  if (typeof error?.message === "string" && error.message.trim().length > 0) {
    return error.message;
  }
  return "Internal Server Error";
};

const handleControllerError = (res, error, scope = "controller") => {
  const statusCode = resolveErrorStatus(error);
  const message = resolveErrorMessage(error);
  console.error("[" + scope + "] error:", error);
  return res.status(statusCode).json({ error: message });
};

module.exports = {
  handleControllerError,
};
