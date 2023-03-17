const bcrypt = require("bcrypt");
const crypto = require("crypto-js");
const config = require("config");
const { solidFee } = require("../web3Integrations");
const encryptionSecretKey = config.get("encryptionSecretKey");

module.exports = {
  ENCRYPT_PASSWORD: async (password) => await bcrypt.hash(password, 10),
  COMPARE_PASSWORD: async (password, hash) =>
    await bcrypt.compare(password, hash),
  ENCRYPT: (text) => {
    const result = crypto.AES.encrypt(text, encryptionSecretKey);
    return result.toString();
  },
  DECRYPT: (text) => {
    var result = crypto.AES.decrypt(text, encryptionSecretKey);
    return result.toString(crypto.enc.Latin1);
  },
  platformFeeSolidToken:async()=>{
    const fee=await solidFee();
    return fee;
  },
  platformFeeStandToken:0.001,

};
