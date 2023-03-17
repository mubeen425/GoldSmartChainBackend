const express = require("express");
const { Op } = require("sequelize");
const router = express.Router();
const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const { Rewards } = require("../models/Rewards");
router.use(IsAdminOrUser);

router.get("/getall", async (req, res) => {
  try {
    const History = await Rewards.findAll();
    return res.send(History);
  } catch (error) {
    return res.send(error.message);
  }
});


router.get("/:user_name", async (req, res) => {
  try {
    if (!req.params.user_name) return res.status(400).send("user_name required");
    const findRewards = await Rewards.findAll({
      where: {[Op.or]: [
        {refer1: req.params.user_name},
        {refer2: req.params.user_name}
      ]},
    });
    const levelrewards = findRewards.map((history, index) => {
      return {
        ...history.toJSON(),
        count: index + 1,
      };
    });
    return res.send(levelrewards);
  } catch (error) {
    return res.send(error.message);
  }
});

module.exports = router;
