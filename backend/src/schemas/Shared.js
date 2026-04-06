const sequelize_1 = require("sequelize");
const sequelize_2 = require("../config/sequelize");

const modelOptions = (modelName, tableName) => ({
  sequelize: sequelize_2.sequelize,
  modelName,
  tableName,
  timestamps: false,
});

const uuidPrimaryKey = {
  type: sequelize_1.DataTypes.UUID,
  primaryKey: true,
  defaultValue: sequelize_1.DataTypes.UUIDV4,
};

exports.modelOptions = modelOptions;
exports.uuidPrimaryKey = uuidPrimaryKey;
exports.DataTypes = sequelize_1.DataTypes;
exports.Model = sequelize_1.Model;
