const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class NotificationJobModel extends sequelize.Model {}
exports.NotificationJobModel = NotificationJobModel;

NotificationJobModel.init(
  {
    id: { type: sequelize.DataTypes.UUID, primaryKey: true, defaultValue: sequelize.DataTypes.UUIDV4 },
    notification_id: { type: sequelize.DataTypes.UUID, allowNull: false },
    user_id: { type: sequelize.DataTypes.UUID, allowNull: false },
    channel: { type: sequelize.DataTypes.STRING(20), allowNull: false },
    status: { type: sequelize.DataTypes.STRING(20), allowNull: false },
    attempt_count: { type: sequelize.DataTypes.INTEGER, allowNull: false },
    max_attempts: { type: sequelize.DataTypes.INTEGER, allowNull: false },
    last_error: { type: sequelize.DataTypes.TEXT, allowNull: true },
    next_retry_at: { type: sequelize.DataTypes.DATE, allowNull: true },
    processed_at: { type: sequelize.DataTypes.DATE, allowNull: true },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize.DataTypes.DATE, allowNull: false },
  },
  {
    sequelize: sequelizeConfig.sequelize,
    modelName: "notification_jobs",
    tableName: "notification_jobs",
    timestamps: false,
  }
);
