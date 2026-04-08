const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class AppointmentModel extends sequelize.Model {
}
exports.AppointmentModel = AppointmentModel;
AppointmentModel.init({
    id: { type: sequelize.DataTypes.UUID, defaultValue: sequelize.DataTypes.UUIDV4, primaryKey: true },
    patient_id: { type: sequelize.DataTypes.UUID, allowNull: false },
    doctor_id: { type: sequelize.DataTypes.UUID, allowNull: false },
    department_id: { type: sequelize.DataTypes.UUID, allowNull: false },
    slot_id: { type: sequelize.DataTypes.UUID, allowNull: false },
    status: { type: sequelize.DataTypes.STRING(20), allowNull: false, defaultValue: "PENDING" },
    reason: { type: sequelize.DataTypes.TEXT, allowNull: true },
    notes: { type: sequelize.DataTypes.TEXT, allowNull: true },
    diagnosis: { type: sequelize.DataTypes.TEXT, allowNull: true },
    doctor_note: { type: sequelize.DataTypes.TEXT, allowNull: true },
    patient_cancel_reason: { type: sequelize.DataTypes.TEXT, allowNull: true },
    reschedule_note: { type: sequelize.DataTypes.TEXT, allowNull: true },
    doctor_response_reason: { type: sequelize.DataTypes.TEXT, allowNull: true },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false, defaultValue: sequelize.DataTypes.NOW },
    updated_at: { type: sequelize.DataTypes.DATE, allowNull: false, defaultValue: sequelize.DataTypes.NOW },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "appointments",
    tableName: "appointments",
    timestamps: false,
});
