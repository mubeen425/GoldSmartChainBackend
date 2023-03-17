const express = require("express");
const ethers = require("ethers");
const router = express.Router();
const { User, validate } = require("../models/user");
const { Wallet } = require("../models/wallet");
const { StandExchangeCoin, validateE } = require("../models/stand_coin");
const { SolidCoins } = require("../models/solid_coin");
const ReferalCodes = require("referral-codes");
const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const Joi = require("joi");

// router.use(IsAdminOrUser);
router.get('/verify/:refercode',async(req,res)=>{
 try {
   if(!req.params.refercode) return res.status(400).send("Refer code is required to verify.");
   let checkReference = await User.findOne({
     where: { referal_code: req.params.refercode },
   });
   if (!checkReference) return res.status(200).send({status:false,message:"Invalid Reference Code."});
 
   return res.send({status:true})
 } catch (error) {
  return res.send(error.message);
 }
})

router.post("/", async (req, res) => {
  try {
    const { error } = validateBody(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let checkReference = await User.findOne({
      where: { referal_code: req.body.reference },
    });
    if (!checkReference) return res.status(404).send("Invalid Reference Code.");

    let currentUser = await User.findOne({
      where: { id: req.body.user_id },
    });
    if (!currentUser) return res.status(404).send("Invalid User.");
    if (currentUser.referal_code === req.body.reference)
      return res.status(400).send("Invalid Reference Code.");
    if (currentUser.reference)
      return res.status(400).send("Already Refered.");
    currentUser.reference = req.body.reference;
    
    const checkrefer2=await User.findOne({where:{referal_code:checkReference.reference}})

    if(checkrefer2?.level==2){
    currentUser.reference2=checkReference.reference;
  }

    await currentUser.save();

    return res.send({ status: true });
  } catch (error) {
    return res.send(error.message);
  }
});

const validateBody = (req) => {
  const schema = Joi.object({
    reference: Joi.string().required(),
    user_id: Joi.string().required(),
  });

  return schema.validate(req.body);
};

module.exports = router;
