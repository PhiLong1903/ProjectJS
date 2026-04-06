const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class UserModel extends sequelize_1.Model {
}
exports.UserModel = UserModel;
UserModel.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true },
    email: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
    full_name: { type: sequelize_1.DataTypes.STRING(120), allowNull: false },
    password_hash: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
    password_reset_token: { type: sequelize_1.DataTypes.STRING(64), allowNull: true },
    password_reset_expires: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    is_active: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false },
    last_login_at: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "users",
    tableName: "users",
    timestamps: false,
});
