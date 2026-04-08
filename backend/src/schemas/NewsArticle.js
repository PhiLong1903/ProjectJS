const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class NewsArticleModel extends sequelize.Model {
}
exports.NewsArticleModel = NewsArticleModel;
NewsArticleModel.init({
    id: { type: sequelize.DataTypes.UUID, primaryKey: true },
    title: { type: sequelize.DataTypes.STRING(220), allowNull: false },
    slug: { type: sequelize.DataTypes.STRING(230), allowNull: false },
    summary: { type: sequelize.DataTypes.STRING(400), allowNull: true },
    content: { type: sequelize.DataTypes.TEXT, allowNull: false },
    thumbnail_url: { type: sequelize.DataTypes.TEXT, allowNull: true },
    is_published: { type: sequelize.DataTypes.BOOLEAN, allowNull: false },
    is_deleted: { type: sequelize.DataTypes.BOOLEAN, allowNull: false },
    published_at: { type: sequelize.DataTypes.DATE, allowNull: true },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "news_articles",
    tableName: "news_articles",
    timestamps: false,
});
