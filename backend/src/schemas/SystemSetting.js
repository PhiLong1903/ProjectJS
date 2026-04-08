const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class SystemSettingModel extends sequelize.Model {
}
exports.SystemSettingModel = SystemSettingModel;
SystemSettingModel.init({
    key: { type: sequelize.DataTypes.STRING(80), primaryKey: true },
    value: { type: sequelize.DataTypes.JSONB, allowNull: false },
    description: { type: sequelize.DataTypes.TEXT, allowNull: true },
    updated_at: { type: sequelize.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "system_settings",
    tableName: "system_settings",
    timestamps: false,
});
