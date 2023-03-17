const connection = require("../utils/connection");
module.exports = function () {
  try {
    connection.authenticate().then(() => console.log("connected to database"));
    connection
      .sync({ alter: true })
      .then(() => console.log("synced successfully"));
  } catch (error) {
    console.error("enable to connect to database");
  }
};
