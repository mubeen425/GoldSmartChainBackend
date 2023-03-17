const { SolidCoins } = require("../models/solid_coin");
const { StandExchangeCoin } = require("../models/stand_coin");
const { User } = require("../models/user");
const { DECRYPT } = require("../utils/constants");
const config = require("config");
const { getSolidBalance, getStandBalance } = require("../solid_stand_balance");

module.exports = async () => {
  const getAllUsers = await User.findAll();
  if (getAllUsers.length > 1) {
    getAllUsers.forEach(async (usr) => {
      const usrId = usr.id;
      const usrSolidCoin = await getSolidBalance(
        usr.is_admin ? config.get("adminPublicAdd") : usr.wallet_public_key,
        usr.is_admin
          ? config.get("adminPrivateAdd")
          : DECRYPT(usr.wallet_private_key)
      );
      const usrStandCoin = await getStandBalance(
        usr.is_admin ? config.get("adminPublicAdd") : usr.wallet_public_key
      );

      const updateUserSolidCoin = await SolidCoins.findOne({
        where: { user_id: usrId },
      });
      const updateUserStandCoin = await StandExchangeCoin.findOne({
        where: { user_id: usrId },
      });

      if (updateUserSolidCoin) {
        if(!updateUserSolidCoin.req_in_process){
        updateUserSolidCoin.solid_coin = usrSolidCoin
          ? usrSolidCoin
          : updateUserSolidCoin.solid_coin;
        updateUserSolidCoin.save();
      }
      }
      if (updateUserStandCoin) {
        updateUserStandCoin.exchange_coin_amount = usrStandCoin
          ? usrStandCoin
          : updateUserStandCoin.exchange_coin_amount;
        updateUserStandCoin.save();
      }
    });
  }
};
