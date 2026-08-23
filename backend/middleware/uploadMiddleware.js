const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/gallery/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow images and videos for DB-less gallery uploads
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedImageExt = ['.jpeg', '.jpg', '.png', '.gif', '.webp'];
  const allowedVideoExt = ['.mp4', '.webm', '.ogg', '.mov', '.mkv'];

  const isImage = allowedImageExt.includes(ext);
  const isVideo = allowedVideoExt.includes(ext);

  // multer may provide mimetype; keep it permissive but consistent with extension
  if (isImage || isVideo) return cb(null, true);
  return cb(new Error('Only image/video files are allowed'));
};


const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for video uploads
});

module.exports = upload;
