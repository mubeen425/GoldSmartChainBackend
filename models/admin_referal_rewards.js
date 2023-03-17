const { DataTypes } = require("sequelize");
const connection = require("../utils/connection");
const moment = require("moment");
const { User } = require("./user");
const Joi = require("joi");

const AdminReferalRewards = connection.define(
  "admin_Referal_Rewards",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    level1_reward: {
      type: DataTypes.FLOAT,
    },
    level2_reward: {
        type: DataTypes.FLOAT,
      },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: moment().format("YYYY-MM-DD HH:mm"),
    },
  },
  {
    tableName: "admin_Referal_Rewards",
    timestamps: false,
  }
);

function validateAr(req) {
  const schema = Joi.object({
    level1_reward: Joi.required(),
    level2_reward: Joi.required(),
  });

  return schema.validate(req);
}

module.exports = {
  AdminReferalRewards,
  validateAr,
};
