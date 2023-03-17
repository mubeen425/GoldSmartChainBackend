const { DataTypes, Sequelize } = require("sequelize");
const connection = require("../utils/connection");
const moment = require("moment");
const { User } = require("./user");
const Joi = require("joi");

const Commission = connection.define(
  "commisssion",
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
    transaction_type:{
       type:DataTypes.STRING,
    },
    token_name:{
      type:DataTypes.STRING,
    },
    commision: {
      type: DataTypes.FLOAT,
    },
    requested_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    tableName: "commisssion",
    timestamps: false,
  }
);

Commission.belongsTo(User, {
  as: "user",
  foreignKey: "user_id",
});


module.exports = {
  Commission
};
