const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class NewsArticleModel extends sequelize_1.Model {
}
exports.NewsArticleModel = NewsArticleModel;
NewsArticleModel.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true },
    title: { type: sequelize_1.DataTypes.STRING(220), allowNull: false },
    slug: { type: sequelize_1.DataTypes.STRING(230), allowNull: false },
    summary: { type: sequelize_1.DataTypes.STRING(400), allowNull: true },
    content: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    thumbnail_url: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    is_published: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false },
    is_deleted: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false },
    published_at: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    updated_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "news_articles",
    tableName: "news_articles",
    timestamps: false,
});
