require("express-async-errors");
const express = require("express");
const { Op } = require("sequelize");
const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const { LevelRewards,validateR } = require("../models/referal_rewards");
const { User } = require("../models/user");
const router = express.Router();
router.use(IsAdminOrUser);

router.get("/", async (req, res) => {
  try {
    const userLevelReward = await LevelRewards.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "user_name",
            "first_name",
            "last_name",
            "email",
            "contact",
            "level",
            "created_at",
          ],
        },
      ],
    });

    const userLevels = userLevelReward.map((history, index) => {
      return {
        ...history.toJSON(),
        count: index + 1,
      };
    });

    return res.status(200).send(userLevels);
  } catch (error) {
    return res.send({ message: error.message });
  }
});

router.get("/:user_id", async (req, res) => {
  try {
    if(!req.params.user_id) return res.status(400).send("User id is required.")
    const userLevelReward = await LevelRewards.findOne({where:{
        user_id:req.params.user_id
    }});

    if(!userLevelReward) return res.status(400).send({})

    return res.status(200).send(userLevelReward);
  } catch (error) {
    return res.send({ message: error.message });
  }
});


router.post("/", async (req, res) => {
  try {
      const { error } = validateR(req.body);
      if (error) return res.status(400).send(error.details[0].message);

      const userReward=await LevelRewards.findOne({where:{user_id:req.body.user_id}});

      if(!userReward){
        const levelReward=await LevelRewards.create(req.body);
        return res.send(levelReward);
      }else{
        userReward.level1_reward=req.body.level1_reward;
        userReward.level2_reward=req.body.level2_reward;
        const updatedRewards=await userReward.save();
        return res.send(updatedRewards);
      }
  } catch (error) {
    return res.send(error.message);
  }
});

module.exports = router;
