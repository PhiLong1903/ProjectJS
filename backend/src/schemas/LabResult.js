const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class LabResultModel extends sequelize_1.Model {
}
exports.LabResultModel = LabResultModel;
LabResultModel.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true },
    patient_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    test_code: { type: sequelize_1.DataTypes.STRING(50), allowNull: false },
    test_name: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
    result_summary: { type: sequelize_1.DataTypes.STRING(500), allowNull: true },
    result_detail: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    conclusion: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    status: { type: sequelize_1.DataTypes.STRING(20), allowNull: false },
    performed_at: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "lab_results",
    tableName: "lab_results",
    timestamps: false,
});
