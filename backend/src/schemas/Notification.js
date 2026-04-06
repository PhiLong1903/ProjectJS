const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class NotificationModel extends sequelize_1.Model {
}
exports.NotificationModel = NotificationModel;
NotificationModel.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true },
    user_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    title: { type: sequelize_1.DataTypes.STRING(180), allowNull: false },
    message: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    type: { type: sequelize_1.DataTypes.STRING(30), allowNull: false },
    is_read: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "notifications",
    tableName: "notifications",
    timestamps: false,
});
