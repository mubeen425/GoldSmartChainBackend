const express = require("express");
const config = require("config");
const { StandExchangeCoin, validateE } = require("../models/stand_coin");
const { SolidCoins } = require("../models/solid_coin");
const { User } = require("../models/user");
const { Wallet } = require("../models/wallet");
const { default: BigNumber } = require("bignumber.js");
const SolidHisoty = require("../models/solid_coin_history");
const csrfCheck=require("../middlewares/CsrfMiddleware")

const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const { getSolidToStand, getStandToSolid } = require("../ex");
const { SolidValue } = require("../models/solid_value");
const {
  DECRYPT,
  platformFeeSolidToken,
  platformFeeStandToken,
} = require("../utils/constants");
const {
  TransferStand,
  TransferSolid,
  swapSolidToSTandToken,
  SwapStandToSolidToken,
} = require("../web3Integrations");
const ExchangeHistory = require("../models/exchange_history");
const { Commission } = require("../models/comissions");
const { getSolidBalance, getStandBalance } = require("../solid_stand_balance");

const router = express.Router();
router.use(IsAdminOrUser);

router.get("/", async (req, res) => {
  try {
    const getAllRequests = await StandExchangeCoin.findAll();
    return res.send(getAllRequests);
  } catch (error) {
    return res.send({ message: error.message });
  }
});

router.get("/:user_id", async (req, res) => {
  try {
    const getAllRequestsByUserId = await StandExchangeCoin.findOne({
      where: { user_id: req.params.user_id },
    });
    if (!getAllRequestsByUserId) return res.send({});

    return res.send(getAllRequestsByUserId);
  } catch (error) {
    return res.send({ message: error.message });
  }
});

