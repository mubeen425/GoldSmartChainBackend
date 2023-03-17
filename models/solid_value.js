const { DataTypes,Sequelize } = require("sequelize");
const connection = require("../utils/connection");
const moment = require("moment");
const { User } = require("./user");
const Joi = require("joi");

const SolidValue = connection.define(
  "solid_value",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    value: {
      type: DataTypes.FLOAT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue:  Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    tableName: "solid_value",
    timestamps: false,
  }
);

function validatesv(req) {
  const schema = Joi.object({
    value: Joi.required(),
  });

  return schema.validate(req);
}

module.exports = {
  SolidValue,
  validatesv,
};
