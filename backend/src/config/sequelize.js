const sequelize_1 = require("sequelize");
const env_1 = require("./env");
exports.sequelize = new sequelize_1.Sequelize(env_1.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: env_1.env.NODE_ENV === "production"
        ? {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        }
        : undefined,
});
