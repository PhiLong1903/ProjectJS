const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class DepartmentModel extends sequelize.Model {
}
exports.DepartmentModel = DepartmentModel;
DepartmentModel.init({
    id: { type: sequelize.DataTypes.UUID, primaryKey: true },
    name: { type: sequelize.DataTypes.STRING(150), allowNull: false },
    slug: { type: sequelize.DataTypes.STRING(160), allowNull: false },
    description: { type: sequelize.DataTypes.TEXT, allowNull: true },
    location: { type: sequelize.DataTypes.STRING(255), allowNull: true },
    phone: { type: sequelize.DataTypes.STRING(20), allowNull: true },
    is_active: { type: sequelize.DataTypes.BOOLEAN, allowNull: false },
    is_deleted: { type: sequelize.DataTypes.BOOLEAN, allowNull: false },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "departments",
    tableName: "departments",
    timestamps: false,
});
