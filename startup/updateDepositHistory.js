const { ethers } = require("ethers");
const { DepositCrypto } = require("../models/deposit_crypto");
const {User}=require("../models/user")


module.exports=async function getDepositHistory() {
  let walletAddress = "0x40cab105165Ffac6A2df6Fd60BCbb92eb8657F8D";
  let tokenContractAddress = "0x7Fe16C58DEF0483B67c4c5609Ab236874967D4F9";
  const provider = new ethers.providers.WebSocketProvider(
    "ws://167.99.239.227:8545"
  );
  const tokenAbi = [
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "function balanceOf(address account) external view returns (uint256)",
  ];
  const contract = new ethers.Contract(
    tokenContractAddress,
    tokenAbi,
    provider
  );
  contract.on("Transfer", async (from, to, value, event) => {
    const users=await User.findAll();
    for (const usr of users) {
      if (to === usr.wallet_public_key) {
        await DepositCrypto.create({
          wallet_address:from,
          token_name:"Solid",
          amount:ethers.utils.formatUnits(value.toString()),
          blockHash:event.blockHash,
          user_id:usr.id
        })
      }
    }
})

provider.on('block', async (blockNumber) => {
  const block = await provider.getBlock(blockNumber);
  if (block.transactions.length > 0) {
    for (let i = 0; i < block.transactions.length; i++) {
      const tx = block.transactions[i];
      const receipt = await provider.getTransaction(tx);
      const users=await User.findAll();
    for (const usr of users) {
      if (receipt.to === usr.wallet_public_key) {
        await DepositCrypto.create({
          wallet_address: receipt.from,
          token_name:"Stand",
          amount:ethers.utils.formatUnits(receipt.value),
          blockHash:receipt.blockHash,
          user_id:usr.id
        })
      }
    }
    }
  }
});
}

