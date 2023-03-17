const express = require("express");
const router = express.Router();
const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const ExchangeHistory = require("../models/exchange_history");
router.use(IsAdminOrUser);
router.get("/:user_id", async (req, res) => {
  try {
    if (!req.params.user_id) return res.status(400).send("id required");
    const findHistoryUserId = await ExchangeHistory.findAll({
      where: { user_id: req.params.user_id },
      order: [["createdAt", "DESC"]],
    });
    const exchangeHistory = findHistoryUserId.map((history, index) => {
      return {
        ...history.toJSON(),
        count: index + 1,
      };
    });
    return res.send(exchangeHistory);
  } catch (error) {
    return res.send(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!req.params.user_id) return res.status(400).send("id required");
    const findHistoryUserId = await ExchangeHistory.findOne({
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
