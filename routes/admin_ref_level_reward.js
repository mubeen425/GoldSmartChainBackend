const express = require("express");
const {
  AdminReferalRewards,
  validateAr,
} = require("../models/admin_referal_rewards");
const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const router = express.Router();
router.use(IsAdminOrUser);
router.get("/", async (req, res) => {
  try {
    const getValue = await AdminReferalRewards.findAll({});
    if (!getValue.length > 0) {
      const rev = await AdminReferalRewards.create({
        level1_reward: 2,
        level2_reward: 2,
      });
      return res.send(rev);
    }
    return res.send(getValue[0]);
  } catch (error) {
    return res.send({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { error } = validateAr(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const Reward = await AdminReferalRewards.findOne({
      where: { id: req.params.id },
    });

    Reward.level1_reward = req.body.level1_reward;
    Reward.level2_reward = req.body.level2_reward;
    const updatedRewards = await Reward.save();
    return res.send(updatedRewards);
  } catch (error) {
    return res.send({ message: error.message });
  }
});

module.exports = router;
