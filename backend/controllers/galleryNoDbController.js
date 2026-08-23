const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '..', 'gallery-items.store.json');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'gallery');

const ensureStore = () => {
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify([] , null, 2));
  }
};

const readStore = () => {
  ensureStore();
  const raw = fs.readFileSync(STORE_PATH, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStore = (items) => {
  fs.writeFileSync(STORE_PATH, JSON.stringify(items, null, 2));
};

const toPublicUrl = (relativeFromBackend) => {
  // relativeFromBackend e.g. /uploads/gallery/xxx.jpg
  if (relativeFromBackend.startsWith('/')) return relativeFromBackend;
  return '/' + relativeFromBackend;
};

exports.uploadGalleryItem = async (req, res) => {
  try {
    const { title, description, category, featured, type } = req.body;

    const imageFile = req.files?.image?.[0];
    let videoFile = req.files?.video?.[0];

    const imageExt = imageFile ? path.extname(imageFile.originalname).toLowerCase() : '';
    const videoExt = videoFile ? path.extname(videoFile.originalname).toLowerCase() : '';
    const allowedVideoExt = ['.mp4', '.webm', '.ogg', '.mov', '.mkv'];

    // Determine item type from explicit type or uploaded file content
    let finalType = type;
    if (!finalType) {
      if (videoFile) {
        finalType = 'video';
      } else {
        finalType = 'image';
      }
    }

    if (finalType === 'video') {
      // If the image file is actually a video, promote it to the video source
      if (!videoFile && imageFile && allowedVideoExt.includes(imageExt)) {
        videoFile = imageFile;
      }

      if (!videoFile) {
        return res.status(400).json({ message: 'Video file is required for type=video' });
      }
    }

    if (finalType === 'image') {
      // If only a video file was provided, treat it as a video item
      if (!imageFile && videoFile) {
        finalType = 'video';
      }

      if (!imageFile && finalType === 'image') {
        return res.status(400).json({ message: 'Image file is required for type=image' });
      }
    }

    const id = Date.now().toString(36) + '-' + Math.random().toString(16).slice(2);
    const createdAt = new Date().toISOString();

    // Build URLs
    const item = {
      id,
      type: finalType,
      title: title || '',
      description: description || '',
      category: category || 'Other',
      featured: featured === 'true' || featured === true,
      createdAt,
    };

    if (finalType === 'image') {
      item.beforeImg = toPublicUrl(`/uploads/gallery/${imageFile.filename}`);
    } else {
      // video item
      if (videoFile) {
        item.src = toPublicUrl(`/uploads/gallery/${videoFile.filename}`);
      }
      if (imageFile && allowedVideoExt.includes(imageExt)) {
        // If a video was uploaded through the image field, use it as the source too.
        item.src = toPublicUrl(`/uploads/gallery/${imageFile.filename}`);
      }
      if (imageFile && !allowedVideoExt.includes(imageExt)) {
        item.poster = toPublicUrl(`/uploads/gallery/${imageFile.filename}`);
      }
      if (!item.poster) {
        // optional: no poster
        item.poster = '';
      }
      if (!item.src && imageFile) {
        item.src = toPublicUrl(`/uploads/gallery/${imageFile.filename}`);
      }
    }

    const items = readStore();
    items.unshift(item);

    writeStore(items);

    return res.status(201).json({ message: 'Uploaded successfully', item });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Upload failed' });
  }
};

exports.getItems = async (req, res) => {
  try {
    const items = readStore();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to load gallery items' });
  }
};

exports.deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const items = readStore();
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    const [removed] = items.splice(index, 1);
    writeStore(items);

    const deleteFile = (publicUrl) => {
      if (!publicUrl) return;
      const relativePath = publicUrl.startsWith('/') ? publicUrl.slice(1) : publicUrl;
      const filePath = path.join(__dirname, '..', relativePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    };

    deleteFile(removed.beforeImg);
    deleteFile(removed.src);
    if (removed.poster && removed.poster !== removed.beforeImg) {
      deleteFile(removed.poster);
    }

    res.json({ message: 'Gallery item deleted successfully', item: removed });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to delete gallery item' });
  }
};

