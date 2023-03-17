const express = require("express");
const config = require("config");
const { StandExchangeCoin } = require("../models/stand_coin");
const { SolidCoins } = require("../models/solid_coin");
const { SolidValue } = require("../models/solid_value");
const SolidHisoty = require("../models/solid_coin_history");
const csrfCheck=require("../middlewares/CsrfMiddleware");
const { default: BigNumber } = require("bignumber.js");


const { Wallet } = require("../models/wallet");
const { User } = require("../models/user");
const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const { WithdrawCrypto, validateDC } = require("../models/withdraw_crypto");
const { TransferSolid, TransferStand } = require("../web3Integrations");
const {
  DECRYPT,
  platformFeeSolidToken,
  platformFeeStandToken,
} = require("../utils/constants");
const { Commission } = require("../models/comissions");
const { getStandBalance, getSolidBalance } = require("../solid_stand_balance");
const router = express.Router();
router.use(IsAdminOrUser);

router.get("/", async (req, res) => {
  try {
    const getAllRequests = await WithdrawCrypto.findAll({
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
    const getAllRequestsByUserId = await WithdrawCrypto.findAll({
      where: { user_id: req.params.user_id },
      order: [["requested_at", "DESC"]],
    });
    const exchangeHistory = getAllRequestsByUserId.map((history, index) => {
      return {
        ...history.toJSON(),
        count: index + 1,
      };
    });

    return res.send(exchangeHistory);
  } catch (error) {
    return res.send({ message: error.message });
  }
});

router.post("/",csrfCheck, async (req, res) => {
  try {
    const { error } = validateDC(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const checkIfUser = await User.findOne({ where: { id: req.body.user_id } });
    if (!checkIfUser) return res.status(404).send("user not found.");

    const userStandCoin = await StandExchangeCoin.findOne({
      where: { user_id: req.body.user_id },
    });
    const userSolidCoin = await SolidCoins.findOne({
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
    let scal=new BigNumber(userSolidCoin.solid_coin).minus(totalSolidCoins);
    const getValue = await SolidValue.findAll({
      limit: 1,
      order: [["id", "DESC"]],
    });
    const admin = await User.findOne({ where: { is_admin: true } });
    if (!admin) return res.status(404).send("Admin Not Found.");
    if (!getValue.length > 0)
      return res.send({ message: "SOLID  value is not set." });
    if (req.body.amount <= 0) return res.status(406).send("Invalid Amount");

    // let solidadminValue = getValue[0].value;

    let admin_public_key = config.get("adminPublicAdd");
    let user_public_key = checkIfUser.wallet_public_key;
    let private_key = DECRYPT(checkIfUser.wallet_private_key);
    let public_key =req.body.wallet_address;

    if (req.body.token_name === "solid") {
      let solidfee = await platformFeeSolidToken();
      // let afterPlatformFee = req.body.amount - parseFloat(solidfee);
      if (!userSolidCoin)
        return res.status(400).send("You don't have SOLID in your account.");
      if (req.body.amount > scal.toFixed())
        return res.status(400).send("SOLID  Amount Exceeded");

        let c=BigNumber(userSolidCoin.solid_coin).minus(req.body.amount)
        userSolidCoin.solid_coin=c.toFixed();
        userSolidCoin.req_in_process=true;
    await userSolidCoin.save();

        const { txdata, erro } = await TransferStand(
          admin_public_key,
          platformFeeStandToken.toString(),
          private_key
        );

      const err = await TransferSolid(
        public_key,
        req.body.amount.toString(),
        private_key
      );

      if (!err) {
        
    let solidval=await getSolidBalance(user_public_key,private_key);
        // let wamount = solidadminValue * parseFloat(req.body.amount);
        let usc=BigNumber(userSolidCoin.solid_coin).minus(req.body.amount);
        userSolidCoin.req_in_process=false;
        userSolidCoin.solid_coin=solidval;
        await Commission.create({
          user_id:req.body.user_id,
          transaction_type:"Withdraw",
          token_name:"Solid",
          commision:solidfee
        })
        await userSolidCoin.save();
      } else {
        let usc=BigNumber(userSolidCoin.solid_coin).plus(req.body.amount);
        userSolidCoin.req_in_process=false;
        userSolidCoin.solid_coin=usc.toFixed();
        userSolidCoin.save();
        return res.status(404).send("Transaction Failed.");
      }
    }
    if (req.body.token_name === "stand") {      
      let standfee = platformFeeStandToken;
      let afterPlatformFee = req.body.amount - parseFloat(standfee);

      if (!userStandCoin)
        return res.status(400).send("You don't have STAND in your account.");
      if (req.body.amount > Number(userStandCoin.exchange_coin_amount))
        return res.status(400).send("STAND Token Amount Exceeded.");

      await TransferStand(admin_public_key, standfee.toString(), private_key);

      const { txdata, erro } = await TransferStand(
        public_key,
        req.body.amount.toString(),
        private_key
      );

      if (!erro) {
      let standval=await getStandBalance(user_public_key);
        let uss=BigNumber(userStandCoin.exchange_coin_amount).minus(req.body.amount)
         userStandCoin.exchange_coin_amount=standval?standval:uss.toFixed();
        await Commission.create({
          user_id:req.body.user_id,
          transaction_type:"Withdraw",
          token_name:"Stand",
          commision:standfee
        })
        await userStandCoin.save();
      } else {
        return res.status(404).send(erro);
      }
    }

    await WithdrawCrypto.create(req.body);
    return res.send("withdraw successful.");
  } catch (error) {
    return res.status(404).send({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const checkIfExist = await WithdrawCrypto.findOne({
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
