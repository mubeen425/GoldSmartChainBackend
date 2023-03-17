const CSRF=require("../models/csrf");
module.exports =async function (req, res, next) {
    try {
   if(!req.headers.csrf) return res.status(400).send("CSRF Required.")
    const verifycsrf=await CSRF.findOne({where:{csrf:req.headers.csrf,}})
    
    if(!verifycsrf){
    await CSRF.create({
        csrf:req.headers.csrf,
        visited:true
    })
    next();
    }
   else{
        return res.status(400).send("Duplicate Request Detected.");
    }
  } catch (error) {
    return res.status(400).send("Invalid CSRF");
  }
};
