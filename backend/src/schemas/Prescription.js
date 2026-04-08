const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class PrescriptionModel extends sequelize.Model {
}
exports.PrescriptionModel = PrescriptionModel;
PrescriptionModel.init({
    id: { type: sequelize.DataTypes.UUID, primaryKey: true },
    appointment_id: { type: sequelize.DataTypes.UUID, allowNull: false },
    doctor_id: { type: sequelize.DataTypes.UUID, allowNull: false },
    patient_id: { type: sequelize.DataTypes.UUID, allowNull: false },
    diagnosis: { type: sequelize.DataTypes.TEXT, allowNull: true },
    medications: { type: sequelize.DataTypes.JSONB, allowNull: false },
    advice: { type: sequelize.DataTypes.TEXT, allowNull: true },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "prescriptions",
    tableName: "prescriptions",
    timestamps: false,
});
