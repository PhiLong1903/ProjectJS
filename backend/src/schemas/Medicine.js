const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class MedicineModel extends sequelize_1.Model {
}
exports.MedicineModel = MedicineModel;
MedicineModel.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true },
    code: { type: sequelize_1.DataTypes.STRING(50), allowNull: false },
    name: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
    unit: { type: sequelize_1.DataTypes.STRING(50), allowNull: true },
    description: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    is_active: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "medicines",
    tableName: "medicines",
    timestamps: false,
});
