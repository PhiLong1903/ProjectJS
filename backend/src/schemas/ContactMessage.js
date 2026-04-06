const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class ContactMessageModel extends sequelize_1.Model {
}
exports.ContactMessageModel = ContactMessageModel;
ContactMessageModel.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true },
    full_name: { type: sequelize_1.DataTypes.STRING(120), allowNull: false },
    phone_number: { type: sequelize_1.DataTypes.STRING(20), allowNull: true },
    email: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    subject: { type: sequelize_1.DataTypes.STRING(180), allowNull: false },
    message: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "contact_messages",
    tableName: "contact_messages",
    timestamps: false,
});
