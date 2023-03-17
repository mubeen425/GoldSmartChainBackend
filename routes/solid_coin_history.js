const express = require("express");
const router = express.Router();
const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const SolidHisoty = require("../models/solid_coin_history");
const { User } = require("../models/user");
router.use(IsAdminOrUser);

router.get("/getall", async (req, res) => {
  try {
    const History = await SolidHisoty.findAll({
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
    return res.send(History);
  } catch (error) {
    return res.send(error.message);
  }
});

router.get("/:user_id", async (req, res) => {
  try {
    if (!req.params.user_id) return res.status(400).send("id required");
    const findHistoryUserId = await SolidHisoty.findAll({
      where: { user_id: req.params.user_id },
      order: [["createdAt", "DESC"]],
    });
    const solidHistory = findHistoryUserId.map((history, index) => {
      return {
        ...history.toJSON(),
        count: index + 1,
      };
    });
    return res.send(solidHistory);
  } catch (error) {
    return res.send(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!req.params.user_id) return res.status(400).send("id required");
    const findHistoryUserId = await SolidHisoty.findOne({
      where: { id: req.params.id },
    });
    if (!findHistoryUserId) return res.status(404).send("History not found");
    await findHistoryUserId.destroy();
    return res.send("deleted successfully");
  } catch (error) {
    return res.send(error.message);
  }
});
module.exports = router;
