const pg_1 = require("pg");
const env_1 = require("./env");
exports.db = new pg_1.Pool({
    connectionString: env_1.env.DATABASE_URL,
    ssl: env_1.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
const query = async (text, params = []) => exports.db.query(text, params);
exports.query = query;
