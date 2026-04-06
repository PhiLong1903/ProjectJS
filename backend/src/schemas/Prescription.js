const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class PrescriptionModel extends sequelize_1.Model {
}
exports.PrescriptionModel = PrescriptionModel;
PrescriptionModel.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true },
    appointment_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    doctor_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    patient_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    diagnosis: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    medications: { type: sequelize_1.DataTypes.JSONB, allowNull: false },
    advice: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "prescriptions",
    tableName: "prescriptions",
    timestamps: false,
});
