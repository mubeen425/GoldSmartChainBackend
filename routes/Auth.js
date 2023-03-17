const config = require("config");
const express = require("express");
const ethers = require("ethers");
const router = express.Router();
const jwt=require("jsonwebtoken")
const { User, validate } = require("../models/user");
const { Wallet } = require("../models/wallet");
const { StandExchangeCoin, validateE } = require("../models/stand_coin");
const { SolidCoins } = require("../models/solid_coin");
const ReferalCodes = require("referral-codes");
const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const {
  ENCRYPT_PASSWORD,
  COMPARE_PASSWORD,
  ENCRYPT,
  DECRYPT,
} = require("../utils/constants");
const { TransferStand } = require("../web3Integrations");
const { LevelRewards } = require("../models/referal_rewards");
const send = require("../utils/mailsend");

router.get("/getall", IsAdminOrUser, async (req, res) => {
  try {
    const users = await User.findAll();
    if (!users.length > 0) return res.send({ message: "no users found" });

    return res.send(users);
  } catch (error) {
    return res.send(error.message);
  }
});

router.get("/:user_id", IsAdminOrUser, async (req, res) => {
  try {
    if (!req.params.user_id)
      return res.status(400).send("user id is required.");
    const user = await User.findOne({ where: { id: req.params.user_id } });
    if (!user) return res.status(404).send("no users found");

    return res.send(user);
  } catch (error) {
    return res.send(error.message);
  }
});

router.post("/register", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let checkUsername = await User.findOne({
      where: { user_name: req.body.user_name },
    });

    if (checkUsername)
      return res.status(400).send("User Name is already taken.");

    let user = await User.findOne({ where: { email: req.body.email } });
    if (user)
      return res.status(400).send("User already registered with this email account.");

    req.body.referal_code = ReferalCodes.generate({
      pattern: "####-####-####",
    })[0];

    req.body.password = await ENCRYPT_PASSWORD(req.body.password);

    const wallet = ethers.Wallet.createRandom();
    req.body.wallet_public_key = wallet.address;
    req.body.wallet_private_key = ENCRYPT(wallet.privateKey);
    req.body.wallet_mnemonic_phrase = ENCRYPT(wallet.mnemonic.phrase);

    createUser = await User.create(req.body);
    // await Wallet.create({ user_id: createUser.id });
    await LevelRewards.create({ user_id: createUser.id });

    await SolidCoins.create({ user_id: createUser.id, solid_coin: 0 });
    await StandExchangeCoin.create({
      user_id: createUser.id,
    });

    const { txdata, erro } = await TransferStand(
      req.body.wallet_public_key,
      "1",
      config.get("adminPrivateAdd")
    );
    let id=jwt.sign({id: createUser.id},config.get("jwtPrivateKey"),{expiresIn:'10m'})
    send(createUser.email,"Email Confirmation","normal",id);
    return res.send({
      status: true,
      user_id:createUser.id
    });
  } catch (error) {
    return res.send(error.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    let user = await User.findOne({ where: { email: req.body.email } });
    if (!user) return res.status(400).send("Invalid email or password.");

    const validPassword = await COMPARE_PASSWORD(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(400).send("Invalid email or password.");

    const token = user.generateJwtToken();
    return res.send({ status: true, access: token });
  } catch (error) {
    return res.send(error.message);
  }
});

router.post("/email-verify", async (req, res) => {
  try {
    if (!req.body.email) return res.status(400).send("Please provide email.");

    const checkUser = await User.findOne({ where: { email: req.body.email } });
    if (!checkUser)
      return res.status(404).send("User Not Found With This Email.");
    let id=jwt.sign({id:checkUser.id},config.get("jwtPrivateKey"),
    {expiresIn:'10m'}
    )
    send(checkUser.email,req.body.type?"Forgot Password":"Email Confirmation",req.body.type?req.body.type:"normal",id);

    return res.send({message:"Email is sent successfully."});
  } catch (error) {
    return res.send(error.message);
  }
});

router.post("/passwordreset/:user_id", async (req, res) => {
  try {
    if (!req.params.user_id) return res.status(400).send("user id is missing.");
    jwt.verify(req.body.token,config.get("jwtPrivateKey"))
    

    const checkUser = await User.findOne({ where: { id: req.params.user_id } });
    if (!checkUser)
      return res.status(404).send("User Not Found With The Given Id.");

    const newPassword = await ENCRYPT_PASSWORD(req.body.password);
    checkUser.password = newPassword;
    await checkUser.save();
   if(req.body.forgot){
    return res.render("emailconfirm", {
      title: "forgot password",
      status: "Password Updated..",
      icon:'t'
    });
   }
    return res.send("Password Updated..");
  } catch (error) {
    return res.render("emailconfirm", {
      title: "error",
      status: error.message,
      icon:'c'
    });
  }
});

router.get("/verify/:token", async (req, res) => {
  try {
    if (!req.params.token) return res.status(400).send({message:"Token is missing."});
    let tok=jwt.verify(req.params.token,config.get("jwtPrivateKey"))
    let user = await User.findOne({ where: { id:tok.id } });
    if(!user) return res.status(400).send("Link Expired..");
    if (user.is_email_verified) {
      return res.render("emailconfirm", {
        title: "Verified.",
        status: "Email Is Already Verified..",
        icon:'t'
      })
    }else{
      user.is_email_verified = true;
      await user.save();
    }

    return res.render("emailconfirm", {
      title: "Verified.",
      status: "Email Verified..",
      icon:'t'
    });
  } catch (error) {
    console.log(error.message);
    return res.render("emailconfirm", {
      title: "Expired",
      status: "Link Expired..",
      icon:'c'
    });
  }
});

router.get("/forgotform/:token",async(req,res)=>{
  try{
  if (!req.params.token) return res.status(400).send({message:"Token is missing."});
  let tok=jwt.verify(req.params.token,config.get("jwtPrivateKey"))
  let user = await User.findOne({ where: { id:tok.id } });
  if(!user) return res.status(400).send("Invalid Link");
  return res.render('forgotpass',{id:user.id,token:req.params.token})
} catch (error) {
  console.log(error.message);
  return res.render("emailconfirm", {
    title: "Expired",
    status: "Link Expired",
    icon:'c'
  });
}
});



// const passValidate = (req) => {
//   const schema = Joi.object({
//     password: Joi.string()
//       .min(5)
//       .max(255)
//       .required()
//       .regex(
//         RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")
//       )
//       .message(
//         "Password must contain at least one uppercase one lowercase one special character and one number "
//       ),
//   });

//   return schema.validate(req);
// };
module.exports = router;
