const { DataTypes } = require("sequelize");
const connection = require("../utils/connection");
const moment = require("moment");
const { User } = require("./user");
const Joi = require("joi");

const StandExchangeCoin = connection.define(
  "stand_exchange",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    exchange_coin_amount: {
      type: DataTypes.STRING,
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
    tableName: "stand_exchange",
    timestamps: false,
  }
);

StandExchangeCoin.belongsTo(User, {
  as: "user",
  foreignKey: "user_id",
});

function validateE(req) {
  const schema = Joi.object({
    solid_coin: Joi.required(),
    exchange_coin_amount: Joi.required(),
    user_id: Joi.required(),
  });

  return schema.validate(req);
}

module.exports = {
  StandExchangeCoin,
  validateE,
};
