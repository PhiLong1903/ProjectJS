const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class PatientModel extends sequelize.Model {
}
exports.PatientModel = PatientModel;
PatientModel.init({
    id: { type: sequelize.DataTypes.UUID, primaryKey: true },
    user_id: { type: sequelize.DataTypes.UUID, allowNull: false },
    patient_code: { type: sequelize.DataTypes.STRING(30), allowNull: false },
    phone_number: { type: sequelize.DataTypes.STRING(20), allowNull: false },
    date_of_birth: { type: sequelize.DataTypes.DATEONLY, allowNull: true },
    gender: { type: sequelize.DataTypes.STRING(10), allowNull: true },
    address: { type: sequelize.DataTypes.STRING(255), allowNull: true },
    health_insurance_number: { type: sequelize.DataTypes.STRING(30), allowNull: true },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "patients",
    tableName: "patients",
    timestamps: false,
});
