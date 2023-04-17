const { DataTypes } = require("sequelize");
const connection = require("../utils/connection");
const moment = require("moment");
const { User } = require("./user");
const Joi = require("joi");

const SolidCoins = connection.define(
  "solid_coins",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    solid_coin: {
      type: DataTypes.STRING,
    },
    req_in_process:{
      type:DataTypes.BOOLEAN,
      defaultValue:false
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
    tableName: "solid_coins",
    timestamps: false,
  }
);

SolidCoins.belongsTo(User, {
  as: "user",
  foreignKey: "user_id",
});

function validateS(req) {
  const schema = Joi.object({
    solid_coin: Joi.required(),
    invest_amount: Joi.required(),
    currecytype:Joi.required(),
    user_id: Joi.required(),
  });

  return schema.validate(req);
}

module.exports = {
  SolidCoins,
  validateS,
};
