const multer = require("multer");

const multerImageHandler = multer({
  storage: multer.diskStorage({}),
});

module.exports = multerImageHandler;
