const express = require("express");
const { BankDetails, validateR } = require("../models/bankDetails");
const { User } = require("../models/user");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validateR(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const bankDetail = await BankDetails.create(req.body);
    res.status(201).json(bankDetail);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const bankDetails = await BankDetails.findOne({
      where: { user_id: userId },
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

    res.json(bankDetails);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


router.put("/:userId", async (req, res) => {
  const userId = req.params.userId;

  const { error } = validateR(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const bankDetail = await BankDetails.findOne({
      where: { user_id: userId },
    });

    if (!bankDetail){
     await BankDetails.create(req.body);
    }else{
      await bankDetail.update(req.body);
    }
    res.json("updated");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
