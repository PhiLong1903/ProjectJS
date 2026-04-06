const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class DoctorModel extends sequelize_1.Model {
}
exports.DoctorModel = DoctorModel;
DoctorModel.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true },
    user_id: { type: sequelize_1.DataTypes.UUID, allowNull: true },
    doctor_code: { type: sequelize_1.DataTypes.STRING(30), allowNull: false },
    full_name: { type: sequelize_1.DataTypes.STRING(120), allowNull: false },
    specialty: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    department_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    experience_years: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    qualifications: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    description: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    avatar_url: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    is_active: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "doctors",
    tableName: "doctors",
    timestamps: false,
});
