const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class DoctorReviewModel extends sequelize.Model {
}
exports.DoctorReviewModel = DoctorReviewModel;
DoctorReviewModel.init({
    id: { type: sequelize.DataTypes.UUID, primaryKey: true },
    appointment_id: { type: sequelize.DataTypes.UUID, allowNull: false },
    doctor_id: { type: sequelize.DataTypes.UUID, allowNull: false },
    patient_id: { type: sequelize.DataTypes.UUID, allowNull: false },
    rating: { type: sequelize.DataTypes.INTEGER, allowNull: false },
    comment: { type: sequelize.DataTypes.TEXT, allowNull: true },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "doctor_reviews",
    tableName: "doctor_reviews",
    timestamps: false,
});
