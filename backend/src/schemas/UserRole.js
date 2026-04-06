const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class UserRoleModel extends sequelize_1.Model {
}
exports.UserRoleModel = UserRoleModel;
UserRoleModel.init({
    user_id: { type: sequelize_1.DataTypes.UUID, primaryKey: true },
    role_id: { type: sequelize_1.DataTypes.UUID, primaryKey: true },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "user_roles",
    tableName: "user_roles",
    timestamps: false,
});
