const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  if (!req.headers.authorization)
    return res.send("authentication token required");
  try {
    const decodetoken = jwt.verify(req.headers.authorization, "privateKey");
    req.user = decodetoken;
    if (decodetoken.is_admin || decodetoken.is_active) {
      next();
    } else {
      return res.status(400).send("Invalid Token");
    }
  } catch (error) {
    return res.status(400).send("invalid token");
  }
};
