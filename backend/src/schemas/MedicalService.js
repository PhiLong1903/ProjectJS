const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class MedicalServiceModel extends sequelize.Model {
}
exports.MedicalServiceModel = MedicalServiceModel;
MedicalServiceModel.init({
    id: { type: sequelize.DataTypes.UUID, primaryKey: true },
    service_code: { type: sequelize.DataTypes.STRING(50), allowNull: false },
    name: { type: sequelize.DataTypes.STRING(180), allowNull: false },
    slug: { type: sequelize.DataTypes.STRING(200), allowNull: false },
    short_description: { type: sequelize.DataTypes.STRING(300), allowNull: true },
    description: { type: sequelize.DataTypes.TEXT, allowNull: true },
    price_from: { type: sequelize.DataTypes.DECIMAL(12, 2), allowNull: true },
    is_active: { type: sequelize.DataTypes.BOOLEAN, allowNull: false },
    is_deleted: { type: sequelize.DataTypes.BOOLEAN, allowNull: false },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "medical_services",
    tableName: "medical_services",
    timestamps: false,
});
