const { DataTypes, Sequelize } = require("sequelize");
const connection = require("../utils/connection");
const moment = require("moment");
const { User } = require("./user");
const Joi = require("joi");

const CSRF = connection.define(
  "csrf",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    csrf: {
      type: DataTypes.STRING,
    },
    visited:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    createdAt:{
        type:DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    }
  },
  {
    tableName: "csrf",
    timestamps: false,
  }
);


module.exports = 
  CSRF;
