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
app.use(helmet());
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

