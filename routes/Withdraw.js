const express = require("express");
const { Withdraw, validateW } = require("../models/withdraw");
const { Wallet } = require("../models/wallet");
const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const { User } = require("../models/user");
const router = express.Router();

router.use(IsAdminOrUser);

router.get("/", async (req, res) => {
  try {
    const getAllRequests = await Withdraw.findAll({
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
    return res.send(getAllRequests);
  } catch (error) {
    return res.send({ message: error.message });
  }
});

router.get("/:user_id", async (req, res) => {
  try {
    const getAllRequestsByUserId = await Withdraw.findAll({
      where: { user_id: req.params.user_id },
    });
    return res.send(getAllRequestsByUserId);
  } catch (error) {
    return res.send({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { error } = validateW(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const checkIfUser = await User.findOne({ where: { id: req.body.user_id } });
    if (!checkIfUser) return res.status(404).send("internal server error");

    const userWallet = await Wallet.findOne({
      where: { user_id: req.body.user_id },
    });
    if (!userWallet) return res.status(404).send("Wallet not created");
    if (userWallet.balance < req.body.amount)
      return res.status(406).send("balance is less then your withdraw amount.");

    if (req.body.amount <= 0) return res.status(406).send("Invalid Amount");

    userWallet.balance -= req.body.amount;
    await userWallet.save();

    await Withdraw.create(req.body);

    return res.status(200).send("Request Sent successfully");
  } catch (error) {
    return res.send(error.message);
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).send("Id is not provided.");

    const WithdrawRequest = await Withdraw.findOne({
      where: { id: req.params.id },
    });

    if (!WithdrawRequest) return res.status(404).send("request not found.");

    WithdrawRequest.status = req.body.status;
    WithdrawRequest.status_description = req.body.status_description
      ? req.body.status_description
      : "reason not specified";

    const userWallet = await Wallet.findOne({
      where: { user_id: WithdrawRequest.user_id },
    });
    if (!userWallet) return res.status(404).send("Wallet not found");
    if (req.body.status === "canceled") {
      userWallet.balance += parseFloat(WithdrawRequest.amount);
      await userWallet.save();
    }
    await WithdrawRequest.save();

    return res.status(200).send("updated");
  } catch (error) {
    return res.send(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const checkIfExist = await Withdraw.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!checkIfExist) return res.status(404).send("not found");

    await checkIfExist.destroy();
    return res.send("deleted successfuly");
  } catch (error) {
    return res.send(error.message);
  }
});

module.exports = router;
