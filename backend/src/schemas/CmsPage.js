const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class CmsPageModel extends sequelize.Model {
}
exports.CmsPageModel = CmsPageModel;
CmsPageModel.init({
    id: { type: sequelize.DataTypes.UUID, primaryKey: true },
    page_key: { type: sequelize.DataTypes.STRING(50), allowNull: false },
    title: { type: sequelize.DataTypes.STRING(180), allowNull: false },
    content: { type: sequelize.DataTypes.JSONB, allowNull: false },
    updated_by: { type: sequelize.DataTypes.UUID, allowNull: true },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "cms_pages",
    tableName: "cms_pages",
    timestamps: false,
});
