const { DataTypes } = require("sequelize");
const connection = require("../utils/connection");
const moment = require("moment");
const { User } = require("./user");
const Joi = require("joi");

const Rewards = connection.define(
  "rewards",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    refered_to: {
      type: DataTypes.STRING,
    },
    refer1: {
      type: DataTypes.STRING,
    },
    refer2: {
      type: DataTypes.STRING,
    },
    refer1_wallet_address: {
      type: DataTypes.STRING,
    },
    refer2_wallet_address: {
      type: DataTypes.STRING,
    },
    reward1: {
      type: DataTypes.STRING,
    },
    reward2: {
      type: DataTypes.STRING,
    },
    type:{
      type:DataTypes.STRING,
      defaultValue:"pending"
    },
    issue_at:{
      type:DataTypes.DATE,
      defaultValue: moment().add(1,'M').format("YYYY-MM-DD HH:mm")
    }
  },
  {
    tableName: "rewards",
    timestamps: true,
  }
);



function validateR(req) {
  const schema = Joi.object({
    reward: Joi.required(),
    referedto: Joi.required(),
  });

  return schema.validate(req);
}

module.exports = {
  Rewards,
  validateR,
};
