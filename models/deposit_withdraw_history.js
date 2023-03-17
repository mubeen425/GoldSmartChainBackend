const { DataTypes } = require("sequelize");
const connection = require("../utils/connection");
const moment = require("moment");
const { User } = require("./user");
const Joi = require("joi");

const DepositWithdrawHistory = connection.define(
  "deposit_withdraw_hitory",
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
    amount: {
      type: DataTypes.FLOAT,
    },
    status: {
      type: DataTypes.STRING,
    },
    status_description: {
      type: DataTypes.TEXT,
      defaultValue: "Wait while we process your request",
    },
    at: {
      type: DataTypes.DATE,
      defaultValue: moment().format("YYYY-MM-DD HH:mm"),
    },
  },
  {
    tableName: "deposit_withdraw_hitory",
    timestamps: false,
  }
);

DepositWithdrawHistory.belongsTo(User, {
  as: "user",
  foreignKey: "user_id",
});

// function validateW(req) {
//   const schema = Joi.object({
//     amount: Joi.required(),
//     user_id: Joi.required(),
//   });

//   return schema.validate(req);
// }

module.exports = DepositWithdrawHistory;
