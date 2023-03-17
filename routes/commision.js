const express = require("express");
const router = express.Router();
const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const {Commission} = require("../models/comissions");
const { User } = require("../models/user");
const { Sequelize } = require("sequelize");
router.use(IsAdminOrUser);

router.get("/total", async (req, res) => {
    try {
      // const solidCommissionResult = await Commission.findAll({
      //   attributes: [[Sequelize.fn('sum', Sequelize.col('commision')), 'totalSolidCommission']],
      //   where: {
      //     token_name: 'Solid'
      //   }
      // });
  
      const standCommissionResult = await Commission.findAll({
        attributes: [[Sequelize.fn('sum', Sequelize.col('commision')), 'totalStandCommission']]
      });
  
      const result = {
        // totalSolidCommission: solidCommissionResult[0].dataValues.totalSolidCommission || 0,
        totalStandCommission: standCommissionResult[0].dataValues.totalStandCommission || 0
      };
  
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  });
  
router.get("/", async (req, res) => {
  try {
    const reqs = await Commission.findAll(
        {
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
          }
    );
    return res.send(reqs);
  } catch (error) {
    return res.send(error.message);
  }
});


module.exports = router;
