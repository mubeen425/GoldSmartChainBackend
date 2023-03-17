const { DataTypes } = require("sequelize");
const connection = require("../utils/connection");
const moment = require("moment");
const { User } = require("./user");
const Joi = require("joi");

const BankDetails = connection.define(
  "bank_details",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    bank_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    account_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bic_swift: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "bank_details",
    timestamps: false,
  }
);

BankDetails.belongsTo(User, {
  as: "user",
  foreignKey: "user_id",
});

function validateR(req) {
  const schema = Joi.object({
    bank_name: Joi.string().required(),
    account_number: Joi.string().required(),
    bic_swift: Joi.string().required(),
    user_id: Joi.number().integer().required(),
  });

  return schema.validate(req);
}

module.exports = {
  BankDetails,
  validateR,
};
