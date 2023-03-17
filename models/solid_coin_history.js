const { DataTypes } = require("sequelize");
const connection = require("../utils/connection");
const moment = require("moment");
const { User } = require("./user");
const Joi = require("joi");

const SolidHisoty = connection.define(
  "solid_coin_history",
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
    invest_amount: {
      type: DataTypes.FLOAT,
    },
    solid_coin: {
      type: DataTypes.FLOAT,
    },
    type: {
      type: DataTypes.STRING,
    },
    status:{
      type:DataTypes.STRING,
      defaultValue:"pending"
    },
    status_description: {
      type: DataTypes.TEXT,
      defaultValue: "Wait while we process your request",
    },
  },
  {
    tableName: "solid_coin_history",
    timestamps: true,
  }
);

SolidHisoty.belongsTo(User, {
  as: "user",
  foreignKey: "user_id",
});

module.exports = SolidHisoty;
