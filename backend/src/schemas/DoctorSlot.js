const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class DoctorSlotModel extends sequelize.Model {
}
exports.DoctorSlotModel = DoctorSlotModel;
DoctorSlotModel.init({
    id: { type: sequelize.DataTypes.UUID, primaryKey: true },
    doctor_id: { type: sequelize.DataTypes.UUID, allowNull: false },
    slot_date: { type: sequelize.DataTypes.DATEONLY, allowNull: false },
    start_time: { type: sequelize.DataTypes.TIME, allowNull: false },
    end_time: { type: sequelize.DataTypes.TIME, allowNull: false },
    is_available: { type: sequelize.DataTypes.BOOLEAN, allowNull: false },
    is_deleted: { type: sequelize.DataTypes.BOOLEAN, allowNull: false },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "doctor_slots",
    tableName: "doctor_slots",
    timestamps: false,
});
