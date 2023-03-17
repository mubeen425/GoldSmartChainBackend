const { DataTypes } = require("sequelize");
const connection = require("../utils/connection");
const moment = require("moment");
const { User } = require("./user");
const Joi = require("joi");

const ExchangeHistory = connection.define(
  "exchange_history",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    from: {
      type: DataTypes.STRING,
    },
    to: {
      type: DataTypes.STRING,
    },
    solid: {
      type: DataTypes.FLOAT,
    },
    stand: {
      type: DataTypes.FLOAT,
    },
  },
  {
    tableName: "exchange_history",
    timestamps: true,
  }
);

ExchangeHistory.belongsTo(User, {
  as: "user",
  foreignKey: "user_id",
});

module.exports = ExchangeHistory;
