const express = require("express");
const config=require("config");
const {DepositCrypto}= require("../models/deposit_crypto");
const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const { User } = require("../models/user");
const { Op } = require("sequelize");
const router = express.Router();
router.use(IsAdminOrUser);

router.get("/:user_id", async (req, res) => {
    try {
      const getAllRequests = await DepositCrypto.findAll({
        where: {
          user_id: req.params.user_id,
          wallet_address: {
            [Op.notIn]: [
              "0x40cab105165Ffac6A2df6Fd60BCbb92eb8657F8D",
              "0x270E643B6cd79c08f141CfEb5aF4B17e5D49293c",
            ],
          },
        },
        order: [["requested_at", "DESC"]],
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
            ],
          },
        ],
      });
      const depositRequests = getAllRequests.map((request, index) => {
        return {
          ...request.toJSON(),
          count: index + 1,
        };
      });
      return res.send(depositRequests);
    } catch (error) {
      return res.send({ message: error.message });
    }
  });

  module.exports=router;