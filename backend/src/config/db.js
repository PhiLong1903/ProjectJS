const pg = require("pg");
const env = require("./env");
exports.db = new pg.Pool({
    connectionString: env.env.DATABASE_URL,
    ssl: env.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
const query = async (text, params = []) => exports.db.query(text, params);
exports.query = query;
