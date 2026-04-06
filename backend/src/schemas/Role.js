const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class RoleModel extends sequelize_1.Model {
}
exports.RoleModel = RoleModel;
RoleModel.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true },
    name: { type: sequelize_1.DataTypes.STRING(20), allowNull: false },
    description: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "roles",
    tableName: "roles",
    timestamps: false,
});
