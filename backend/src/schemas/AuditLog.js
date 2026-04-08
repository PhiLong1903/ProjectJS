const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class AuditLogModel extends sequelize.Model {}
exports.AuditLogModel = AuditLogModel;

AuditLogModel.init(
  {
    id: { type: sequelize.DataTypes.UUID, primaryKey: true, defaultValue: sequelize.DataTypes.UUIDV4 },
    action: { type: sequelize.DataTypes.STRING(120), allowNull: false },
    actor_user_id: { type: sequelize.DataTypes.UUID, allowNull: true },
    actor_email: { type: sequelize.DataTypes.STRING(255), allowNull: true },
    actor_role: { type: sequelize.DataTypes.STRING(30), allowNull: true },
    target_type: { type: sequelize.DataTypes.STRING(80), allowNull: true },
    target_id: { type: sequelize.DataTypes.STRING(120), allowNull: true },
    status: { type: sequelize.DataTypes.STRING(20), allowNull: false },
    ip_address: { type: sequelize.DataTypes.STRING(64), allowNull: true },
    user_agent: { type: sequelize.DataTypes.TEXT, allowNull: true },
    metadata: { type: sequelize.DataTypes.JSONB, allowNull: false },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false },
  },
  {
    sequelize: sequelizeConfig.sequelize,
    modelName: "audit_logs",
    tableName: "audit_logs",
    timestamps: false,
  }
);
