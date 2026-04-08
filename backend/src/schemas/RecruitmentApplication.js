const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class RecruitmentApplicationModel extends sequelize.Model {}
exports.RecruitmentApplicationModel = RecruitmentApplicationModel;

RecruitmentApplicationModel.init(
  {
    id: { type: sequelize.DataTypes.UUID, primaryKey: true, defaultValue: sequelize.DataTypes.UUIDV4 },
    full_name: { type: sequelize.DataTypes.STRING(120), allowNull: false },
    email: { type: sequelize.DataTypes.STRING(255), allowNull: false },
    phone_number: { type: sequelize.DataTypes.STRING(20), allowNull: false },
    date_of_birth: { type: sequelize.DataTypes.DATEONLY, allowNull: true },
    address: { type: sequelize.DataTypes.STRING(255), allowNull: true },
    applied_position: { type: sequelize.DataTypes.STRING(180), allowNull: false },
    years_experience: { type: sequelize.DataTypes.INTEGER, allowNull: true },
    current_workplace: { type: sequelize.DataTypes.STRING(180), allowNull: true },
    expected_salary: { type: sequelize.DataTypes.STRING(120), allowNull: true },
    cover_letter: { type: sequelize.DataTypes.TEXT, allowNull: true },
    cv_original_name: { type: sequelize.DataTypes.STRING(255), allowNull: false },
    cv_storage_path: { type: sequelize.DataTypes.TEXT, allowNull: false },
    cv_mime_type: { type: sequelize.DataTypes.STRING(120), allowNull: false },
    cv_size_bytes: { type: sequelize.DataTypes.INTEGER, allowNull: false },
    status: { type: sequelize.DataTypes.STRING(20), allowNull: false, defaultValue: "PENDING" },
    reviewed_by: { type: sequelize.DataTypes.UUID, allowNull: true },
    reviewed_at: { type: sequelize.DataTypes.DATE, allowNull: true },
    feedback_message: { type: sequelize.DataTypes.TEXT, allowNull: true },
    feedback_sent_at: { type: sequelize.DataTypes.DATE, allowNull: true },
    is_deleted: { type: sequelize.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false, defaultValue: sequelize.DataTypes.NOW },
    updated_at: { type: sequelize.DataTypes.DATE, allowNull: false, defaultValue: sequelize.DataTypes.NOW },
  },
  {
    sequelize: sequelizeConfig.sequelize,
    modelName: "recruitment_applications",
    tableName: "recruitment_applications",
    timestamps: false,
  }
);
