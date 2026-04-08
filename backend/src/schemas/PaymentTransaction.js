const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

class PaymentTransactionModel extends sequelize.Model {
}
exports.PaymentTransactionModel = PaymentTransactionModel;
PaymentTransactionModel.init({
    id: { type: sequelize.DataTypes.UUID, primaryKey: true, defaultValue: sequelize.DataTypes.UUIDV4 },
    appointment_id: { type: sequelize.DataTypes.UUID, allowNull: true },
    patient_id: { type: sequelize.DataTypes.UUID, allowNull: false },
    invoice_code: { type: sequelize.DataTypes.STRING(50), allowNull: false },
    amount: { type: sequelize.DataTypes.DECIMAL(12, 2), allowNull: false },
    payment_method: { type: sequelize.DataTypes.STRING(20), allowNull: false },
    payment_gateway: { type: sequelize.DataTypes.STRING(20), allowNull: false, defaultValue: "DIRECT" },
    gateway_order_code: { type: sequelize.DataTypes.STRING(80), allowNull: true },
    gateway_transaction_code: { type: sequelize.DataTypes.STRING(120), allowNull: true },
    gateway_response: { type: sequelize.DataTypes.JSONB, allowNull: false, defaultValue: {} },
    status: { type: sequelize.DataTypes.STRING(20), allowNull: false, defaultValue: "PENDING" },
    paid_at: { type: sequelize.DataTypes.DATE, allowNull: true },
    reconciled_at: { type: sequelize.DataTypes.DATE, allowNull: true },
    service_snapshot: { type: sequelize.DataTypes.STRING(180), allowNull: false, defaultValue: "Kham tong quat" },
    created_at: { type: sequelize.DataTypes.DATE, allowNull: false, defaultValue: sequelize.DataTypes.NOW },
    updated_at: { type: sequelize.DataTypes.DATE, allowNull: false, defaultValue: sequelize.DataTypes.NOW },
}, {
    sequelize: sequelizeConfig.sequelize,
    modelName: "payment_transactions",
    tableName: "payment_transactions",
    timestamps: false,
});
