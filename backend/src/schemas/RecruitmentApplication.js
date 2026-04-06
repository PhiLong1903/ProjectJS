const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class RecruitmentApplicationModel extends sequelize_1.Model {}
exports.RecruitmentApplicationModel = RecruitmentApplicationModel;

RecruitmentApplicationModel.init(
  {
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true, defaultValue: sequelize_1.DataTypes.UUIDV4 },
    full_name: { type: sequelize_1.DataTypes.STRING(120), allowNull: false },
    email: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
    phone_number: { type: sequelize_1.DataTypes.STRING(20), allowNull: false },
    date_of_birth: { type: sequelize_1.DataTypes.DATEONLY, allowNull: true },
    address: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    applied_position: { type: sequelize_1.DataTypes.STRING(180), allowNull: false },
    years_experience: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    current_workplace: { type: sequelize_1.DataTypes.STRING(180), allowNull: true },
    expected_salary: { type: sequelize_1.DataTypes.STRING(120), allowNull: true },
    cover_letter: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    cv_original_name: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
    cv_storage_path: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    cv_mime_type: { type: sequelize_1.DataTypes.STRING(120), allowNull: false },
    cv_size_bytes: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    status: { type: sequelize_1.DataTypes.STRING(20), allowNull: false, defaultValue: "PENDING" },
    reviewed_by: { type: sequelize_1.DataTypes.UUID, allowNull: true },
    reviewed_at: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    feedback_message: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    feedback_sent_at: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
    updated_at: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
  },
  {
    sequelize: sequelize_2.sequelize,
    modelName: "recruitment_applications",
    tableName: "recruitment_applications",
    timestamps: false,
  }
);
