const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class MedicineModel extends sequelize.Model {
}
exports.MedicineModel = MedicineModel;
MedicineModel.init({
    id: { type: sequelize.DataTypes.UUID, primaryKey: true },
    code: { type: sequelize.DataTypes.STRING(50), allowNull: false },
    name: { type: sequelize.DataTypes.STRING(255), allowNull: false },
    unit: { type: sequelize.DataTypes.STRING(50), allowNull: true },
    description: { type: sequelize.DataTypes.TEXT, allowNull: true },
    is_active: { type: sequelize.DataTypes.BOOLEAN, allowNull: false },
    is_deleted: { type: sequelize.DataTypes.BOOLEAN, allowNull: false },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "medicines",
    tableName: "medicines",
    timestamps: false,
});
