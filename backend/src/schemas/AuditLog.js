const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class AuditLogModel extends sequelize_1.Model {}
exports.AuditLogModel = AuditLogModel;

AuditLogModel.init(
  {
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true, defaultValue: sequelize_1.DataTypes.UUIDV4 },
    action: { type: sequelize_1.DataTypes.STRING(120), allowNull: false },
    actor_user_id: { type: sequelize_1.DataTypes.UUID, allowNull: true },
    actor_email: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    actor_role: { type: sequelize_1.DataTypes.STRING(30), allowNull: true },
    target_type: { type: sequelize_1.DataTypes.STRING(80), allowNull: true },
    target_id: { type: sequelize_1.DataTypes.STRING(120), allowNull: true },
    status: { type: sequelize_1.DataTypes.STRING(20), allowNull: false },
    ip_address: { type: sequelize_1.DataTypes.STRING(64), allowNull: true },
    user_agent: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    metadata: { type: sequelize_1.DataTypes.JSONB, allowNull: false },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
  },
  {
    sequelize: sequelize_2.sequelize,
    modelName: "audit_logs",
    tableName: "audit_logs",
    timestamps: false,
  }
);
