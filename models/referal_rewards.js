const { DataTypes } = require("sequelize");
const connection = require("../utils/connection");
const moment = require("moment");
const { User } = require("./user");
const Joi = require("joi");

const LevelRewards = connection.define(
  "level_rewards",
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
    level1_reward: {
      type: DataTypes.FLOAT,
    },
    level2_reward: {
        type: DataTypes.FLOAT,
      },
  },
  {
    tableName: "level_rewards",
    timestamps: false,
  }
);

LevelRewards.belongsTo(User, {
  as: "user",
  foreignKey: "user_id",
});

function validateR(req) {
  const schema = Joi.object({
    level1_reward: Joi.required(),
    level2_reward: Joi.required(),
    user_id: Joi.required(),
  });

  return schema.validate(req);
}

module.exports = {
  LevelRewards,
  validateR,
};
