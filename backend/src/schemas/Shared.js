const sequelize = require("sequelize");
const sequelizeConfig = require("../config/sequelize");

const modelOptions = (modelName, tableName) => ({
  sequelize: sequelizeConfig.sequelize,
  modelName,
  tableName,
  timestamps: false,
});

const uuidPrimaryKey = {
  type: sequelize.DataTypes.UUID,
  primaryKey: true,
  defaultValue: sequelize.DataTypes.UUIDV4,
};

exports.modelOptions = modelOptions;
exports.uuidPrimaryKey = uuidPrimaryKey;
exports.DataTypes = sequelize.DataTypes;
exports.Model = sequelize.Model;
