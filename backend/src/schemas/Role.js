const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class RoleModel extends sequelize.Model {
}
exports.RoleModel = RoleModel;
RoleModel.init({
    id: { type: sequelize.DataTypes.UUID, primaryKey: true },
    name: { type: sequelize.DataTypes.STRING(20), allowNull: false },
    description: { type: sequelize.DataTypes.TEXT, allowNull: true },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "roles",
    tableName: "roles",
    timestamps: false,
});
