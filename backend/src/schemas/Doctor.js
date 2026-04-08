const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class DoctorModel extends sequelize.Model {
}
exports.DoctorModel = DoctorModel;
DoctorModel.init({
    id: { type: sequelize.DataTypes.UUID, primaryKey: true },
    user_id: { type: sequelize.DataTypes.UUID, allowNull: true },
    doctor_code: { type: sequelize.DataTypes.STRING(30), allowNull: false },
    full_name: { type: sequelize.DataTypes.STRING(120), allowNull: false },
    specialty: { type: sequelize.DataTypes.STRING(255), allowNull: true },
    department_id: { type: sequelize.DataTypes.UUID, allowNull: false },
    experience_years: { type: sequelize.DataTypes.INTEGER, allowNull: true },
    qualifications: { type: sequelize.DataTypes.TEXT, allowNull: true },
    description: { type: sequelize.DataTypes.TEXT, allowNull: true },
    avatar_url: { type: sequelize.DataTypes.TEXT, allowNull: true },
    is_active: { type: sequelize.DataTypes.BOOLEAN, allowNull: false },
    is_deleted: { type: sequelize.DataTypes.BOOLEAN, allowNull: false },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "doctors",
    tableName: "doctors",
    timestamps: false,
});
