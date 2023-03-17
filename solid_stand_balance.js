const ethers = require("ethers");

const SOLID = require("./solid.json");
let provider = new ethers.getDefaultProvider(
  "https://rpc-mainnet.goldsmartchain.com/"
);

const getStandBalance = async (public_address) => {
  try {
    const balance = await provider.getBalance(public_address);
    const stand = ethers.utils.formatEther(balance._hex);
    return stand;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getSolidBalance = async (public_address, private_address) => {
  try {
    let signer = new ethers.Wallet(private_address, provider);
    const solid = new ethers.Contract(SOLID.address, SOLID.abi, signer);

    const balance = await solid.balanceOf(public_address);
    const solidc = ethers.utils.formatEther(balance._hex);
    return solidc;
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = { getSolidBalance, getStandBalance };
