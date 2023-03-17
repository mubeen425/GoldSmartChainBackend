const {Rewards}=require("../models/Rewards")
const moment=require("moment");
const { TransferSolid } = require("../web3Integrations");
const config=require("config")

module.exports = async () => {
 const AllRewards=await Rewards.findAll({where:{type:"pending"}})
 let admin_private_key = config.get("adminPrivateAdd");

 if(AllRewards.length>0){
    AllRewards.forEach(async(re)=>{
        let cr=moment().format("YYYY-MM-DD HH:mm");
        let fd=moment(re.issue_at);
        let status=moment(cr).isSameOrAfter(fd);
        if(status){
           const err= await TransferSolid(
                re.refer1_wallet_address,
                re.reward1.tostring(),
                admin_private_key
            )
            if(re.refer2_wallet_address){
                await TransferSolid(
                    re.refer2_wallet_address,
                    re.reward2.tostring(),
                    admin_private_key
                )
            }
            if(!err){
                re.type="issued"
                re.save();
            }
        }
    })
 }
};

