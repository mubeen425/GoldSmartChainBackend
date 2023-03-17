const express = require("express");
const config = require("config");
const { SolidCoins, validateS } = require("../models/solid_coin");
const { User } = require("../models/user");
const { Wallet } = require("../models/wallet");
const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const { SolidValue } = require("../models/solid_value");
const SolidHisoty = require("../models/solid_coin_history");
const {
  DECRYPT,
  platformFeeSolidToken,
  platformFeeStandToken,
} = require("../utils/constants");
const { TransferSolid } = require("../web3Integrations");
const { Rewards } = require("../models/Rewards");
const { AdminReferalRewards } = require("../models/admin_referal_rewards");
const { LevelRewards } = require("../models/referal_rewards");
const { Op } = require("sequelize");
const { default: BigNumber } = require("bignumber.js");
const csrfCheck = require("../middlewares/CsrfMiddleware");
const { getSolidBalance } = require("../solid_stand_balance");


const router = express.Router();
router.use(IsAdminOrUser);
router.get("/", async (req, res) => {
  try {
    const getAllRequests = await SolidCoins.findAll();
    return res.send(getAllRequests);
  } catch (error) {
    return res.send({ message: error.message });
  }
});

router.get("/platformfee", async (req, res) => {
  try {
    const fee = await platformFeeSolidToken();

    return res.send({ solidFee: fee });
  } catch (error) {
    return res.send({ message: error.message });
  }
});

router.get("/:user_id", async (req, res) => {
  try {
    const solidCoins = await SolidCoins.findOne({
      where: { user_id: req.params.user_id },
    });

    if (!solidCoins) return res.send({});
    const pendingSellRequests = await SolidHisoty.findAll({
      where: { user_id: req.params.user_id, type: "Sell", status: "pending" },
    });
    let totalSolidCoins = new BigNumber(0);
    for (const request of pendingSellRequests) {
      const pendingsolids = new BigNumber(request.solid_coin);
      totalSolidCoins = totalSolidCoins.plus(pendingsolids);
    }
    let sc = new BigNumber(solidCoins.solid_coin).minus(totalSolidCoins);
    
    solidCoins.solid_coin =sc.isLessThan(0)?0:sc.toFixed();
    return res.send(solidCoins);
  } catch (error) {
    return res.send({ message: error.message });
  }
});

