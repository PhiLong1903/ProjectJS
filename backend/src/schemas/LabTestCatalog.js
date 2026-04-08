const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class LabTestCatalogModel extends sequelize.Model {
}
exports.LabTestCatalogModel = LabTestCatalogModel;
LabTestCatalogModel.init({
    id: { type: sequelize.DataTypes.UUID, primaryKey: true },
    code: { type: sequelize.DataTypes.STRING(50), allowNull: false },
    name: { type: sequelize.DataTypes.STRING(255), allowNull: false },
    description: { type: sequelize.DataTypes.TEXT, allowNull: true },
    is_active: { type: sequelize.DataTypes.BOOLEAN, allowNull: false },
    is_deleted: { type: sequelize.DataTypes.BOOLEAN, allowNull: false },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "lab_test_catalog",
    tableName: "lab_test_catalog",
    timestamps: false,
});
