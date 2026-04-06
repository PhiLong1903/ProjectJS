const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class DepartmentModel extends sequelize_1.Model {
}
exports.DepartmentModel = DepartmentModel;
DepartmentModel.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true },
    name: { type: sequelize_1.DataTypes.STRING(150), allowNull: false },
    slug: { type: sequelize_1.DataTypes.STRING(160), allowNull: false },
    description: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    location: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    phone: { type: sequelize_1.DataTypes.STRING(20), allowNull: true },
    is_active: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "departments",
    tableName: "departments",
    timestamps: false,
});
