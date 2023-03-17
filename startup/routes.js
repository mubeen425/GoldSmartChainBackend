const morgan = require("morgan");
const express = require("express");
const authRouter = require("../routes/Auth");
const referRouter = require("../routes/Refer");
const depositRouter = require("../routes/Deposits");
const withdrawRouter = require("../routes/Withdraw");
const walletRouter = require("../routes/Wallet");
const solidCoinsRouter = require("../routes/solid_coin");
const exchangeCoinRouter = require("../routes/exchange_coin");
const solidvalueRouter = require("../routes/solid_value");
const profileUpdateRouter = require("../routes/user_update");
const withdrawByCrypto = require("../routes/withdraw_crypto");
const solidHistoryRouter = require("../routes/solid_coin_history");
const exchangeHistoryRouter = require("../routes/exchange_history");
const referRewardRotuer=require("../routes/refer_rewards");
const referLevelRewardRouter=require("../routes/refer_level_reward");
const adminRefLevelRewardRouter=require("../routes/admin_ref_level_reward")
const depositBYCrypto=require("../routes/deposit_crypto_history");
const commissionRoute=require("../routes/commision");
const bankdetailRouter=require("../routes/bankd_details")

module.exports = function (app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static('images'))
  app.use(morgan("tiny"));
  app.get("/", async (req, res) => {
    res.send("working");
  });
  app.use("/api/user", authRouter);
  app.use("/api/refer", referRouter);
  app.use("/api/deposit", depositRouter);
  app.use("/api/withdraw", withdrawRouter);
  app.use("/api/wallet", walletRouter);
  app.use("/api/solidcoin", solidCoinsRouter);
  app.use("/api/exchangecoin", exchangeCoinRouter);
  app.use("/api/solidvalue", solidvalueRouter);
  app.use("/api/profile", profileUpdateRouter);
  app.use("/api/withdrawbycrypto", withdrawByCrypto);
  app.use("/api/depositbycrypto",depositBYCrypto);
  app.use("/api/solidhistory", solidHistoryRouter);
  app.use("/api/exchangehistory", exchangeHistoryRouter);
  app.use("/api/referreward",referRewardRotuer);
  app.use("/api/levelreward/",referLevelRewardRouter);
  app.use("/api/adminlevelreward/",adminRefLevelRewardRouter);
  app.use("/api/commission",commissionRoute);
  app.use("/api/bankdetail",bankdetailRouter)
};
