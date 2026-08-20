const path = require("path");
const fs = require("fs");
const multer = require("multer");
const ApiError = require("../utils/ApiError");

const uploadDirectory = path.join(__dirname, "../../uploads/products");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, uploadDirectory),
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      return callback(new ApiError(415, "Only JPEG, PNG, and WebP images are allowed"));
    }
    return callback(null, true);
  },
});

module.exports = upload;
