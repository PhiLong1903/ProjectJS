const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class NotificationJobModel extends sequelize_1.Model {}
exports.NotificationJobModel = NotificationJobModel;

NotificationJobModel.init(
  {
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true, defaultValue: sequelize_1.DataTypes.UUIDV4 },
    notification_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    user_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    channel: { type: sequelize_1.DataTypes.STRING(20), allowNull: false },
    status: { type: sequelize_1.DataTypes.STRING(20), allowNull: false },
    attempt_count: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    max_attempts: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    last_error: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    next_retry_at: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    processed_at: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
  },
  {
    sequelize: sequelize_2.sequelize,
    modelName: "notification_jobs",
    tableName: "notification_jobs",
    timestamps: false,
  }
);
