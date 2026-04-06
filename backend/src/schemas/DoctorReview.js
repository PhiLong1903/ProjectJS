const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class DoctorReviewModel extends sequelize_1.Model {
}
exports.DoctorReviewModel = DoctorReviewModel;
DoctorReviewModel.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true },
    appointment_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    doctor_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    patient_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    rating: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    comment: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "doctor_reviews",
    tableName: "doctor_reviews",
    timestamps: false,
});
