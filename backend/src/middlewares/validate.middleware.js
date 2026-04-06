const validateBody = (schema) => (req, _res, next) => {
    req.body = schema.parse(req.body);
    next();
};
exports.validateBody = validateBody;
const validateQuery = (schema) => (req, _res, next) => {
    req.query = schema.parse(req.query);
    next();
};
exports.validateQuery = validateQuery;
