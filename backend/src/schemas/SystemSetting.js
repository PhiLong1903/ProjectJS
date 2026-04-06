const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class SystemSettingModel extends sequelize_1.Model {
}
exports.SystemSettingModel = SystemSettingModel;
SystemSettingModel.init({
    key: { type: sequelize_1.DataTypes.STRING(80), primaryKey: true },
    value: { type: sequelize_1.DataTypes.JSONB, allowNull: false },
    description: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    updated_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "system_settings",
    tableName: "system_settings",
    timestamps: false,
});
