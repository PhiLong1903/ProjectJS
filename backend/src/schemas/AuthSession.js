const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class AuthSessionModel extends sequelize.Model {
}
exports.AuthSessionModel = AuthSessionModel;
AuthSessionModel.init({
    id: { type: sequelize.DataTypes.UUID, primaryKey: true, defaultValue: sequelize.DataTypes.UUIDV4 },
    user_id: { type: sequelize.DataTypes.UUID, allowNull: false },
    refresh_token_hash: { type: sequelize.DataTypes.CHAR(64), allowNull: false },
    ip_address: { type: sequelize.DataTypes.STRING(64), allowNull: true },
    user_agent: { type: sequelize.DataTypes.TEXT, allowNull: true },
    is_revoked: { type: sequelize.DataTypes.BOOLEAN, allowNull: false },
    expires_at: { type: sequelize.DataTypes.DATE, allowNull: false },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false, defaultValue: sequelize.DataTypes.NOW },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "auth_sessions",
    tableName: "auth_sessions",
    timestamps: false,
});