router.post("/",csrfCheck, async (req, res) => {
  try {
    const { error } = validateE(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const checkIfUser = await User.findOne({ where: { id: req.body.user_id } });
    const solidcoin = await SolidCoins.findOne({
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
    let scal=new BigNumber(solidcoin.solid_coin).minus(totalSolidCoins);
    const getValue = await SolidValue.findAll({
      limit: 1,
      order: [["id", "DESC"]],
    });
    const standCoinExchange = await StandExchangeCoin.findOne({
      where: { user_id: req.body.user_id },
    });
    const admin = await User.findOne({ where: { is_admin: true } });

    if (!admin) return res.status(404).send("Admin not found.");
    if (!checkIfUser) return res.status(500).send("Internal server error");
    if (!solidcoin) return res.status(404).send("You don't have SOLID in your account.");
    if (req.body.solid_coin <= 0) return res.status(406).send("Invalid SOLID Amount.");
    if(req.body.exchange_coin_amount<0) return res.status(406).send("Invalid STAND Amount.");
    if (req.body.solid_coin > scal.toFixed())
      return res.status(400).send("Not enough SOLID in your account.");
    if (!getValue.length > 0)
      return res.send({ message: "SOLID  value is not set by Admin." });

    req.body.exchange_coin_amount = BigNumber(req.body.exchange_coin_amount).toFixed();
    req.body.solid_coin = BigNumber(req.body.solid_coin).toFixed();

    let public_key = checkIfUser.wallet_public_key;
    let private_key = DECRYPT(checkIfUser.wallet_private_key);
    let admin_public_key = config.get("adminPublicAdd");
    let admin_private_key = config.get("adminPrivateAdd");

    let solidfee = await platformFeeSolidToken();
    let afterPlatformFee = req.body.solid_coin - parseFloat(solidfee);

    let sc=BigNumber(solidcoin.solid_coin).minus(req.body.solid_coin)
    solidcoin.solid_coin=sc.toFixed();
    solidcoin.req_in_process=true;
    await solidcoin.save();
    
    const { txdata, erro } = await TransferStand(
      admin_public_key,
      platformFeeStandToken.toString(),
      private_key
    );
    const {er,solidval,standval} = await swapSolidToSTandToken(
      req.body.solid_coin.toString(),
      private_key,
      public_key
    );

    if (er == null && erro == null) {
      // let sc=BigNumber(solidcoin.solid_coin).minus(req.body.solid_coin)
       solidcoin.solid_coin=solidval;
      if (!standCoinExchange) {
        await StandExchangeCoin.create(req.body);
      } else {
        let sce=BigNumber(standCoinExchange.exchange_coin_amount).plus(req.body.exchange_coin_amount);
        standCoinExchange.exchange_coin_amount=standval?standval:sce.toFixed(); 
        await standCoinExchange.save();
      }
      await Commission.create({
        user_id:req.body.user_id,
        transaction_type:"Exchange",
        token_name:"Stand",
        commision:Number(platformFeeStandToken)
      })
    solidcoin.req_in_process=false;
      await solidcoin.save();

      let hist = {
        user_id: req.body.user_id,
        from: "solid",
        to: "stand",
        solid: req.body.solid_coin,
        stand: req.body.exchange_coin_amount,
      };
      await ExchangeHistory.create(hist);
      return res.send("Exchanged successfully");
    } else {
      let sc=BigNumber(solidcoin.solid_coin).plus(req.body.solid_coin)
      solidcoin.solid_coin=sc.toFixed();
    solidcoin.req_in_process=false;
      await solidcoin.save();
      return res.status(400).send("Request Failed.");
    }
    return res.send("ok");
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!req.params.id || !req.body.exchange_coin_amount)
      return res.status(400).send("Id or Exchange is missing.");

    const standExchange = await StandExchangeCoin.findOne({
      where: { id: req.params.id },
    });
    const checkIfUser = await User.findOne({
      where: { id: standExchange.user_id },
    });
    const solidcoin = await SolidCoins.findOne({
      where: { user_id: standExchange.user_id },
    });
    const getValue = await SolidValue.findAll({
      limit: 1,
      order: [["id", "DESC"]],
    });
    const admin = await User.findOne({ where: { is_admin: true } });
    
    req.body.exchange_coin_amount = BigNumber(req.body.exchange_coin_amount).toFixed();
    req.body.solid_coin = BigNumber(req.body.solid_coin).toFixed();

    if (!admin) return res.status(404).send("Admin not found.");
    if (!standExchange) return res.status(404).send("You don't have STAND in your account.");
    if (!checkIfUser) return res.status(500).send("User Not Found In Server.");
    if (!solidcoin)
      return res.status(404).send("You don't have SOLID in your account.");
      if (req.body.solid_coin <= 0) return res.status(406).send("Invalid SOLID Amount.");
    if (req.body.exchange_coin_amount <= 0)
      return res.status(406).send("Invalid STAND Amount");
    if (req.body.exchange_coin_amount > BigNumber(standExchange.exchange_coin_amount).toFixed())
      return res.status(400).send("You don't have STAND in your account.");
    if (!getValue.length > 0)
      return res.send({ message: "SOLID value is not set." });


    let public_key = checkIfUser.wallet_public_key;
    let private_key = DECRYPT(checkIfUser.wallet_private_key);
    let admin_public_key = config.get("adminPublicAdd");
    let admin_private_key = config.get("adminPrivateAdd");

    let standfee = platformFeeStandToken;

    let afterPlatformFee = req.body.exchange_coin_amount - parseFloat(standfee);

    const { txdata, erro } = await TransferStand(
      admin_public_key,
      standfee.toString(),
      private_key
    );
    const {er,solidval,standval}= await SwapStandToSolidToken(
      req.body.exchange_coin_amount.toString(),
      private_key,
      public_key
    );
    if (er == null && erro == null) {
      let sec=BigNumber(standExchange.exchange_coin_amount ).minus(req.body.exchange_coin_amount)
      standExchange.exchange_coin_amount =standval?standval:sec.toFixed();
      let sc=BigNumber(solidcoin.solid_coin).plus(req.body.solid_coin);
       solidcoin.solid_coin=solidval?solidval:sc.toFixed();
      let hist = {
        user_id: req.body.user_id,
        from: "stand",
        to: "solid",
        solid: req.body.solid_coin,
        stand: req.body.exchange_coin_amount,
      };
      await Commission.create({
        user_id:req.body.user_id,
        transaction_type:"Exchange",
        token_name:"Solid",
        commision:parseFloat(standfee)
      })
      await ExchangeHistory.create(hist);
      await standExchange.save();
      await solidcoin.save();
      return res.send("Request Sent successfully");
    } else {
      return res.status(400).send("Request Failed");
    }
    return res.send("ok");
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const checkIfExist = await StandExchangeCoin.findOne({
      where: {
        id: req.params.id,
      },
    });
    const solidcoin = await SolidCoins.findOne({
      where: { user_id: checkIfExist.user_id },
    });
    const getValue = await SolidValue.findAll({
      limit: 1,
      order: [["id", "DESC"]],
    });

    if (!checkIfExist) return res.status(404).send("not found");
    if (!standcoin) return res.status(404).send("coin not found.");
    if (!getValue.length > 0)
      return res.send({ message: "No SOLID is set." });

    let solidadminValue = getValue[0].value;
    let amount = solidadminValue * checkIfExist.solid_coin;
    solidcoin.solid_coin += checkIfExist.solid_coin;
    solidcoin.invest_amount += amount;

    await checkIfExist.destroy();
    return res.send("deleted successfuly");
  } catch (error) {
    return res.send(error.message);
  }
});

router.get("/w/solidtostand/:solid_coin", async (req, res) => {
  try {
    if (!req.params.solid_coin)
      return res.status(400).send("No solid coin provided to exchange.");

    const val = await getSolidToStand(req.params.solid_coin);

    return res.send({
      solid: req.params.solid_coin,
      standexchange: Number(val),
    });
  } catch (error) {
    return res.send(error.message);
  }
});

router.get("/w/standtosolid/:stand_coin", async (req, res) => {
  try {
    if (!req.params.stand_coin)
      return res.status(400).send("No stand coin provided to exchange.");

    const val = await getStandToSolid(req.params.stand_coin);

    return res.send({
      stand: req.params.stand_coin,
      solidexchange: Number(val),
    });
  } catch (error) {
    return res.send(error.message);
  }
});

module.exports = router;
