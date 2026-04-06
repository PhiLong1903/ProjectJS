const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class AppointmentModel extends sequelize_1.Model {
}
exports.AppointmentModel = AppointmentModel;
AppointmentModel.init({
    id: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
    patient_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    doctor_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    department_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    slot_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    status: { type: sequelize_1.DataTypes.STRING(20), allowNull: false, defaultValue: "PENDING" },
    reason: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    notes: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    diagnosis: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    doctor_note: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    patient_cancel_reason: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    reschedule_note: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    doctor_response_reason: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
    updated_at: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "appointments",
    tableName: "appointments",
    timestamps: false,
});
