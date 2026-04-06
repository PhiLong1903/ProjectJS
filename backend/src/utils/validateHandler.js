const withValidation = (pick, schema) => {
    const validate = (req, _res, next) => {
        const parsed = schema.parse(req[pick]);
        const validatedReq = req;
        validatedReq.validated = {
            ...(validatedReq.validated ?? {}),
            [pick]: parsed,
        };
        req[pick] = parsed;
        next();
    };
    return [validate, exports.validatedResult];
};
const validateBody = (schema) => withValidation("body", schema);
exports.validateBody = validateBody;
const validateQuery = (schema) => withValidation("query", schema);
exports.validateQuery = validateQuery;
const validatedResult = (_req, _res, next) => {
    next();
};
exports.validatedResult = validatedResult;
