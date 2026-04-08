const sequelize = require("sequelize");
const env = require("./env");
exports.sequelize = new sequelize.Sequelize(env.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: env.env.NODE_ENV === "production"
        ? {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        }
        : undefined,
});
