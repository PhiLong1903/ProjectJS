const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class ContactMessageModel extends sequelize.Model {
}
exports.ContactMessageModel = ContactMessageModel;
ContactMessageModel.init({
    id: { type: sequelize.DataTypes.UUID, primaryKey: true },
    full_name: { type: sequelize.DataTypes.STRING(120), allowNull: false },
    phone_number: { type: sequelize.DataTypes.STRING(20), allowNull: true },
    email: { type: sequelize.DataTypes.STRING(255), allowNull: true },
    subject: { type: sequelize.DataTypes.STRING(180), allowNull: false },
    message: { type: sequelize.DataTypes.TEXT, allowNull: false },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "contact_messages",
    tableName: "contact_messages",
    timestamps: false,
});
