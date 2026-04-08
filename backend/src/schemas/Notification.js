const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class NotificationModel extends sequelize.Model {
}
exports.NotificationModel = NotificationModel;
NotificationModel.init({
    id: { type: sequelize.DataTypes.UUID, primaryKey: true },
    user_id: { type: sequelize.DataTypes.UUID, allowNull: false },
    title: { type: sequelize.DataTypes.STRING(180), allowNull: false },
    message: { type: sequelize.DataTypes.TEXT, allowNull: false },
    type: { type: sequelize.DataTypes.STRING(30), allowNull: false },
    is_read: { type: sequelize.DataTypes.BOOLEAN, allowNull: false },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "notifications",
    tableName: "notifications",
    timestamps: false,
});
