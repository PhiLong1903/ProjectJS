const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

class PaymentTransactionModel extends sequelize_1.Model {
}
exports.PaymentTransactionModel = PaymentTransactionModel;
PaymentTransactionModel.init({
    id: { type: sequelize_1.DataTypes.UUID, primaryKey: true, defaultValue: sequelize_1.DataTypes.UUIDV4 },
    appointment_id: { type: sequelize_1.DataTypes.UUID, allowNull: true },
    patient_id: { type: sequelize_1.DataTypes.UUID, allowNull: false },
    invoice_code: { type: sequelize_1.DataTypes.STRING(50), allowNull: false },
    amount: { type: sequelize_1.DataTypes.DECIMAL(12, 2), allowNull: false },
    payment_method: { type: sequelize_1.DataTypes.STRING(20), allowNull: false },
    payment_gateway: { type: sequelize_1.DataTypes.STRING(20), allowNull: false, defaultValue: "DIRECT" },
    gateway_order_code: { type: sequelize_1.DataTypes.STRING(80), allowNull: true },
    gateway_transaction_code: { type: sequelize_1.DataTypes.STRING(120), allowNull: true },
    gateway_response: { type: sequelize_1.DataTypes.JSONB, allowNull: false, defaultValue: {} },
    status: { type: sequelize_1.DataTypes.STRING(20), allowNull: false, defaultValue: "PENDING" },
    paid_at: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    reconciled_at: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    service_snapshot: { type: sequelize_1.DataTypes.STRING(180), allowNull: false, defaultValue: "Kham tong quat" },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
    updated_at: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
}, {
    sequelize: sequelize_2.sequelize,
    modelName: "payment_transactions",
    tableName: "payment_transactions",
    timestamps: false,
});
