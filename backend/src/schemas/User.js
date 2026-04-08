const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class UserModel extends sequelize.Model {
}
exports.UserModel = UserModel;
UserModel.init({
    id: { type: sequelize.DataTypes.UUID, primaryKey: true },
    email: { type: sequelize.DataTypes.STRING(255), allowNull: false },
    full_name: { type: sequelize.DataTypes.STRING(120), allowNull: false },
    password_hash: { type: sequelize.DataTypes.STRING(255), allowNull: false },
    password_reset_token: { type: sequelize.DataTypes.STRING(64), allowNull: true },
    password_reset_expires: { type: sequelize.DataTypes.DATE, allowNull: true },
    is_active: { type: sequelize.DataTypes.BOOLEAN, allowNull: false },
    is_deleted: { type: sequelize.DataTypes.BOOLEAN, allowNull: false },
    last_login_at: { type: sequelize.DataTypes.DATE, allowNull: true },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "users",
    tableName: "users",
    timestamps: false,
});