router.post("/buy", async (req, res) => {
  try {
    const { error } = validateS(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const checkIfUser = await User.findOne({ where: { id: req.body.user_id } });

    const admin = await User.findOne({ where: { is_admin: true } });

    const invest_amount = Number(req.body.invest_amount);
    const solid_coin = Number(req.body.solid_coin);
    if (!checkIfUser) return res.status(500).send("Internal server error");
    if (solid_coin <= 0) return res.status(404).send("Invalid SOLID Amount");
    if (invest_amount <= 0) return res.status(406).send("Invalid USD Amount");
    if (!admin) return res.status(404).send("No admin account found.");
    req.body.type = "Buy";
    await SolidHisoty.create(req.body);
    return res.send("Request Initiated.");
  } catch (error) {
    return res.send(error.message);
  }
});

router.post("/sell", csrfCheck, async (req, res) => {
  try {
    const { error } = validateS(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const checkIfUser = await User.findOne({ where: { id: req.body.user_id } });
    const solidCoins = await SolidCoins.findOne({
      where: { user_id: req.body.user_id },
    });
    const pendingSellRequests = await SolidHisoty.findAll({
      where: { user_id: req.body.user_id, type: "Sell", status: "pending" },
    });
    let totalSolidCoins = new BigNumber(0);
    for (const request of pendingSellRequests) {
      const pendingsolids = new BigNumber(request.solid_coin);
      totalSolidCoins = totalSolidCoins.plus(pendingsolids);
    }
    let scal = new BigNumber(solidCoins.solid_coin).minus(totalSolidCoins);

    const admin = await User.findOne({ where: { is_admin: true } });

    const invest_amount = Number(req.body.invest_amount);
    const solid_coin = Number(req.body.solid_coin);
    if (!checkIfUser) return res.status(500).send("Internal server error");
    if (solid_coin > scal.toFixed())
      return res.status(400).send("You don't have SOLID in your account.");
    if (solid_coin <= 0) return res.status(404).send("Invalid SOLID Amount");
    if (invest_amount <= 0) return res.status(406).send("Invalid USD Amount");
    if (!admin) return res.status(404).send("No admin account found.");
    req.body.type = "Sell";
    await SolidHisoty.create(req.body);
    return res.send("Request Initiated.");
  } catch (error) {
    return res.send(error.message);
  }
});

router.put("/buyUpdate/:id", async (req, res) => {
  try {
    // const { error } = validateS(req.body);
    // if (error) return res.status(400).send(error.details[0].message);

    const checkIfUser = await User.findOne({ where: { id: req.body.user_id } });
    const checkRequest = await SolidHisoty.findOne({
      where: { id: req.params.id },
    });

    const solidcoin = await SolidCoins.findOne({
      where: { user_id: req.body.user_id },
    });
    const admin = await User.findOne({ where: { is_admin: true } });

    const invest_amount = Number(req.body.invest_amount);
    const solid_coin = Number(req.body.solid_coin);
    if (!checkRequest) return res.status(404).send("Invalid Request");
    if (!checkIfUser) return res.status(500).send("Internal Server error");
    if (solid_coin <= 0) return res.status(404).send("Invalid SOLID Amount");

    if (invest_amount <= 0) return res.status(406).send("Invalid USD Amount");
    if (!admin) return res.status(404).send("No admin account found.");

    let public_key = checkIfUser.wallet_public_key;
    let private_key=DECRYPT(checkIfUser.wallet_private_key);
    let admin_private_key = config.get("adminPrivateAdd");

    let solidfee = await platformFeeSolidToken();
    // let afterPlatformFee = req.body.solid_coin - parseFloat(solidfee);
    if (req.body.status === "accepted") {
      const err = await TransferSolid(
        public_key,
        req.body.solid_coin.toString(),
        admin_private_key
      );
      if (!err) {
        
      let solidval=await getSolidBalance(public_key,private_key);
        let sc = BigNumber(solidcoin.solid_coin).plus(req.body.solid_coin);
        solidcoin.solid_coin = solidval?solidval:sc.toFixed();
        await solidcoin.save();

        if (checkIfUser.reference) {
          const r1 = await User.findOne({
            where: { referal_code: checkIfUser.reference },
          });
          let r2 = null;
          if (checkIfUser.reference2) {
            r2 = await User.findOne({
              where: { referal_code: checkIfUser.reference2 },
            });
          }
          // const currentHist = await SolidHisoty.findAll({
          //   where: {
          //     [Op.and]:[
          //       {user_id: checkIfUser.id},
          //       {type: "Buy"},
          //       {status:"accepted"}
          //     ]
          //   },
          // });
          // if (currentHist.length === 0) {
          const adminRewardVal = await AdminReferalRewards.findAll();
          let adlev1 =
            solid_coin *
            (adminRewardVal[0]?.level1_reward
              ? adminRewardVal[0].level1_reward / 100
              : 0.02);
          let adlev2 =
            solid_coin *
            (adminRewardVal[0]?.level2_reward
              ? adminRewardVal[0].level2_reward / 100
              : 0.02);

          let u1 = await LevelRewards.findOne({ where: { user_id: r1.id } });
          let userlev2 = null;
          let userlev1 = u1?.level1_reward
            ? (u1.level1_reward / 100) * solid_coin
            : adlev1;
          if (r2) {
            let u2 = await LevelRewards.findOne({ where: { user_id: r2.id } });
            userlev2 = u2.level2_reward
              ? (u2.level2_reward / 100) * solid_coin
              : adlev2;
          }
          let ul1 =
            BigNumber(userlev1).decimalPlaces() > 14
              ? BigNumber(userlev1).toFixed(14)
              : BigNumber(userlev1).toFixed();
          await TransferSolid(
            r1.wallet_public_key,
            ul1.toString(),
            admin_private_key
          );
          var sc1 = await SolidCoins.findOne({ where: { user_id: r1.id } });
          let s = BigNumber(sc1.solid_coin).plus(userlev1);
          sc1.solid_coin = s.toFixed();
          sc1.save();

          let ul2 =
            BigNumber(userlev2).decimalPlaces() > 14
              ? BigNumber(userlev2).toFixed(14)
              : BigNumber(userlev2).toFixed();
          if (r2) {
            await TransferSolid(
              r2?.wallet_public_key,
              ul2.toString(),
              admin_private_key
            );
            var sc2 = await SolidCoins.findOne({ where: { user_id: r2.id } });
            let ss = BigNumber(sc.solid_coin).plus(userlev2);
            sc2.solid_coin = ss.toFixed();
            sc2.save();
          }

          await Rewards.create({
            reward1: ul1.toString(),
            reward2: ul2 ? ul2.toString() : null,
            refered_to: checkIfUser.user_name,
            refer1: r1.user_name,
            refer2: r2?.user_name,
            refer1_wallet_address: r1.wallet_public_key,
            refer2_wallet_address: r2?.wallet_public_key,
            type: "rewarded",
          });
          // }
        }
      } else {
        return res.status(404).send(err);
      }
    }
    checkRequest.status = req.body.status;
    checkRequest.save();
    return res.send("Request Processed Successfully.");
  } catch (error) {
    return res.send(error.message);
  }
});

router.put("/sellUpdate/:id", async (req, res) => {
  try {
    if (!req.body.solid_coin) return res.status(400).send("STAND coin missing");

    const checkIfUser = await User.findOne({ where: { id: req.body.user_id } });
    const checkRequest = await SolidHisoty.findOne({
      where: { id: req.params.id },
    });

    const solidcoin = await SolidCoins.findOne({
      where: { user_id: req.body.user_id },
    });

    const getValue = await SolidValue.findAll({
      limit: 1,
      order: [["id", "DESC"]],
    });

    const admin = await User.findOne({ where: { is_admin: true } });
    if (!admin) return res.status(404).send("No admin account found.");
    if (!checkRequest) return res.status(404).send("Invalid Request.");
    if (!checkIfUser) return res.status(404).send("User Not Found.");
    if (!solidcoin)
      return res.status(404).send("You don't have SOLID in your account.");
    if (!getValue.length > 0)
      return res.send({ message: "SOLID  value is not set." });

    let admin_public_key = config.get("adminPublicAdd");
    let public_key=checkIfUser.wallet_public_key;
    let private_key = DECRYPT(checkIfUser.wallet_private_key);

    let solidfee = await platformFeeSolidToken();
    // let afterPlatformFee = req.body.solid_coin - parseFloat(solidfee);

    if (req.body.status === "accepted") {
      const expectedValue = req.body.solid_coin;
      const actualValue = await getSolidBalance(
        checkIfUser.wallet_public_key,
        DECRYPT(checkIfUser.wallet_private_key)
      );
      const slippageTolerance = 0.01;

      const minExpectedValue = expectedValue * (1 - slippageTolerance);
      const maxExpectedValue = expectedValue * (1 + slippageTolerance);

      if (BigNumber(actualValue).isGreaterThanOrEqualTo(BigNumber(expectedValue))) {
        const err = await TransferSolid(
          admin_public_key,
          req.body.solid_coin.toString(),
          private_key
        );

        if (!err) {
          let solidval=await getSolidBalance(public_key,private_key);
          let soc = BigNumber(solidcoin.solid_coin).minus(req.body.solid_coin);
          solidcoin.solid_coin =solidval?solidval:soc.toFixed();
          await solidcoin.save();
        } else {
          return res.status(404).send(err);
        }
      } else {
        if (
          actualValue >= minExpectedValue &&
          actualValue <= maxExpectedValue
        ) {
          // expected value is within the slippage tolerance, proceed with transaction
          const err = await TransferSolid(
            admin_public_key,
            actualValue.toString(),
            private_key
          );
          if (!err) {
            let solidval=await getSolidBalance(public_key,private_key);
            let soc = BigNumber(solidcoin.solid_coin).minus(
              req.body.solid_coin
            );
            solidcoin.solid_coin = solidval?solidval:soc.toFixed();
            await solidcoin.save();
          } else {
            return res.status(404).send(err);
          }
        } else {
          return res.status(400).send("Transaction Failed.");
        }
      }
    }
    checkRequest.status = req.body.status;
    await checkRequest.save();
    return res.send("Request Processed Successfully.");
  } catch (error) {
    return res.send(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const checkIfExist = await SolidCoins.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!checkIfExist) return res.status(404).send("not found");

    const userWallet = await Wallet.findOne({
      where: { user_id: checkIfExist.user_id },
    });
    if (!userWallet) return res.status(404).send("Wallet not found");

    userWallet.balance += checkIfExist.invest_amount;

    await userWallet.save();
    await checkIfExist.destroy();
    return res.send("deleted successfuly");
  } catch (error) {
    return res.send(error.message);
  }
});

module.exports = router;
