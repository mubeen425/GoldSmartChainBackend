const { DataTypes,Sequelize } = require("sequelize");
const connection = require("../utils/connection");
const moment = require("moment");
const Joi = require("joi");
const { User } = require("./user");

const Wallet = connection.define(
  "wallet",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    balance: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue:  Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    tableName: "wallet",
    timestamps: false,
  }
);

Wallet.belongsTo(User, {
  as: "user",
  foreignKey: "user_id",
});

function validateWallet(req) {
  const schema = Joi.object({
    balance: Joi.required(),
    user_id: Joi.required(),
  });

  return schema.validate(req);
}

module.exports = {
  Wallet,
  validateWallet,
};
