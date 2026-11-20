const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { nanoid } = require('nanoid');

const uploadDir = path.join(__dirname, '../../temp_uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `upload_${Date.now()}_${nanoid(6)}${ext}`);
  }
});

const pdfUpload = multer({
  storage,
  limits: {
    fileSize: 250 * 1024 * 1024 // 250 MB
  }
});

module.exports = {
  pdfUpload,
  uploadDir
};
