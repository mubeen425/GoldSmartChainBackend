const Web3 = require("web3");
const { ABI } = require("./ABI");
var web3provider = "https://rpc-mainnet.goldsmartchain.com";
var Stand = "0xf6E7129F427aE7E78E870574f16aD4eA36B19d8b";
var Solid = "0x7Fe16C58DEF0483B67c4c5609Ab236874967D4F9";
var router_address = "0x331466B00f02b4C121688b1Db813CCD8ef91C394";
const web3 = new Web3(web3provider);
const router = new web3.eth.Contract(ABI, router_address);

const getSolidToStand = async (user_amount) => {
  const amountsOut = await router.methods
    .getAmountsOut(user_amount, [Solid, Stand])
    .call();
  return amountsOut[1];
};

const getStandToSolid = async (user_amount) => {
  const amountsOut = await router.methods
    .getAmountsOut(user_amount, [Stand, Solid])
    .call();
  return amountsOut[1];
};

module.exports = { getStandToSolid, getSolidToStand };
