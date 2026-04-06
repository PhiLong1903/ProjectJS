const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class DoctorSlotModel extends sequelize_1.Model {
}
exports.DoctorSlotModel = DoctorSlotModel;
DoctorSlotModel.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true },
    doctor_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    slot_date: { type: sequelize_1.DataTypes.DATEONLY, allowNull: false },
    start_time: { type: sequelize_1.DataTypes.TIME, allowNull: false },
    end_time: { type: sequelize_1.DataTypes.TIME, allowNull: false },
    is_available: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "doctor_slots",
    tableName: "doctor_slots",
    timestamps: false,
});
