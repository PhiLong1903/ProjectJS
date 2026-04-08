const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class AuthLoginAttemptModel extends sequelize.Model {
}
exports.AuthLoginAttemptModel = AuthLoginAttemptModel;
AuthLoginAttemptModel.init({
    email: { type: sequelize.DataTypes.STRING(255), primaryKey: true },
    failed_count: { type: sequelize.DataTypes.INTEGER, allowNull: false },
    first_failed_at: { type: sequelize.DataTypes.DATE, allowNull: true },
    last_failed_at: { type: sequelize.DataTypes.DATE, allowNull: true },
    locked_until: { type: sequelize.DataTypes.DATE, allowNull: true },
    updated_at: { type: sequelize.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "auth_login_attempts",
    tableName: "auth_login_attempts",
    timestamps: false,
});
