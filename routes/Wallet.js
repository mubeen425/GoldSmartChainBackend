const express = require("express");
const router = express.Router();
const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const { Wallet, validateWallet } = require("../models/wallet");
router.use(IsAdminOrUser);
router.post("/", async (req, res) => {
  try {
    if (!req.body.user_id)
      return res.status(400).send("user_id is required to create the wallet");
    await Wallet.create({ user_id: req.body.user_id });
    return res.send("wallet created successfully");
  } catch (error) {
    return res.send(error.message);
  }
});

router.get("/:user_id", async (req, res) => {
  try {
    if (!req.params.user_id) return res.status(400).send("id required");
    const findWalletWithUserId = await Wallet.findOne({
      where: { user_id: req.params.user_id },
    });
    if (!findWalletWithUserId) return res.send({});
    return res.send(findWalletWithUserId);
  } catch (error) {
    return res.send(error.message);
  }
});

router.put("/:user_id", async (req, res) => {
  try {
    const { error } = validateWallet(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const findWalletWithUserId = await Wallet.findOne({
      where: { user_id: req.params.user_id },
    });
    if (!findWalletWithUserId) return res.send("Wallet not found").status(404);

    findWalletWithUserId.balance = req.body.balance;
    await findWalletWithUserId.save();
  } catch (error) {
    return res.send(error.message);
  }
});

module.exports = router;
