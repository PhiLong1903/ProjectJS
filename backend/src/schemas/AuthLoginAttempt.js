const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class AuthLoginAttemptModel extends sequelize_1.Model {
}
exports.AuthLoginAttemptModel = AuthLoginAttemptModel;
AuthLoginAttemptModel.init({
    email: { type: sequelize_1.DataTypes.STRING(255), primaryKey: true },
    failed_count: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    first_failed_at: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    last_failed_at: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    locked_until: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    updated_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "auth_login_attempts",
    tableName: "auth_login_attempts",
    timestamps: false,
});
