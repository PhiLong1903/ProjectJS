const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class CmsPageModel extends sequelize_1.Model {
}
exports.CmsPageModel = CmsPageModel;
CmsPageModel.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true },
    page_key: { type: sequelize_1.DataTypes.STRING(50), allowNull: false },
    title: { type: sequelize_1.DataTypes.STRING(180), allowNull: false },
    content: { type: sequelize_1.DataTypes.JSONB, allowNull: false },
    updated_by: { type: sequelize_1.DataTypes.UUID, allowNull: true },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "cms_pages",
    tableName: "cms_pages",
    timestamps: false,
});
