const dotenv = require('dotenv');
const zlib = require('zlib');
dotenv.config();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb({ status: 400, message: 'Only text files are allowed!' }, false);
    }
  };
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = multer.memoryStorage();
const upload = multer({ storage: storage});
const cloudinaryUpload = (buffer, originalFilename) => {
  return new Promise((resolve, reject) => {
    const uniqueFilename = `${originalFilename}_${Date.now()}`;
    cloudinary.uploader.upload_stream({
      resource_type: 'auto',
      public_id: uniqueFilename,
    }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    }).end(buffer);
  });
};
module.exports = { upload, cloudinaryUpload };

