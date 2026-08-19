const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
    path: path.resolve(__dirname, "../../.env"),
});

module.exports = {
    PORT: process.env.PORT || 9000,
    MONGO_URI: process.env.MONGODB_URI,
};