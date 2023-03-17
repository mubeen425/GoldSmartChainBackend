const { DataTypes,Sequelize } = require("sequelize");
const connection = require("../utils/connection");
const moment = require("moment");
const { User } = require("./user");
const Joi = require("joi");

const WithdrawCrypto = connection.define(
  "withdraw_crypto_requests",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    wallet_address: {
      type: DataTypes.STRING,
    },
    token_name: {
      type: DataTypes.STRING,
    },
    amount: {
      type: DataTypes.FLOAT,
    },
    requested_at: {
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
    tableName: "withdraw_crypto_requests",
    timestamps: false,
  }
);

WithdrawCrypto.belongsTo(User, {
  as: "user",
  foreignKey: "user_id",
});

function validateDC(req) {
  const schema = Joi.object({
    wallet_address: Joi.required(),
    token_name: Joi.required(),
    amount: Joi.required(),
    user_id: Joi.required(),
  });

  return schema.validate(req);
}

module.exports = {
  WithdrawCrypto,
  validateDC,
};
