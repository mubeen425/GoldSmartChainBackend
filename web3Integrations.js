const ethers = require("ethers");
const SOLID = require("./solid.json");
const { ABI } = require("./ABI");
const config = require("config");
const { getStandBalance, getSolidBalance } = require("./solid_stand_balance");
var Solid_address = "0x7fe16c58def0483b67c4c5609ab236874967d4f9";
// var Solid_address = "0x7Fe16C58DEF0483B67c4c5609Ab236874967D4F9";
var wrap_stand = "0xf6E7129F427aE7E78E870574f16aD4eA36B19d8b";
var router_address = "0x331466B00f02b4C121688b1Db813CCD8ef91C394";
let provider = new ethers.getDefaultProvider(
  "https://rpc-mainnet.goldsmartchain.com/"
);
// let provider = new ethers.getDefaultProvider(
//   "https://rpc-testnet.goldsmartchain.com/"
// );

//*******************************************************************//
//----------------------- For TRANSFER OF STAND ---------------------//
//*******************************************************************//

const TransferStand = async (public_address, no_of_tokens, private_address) => {

  let signer = new ethers.Wallet(private_address, provider);
  let receiverAddr = public_address;
  let price = no_of_tokens;

  let tx = {
    to: receiverAddr,
    value: ethers.utils.parseEther(price),
  };

  let txdata = null;
  let erro = null;

  try {
    await signer.sendTransaction(tx).then((txObj) => {
      txdata = txObj.hash;
    });
  } catch (error) {
    erro = error.message;
  }

  const balanc = await provider.getBalance(receiverAddr);
  return { txdata, erro };
};

//*******************************************************************//
//----------------------- For TRANSFER OF SOLID ---------------------//
//*******************************************************************//

const TransferSolid = async (public_address, no_of_tokens, private_address) => {


  let signer = new ethers.Wallet(private_address, provider);
  let receiverAddress = public_address;
  const solid = new ethers.Contract(SOLID.address, SOLID.abi, signer);
  const valueSolid = ethers.utils.parseEther(no_of_tokens);

  let err = null;

  try {
    const solidTransfer = await (
      await solid.transfer(receiverAddress, valueSolid, { gasLimit: 100000 })
    ).wait();
    if (!solidTransfer.events) {
      err = "Transaction Failed";
    }
  } catch (error) {
    err = "Transaction Failed";
    console.log(error);
  }
  const solidTransfer = await solid.balanceOf(receiverAddress);
  return err;
};

const SwapStandToSolidToken = async (amount, private_key,public_key) => {
  // in case of buying STAND, first param will be the SOLID address and second address will be the WSTAND
  // in case of buying SOLID, first param will be the WSTAND address and second address will be the SOLID
  let signer = new ethers.Wallet(private_key, provider);
  const tokens = [
    wrap_stand,
    Solid_address, // this is WSTAND address
  ];
  const router = new ethers.Contract(router_address, ABI, signer);
  let er = null;
  let solidval=null;
  let standval=null;
  try {
    const addresss = await signer.getAddress();
    const time = Math.floor(Date.now() / 1000) + 200000;
    const deadline = ethers.BigNumber.from(time);
    const amountIn = ethers.utils.parseEther(amount.toString());
    const amountOut = await router.getAmountsOut(amountIn, tokens, {
      gasLimit: 3000000,
    });
    await(await router
      .swapExactETHForTokens(amountOut[1], tokens, addresss, deadline, {
        value: amountIn,
        gasLimit: 3000000,
      })).wait();

      standval=await getStandBalance(public_key);
      solidval=await getSolidBalance(public_key,private_key);
  } catch (error) {
    er = error.message;
    console.log("web3",error);
  }
  return {er,solidval,standval};
};

const swapSolidToSTandToken = async (amount, private_key,public_key) => {
  // in case of buying STAND, first param will be the SOLID address and second address will be the WSTAND
  // in case of buying SOLID, first param will be the WSTAND address and second address will be the SOLID

  let signer = new ethers.Wallet(private_key, provider);
  const tokens = [Solid_address, wrap_stand];

  const router = new ethers.Contract(router_address, ABI, signer);

  const solidInstance = new ethers.Contract(SOLID.address, SOLID.abi, signer);
  let er = null;
  let solidval=null;
  let standval=null;
  try {
    const addresss = await signer.getAddress();
    const time = Math.floor(Date.now() / 1000) + 200000;
    const deadline = ethers.BigNumber.from(time);
    const amountIn = ethers.utils.parseEther(amount.toString());
    await (
      await solidInstance.approve(
        "0x331466b00f02b4c121688b1db813ccd8ef91c394",
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      )
    ).wait();

    const amountOut = await router.getAmountsOut(amountIn, tokens);

   await(await router.swapExactTokensForETH(
      amountIn,
      amountOut[1],
      tokens,
      addresss,
      deadline,
      { gasLimit: 3000000 }
    )).wait();
    standval=await getStandBalance(public_key);
    solidval=await getSolidBalance(public_key,private_key);
  } catch (error) {
    er = error.message;
    console.log("web5",error);
  }
  return {er,solidval,standval};
};

const solidFee = async () => {
  let signer = new ethers.Wallet(config.get("adminPrivateAdd"), provider);
  const router = new ethers.Contract(router_address, ABI, signer);
  const tokens = [wrap_stand, Solid_address];
  const amountIn = ethers.utils.parseEther("0.001");

  const amountOut = await router.getAmountsOut(amountIn, tokens);
  const platformFee = ethers.utils.formatUnits(amountOut[1]);
  return platformFee;
};

module.exports = {
  TransferSolid,
  TransferStand,
  swapSolidToSTandToken,
  SwapStandToSolidToken,
  solidFee,
};
