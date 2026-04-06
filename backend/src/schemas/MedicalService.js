const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class MedicalServiceModel extends sequelize_1.Model {
}
exports.MedicalServiceModel = MedicalServiceModel;
MedicalServiceModel.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true },
    service_code: { type: sequelize_1.DataTypes.STRING(50), allowNull: false },
    name: { type: sequelize_1.DataTypes.STRING(180), allowNull: false },
    slug: { type: sequelize_1.DataTypes.STRING(200), allowNull: false },
    short_description: { type: sequelize_1.DataTypes.STRING(300), allowNull: true },
    description: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    price_from: { type: sequelize_1.DataTypes.DECIMAL(12, 2), allowNull: true },
    is_active: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "medical_services",
    tableName: "medical_services",
    timestamps: false,
});
