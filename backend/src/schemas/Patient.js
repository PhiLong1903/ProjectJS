const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class PatientModel extends sequelize_1.Model {
}
exports.PatientModel = PatientModel;
PatientModel.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true },
    user_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    patient_code: { type: sequelize_1.DataTypes.STRING(30), allowNull: false },
    phone_number: { type: sequelize_1.DataTypes.STRING(20), allowNull: false },
    date_of_birth: { type: sequelize_1.DataTypes.DATEONLY, allowNull: true },
    gender: { type: sequelize_1.DataTypes.STRING(10), allowNull: true },
    address: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    health_insurance_number: { type: sequelize_1.DataTypes.STRING(30), allowNull: true },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "patients",
    tableName: "patients",
    timestamps: false,
});
