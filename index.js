require('dotenv').config()
const UpdateTokens = require("./startup/UpdateSolidStand");
const DeleteOldTokens=require("./startup/deleteOldTokens");
require("./startup/updateDepositHistory")().catch((error) => {
  console.error(error);
  process.exit(1);
});
const express = require("express");
const helmet=require('helmet');
const cors = require("cors");
const app = express();
app.use(helmet())
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    objectSrc: ["'none'"],
    frameSrc: ["'none'"],
    baseUri: ["'self'"],
    frameAncestor:['none']
  }
}));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.frameguard());
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}));
app.use(helmet.referrerPolicy({ policy: 'no-referrer-when-downgrade' }))
app.use(
  cors({
    origin: "https://fervent-curie.185-178-192-38.plesk.page",
    // origin: "*",
  })
);
app.set("view engine", "pug");
require("./startup/routes")(app);
require("./startup/db")();


const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log("listening on port " + port);
});

setInterval(() => {
  UpdateTokens();
  DeleteOldTokens();
}, 40000);

