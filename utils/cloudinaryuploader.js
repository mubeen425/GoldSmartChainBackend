const cloudinary = require("cloudinary").v2;
const config = require("config");

cloudinary.config(config.get("cloudinary"));

module.exports = cloudinary;
