const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class AuthSessionModel extends sequelize_1.Model {
}
exports.AuthSessionModel = AuthSessionModel;
AuthSessionModel.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true, defaultValue: sequelize_1.DataTypes.UUIDV4 },
    user_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    refresh_token_hash: { type: sequelize_1.DataTypes.CHAR(64), allowNull: false },
    ip_address: { type: sequelize_1.DataTypes.STRING(64), allowNull: true },
    user_agent: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    is_revoked: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false },
    expires_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "auth_sessions",
    tableName: "auth_sessions",
    timestamps: false,
});
