const jwt = require("jsonwebtoken");
const config=require("config")
module.exports = function (req, res, next) {
  if (!req.headers.authorization)
    return res.send("authentication token required");
  try {
    const decodetoken = jwt.verify(req.headers.authorization, config.get("jwtPrivateKey"));
    req.user = decodetoken;
    if (decodetoken.is_admin) {
      next();
    } else {
      return res.status(400).send("Invalid Token.");
    }
  } catch (error) {
    return res.status(400).send("Invalid token");
  }
};
