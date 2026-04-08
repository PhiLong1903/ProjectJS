const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class UserRoleModel extends sequelize.Model {
}
exports.UserRoleModel = UserRoleModel;
UserRoleModel.init({
    user_id: { type: sequelize.DataTypes.UUID, primaryKey: true },
    role_id: { type: sequelize.DataTypes.UUID, primaryKey: true },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "user_roles",
    tableName: "user_roles",
    timestamps: false,
});
