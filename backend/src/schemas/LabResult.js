const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class LabResultModel extends sequelize.Model {
}
exports.LabResultModel = LabResultModel;
LabResultModel.init({
    id: { type: sequelize.DataTypes.UUID, primaryKey: true },
    patient_id: { type: sequelize.DataTypes.UUID, allowNull: false },
    test_code: { type: sequelize.DataTypes.STRING(50), allowNull: false },
    test_name: { type: sequelize.DataTypes.STRING(255), allowNull: false },
    result_summary: { type: sequelize.DataTypes.STRING(500), allowNull: true },
    result_detail: { type: sequelize.DataTypes.TEXT, allowNull: true },
    conclusion: { type: sequelize.DataTypes.TEXT, allowNull: true },
    status: { type: sequelize.DataTypes.STRING(20), allowNull: false },
    performed_at: { type: sequelize.DataTypes.DATE, allowNull: true },
    is_deleted: { type: sequelize.DataTypes.BOOLEAN, allowNull: false },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "lab_results",
    tableName: "lab_results",
    timestamps: false,
});
