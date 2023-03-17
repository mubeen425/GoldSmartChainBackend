const CSRF = require("../models/csrf");
const moment=require("moment")
const { Op } = require("sequelize");

module.exports = async function deleteOldCSRF() {
  try {
    const fiveMinutesAgo = moment().subtract(5,"minutes")
    const csrftokens = await CSRF.destroy({
      where: {
        createdAt: {
          [Op.lt]: fiveMinutesAgo,
        },
      },
    });
  } catch (error) {
    console.log(error.message);
  }
};
