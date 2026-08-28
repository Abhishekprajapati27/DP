const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

const STORE_PATH = path.join(__dirname, '..', 'gallery-items.store.json');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'gallery');

// Check if Cloudinary is enabled via environment variables
const isCloudinaryEnabled = () => {
  if (process.env.CLOUDINARY_URL?.trim()) return true;
  const name = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const key = process.env.CLOUDINARY_API_KEY?.trim();
  const secret = process.env.CLOUDINARY_API_SECRET?.trim();
  return Boolean(
    name && key && secret &&
    name !== 'your_cloud_name' &&
    key !== 'your_api_key' &&
    secret !== 'your_api_secret'
  );
};

const getCloudinary = () => {
  if (isCloudinaryEnabled()) {
    if (process.env.CLOUDINARY_URL?.trim()) {
      return cloudinary;
    }
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
      api_key: process.env.CLOUDINARY_API_KEY.trim(),
      api_secret: process.env.CLOUDINARY_API_SECRET.trim()
    });
    return cloudinary;
  }
  return null;
};

const ensureStore = () => {
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify([], null, 2));
  }
};

const readStore = () => {
  ensureStore();
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStore = (items) => {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(items, null, 2));
  } catch (err) {
    console.error('Error writing to gallery store:', err.message);
  }
};

const toPublicUrl = (relativeFromBackend) => {
  if (!relativeFromBackend) return '';
  if (relativeFromBackend.startsWith('http://') || relativeFromBackend.startsWith('https://')) {
    return relativeFromBackend;
  }
  if (relativeFromBackend.startsWith('/')) return relativeFromBackend;
  return '/' + relativeFromBackend;
};

// Upload a single file to Cloudinary with fallback to local file
const uploadFile = async (file, itemDetails = {}, resourceType = 'auto') => {
  if (!file) return null;

  const cld = getCloudinary();
  if (cld && file.path) {
    try {
      const { title = '', category = '', description = '', itemType = 'image' } = itemDetails;

      const uploadRes = await cld.uploader.upload(file.path, {
        folder: 'dp_sofa_gallery',
        tags: ['dp_sofa_gallery'],
        resource_type: resourceType,
        context: {
          title: title || 'DP Sofa Dry Cleaning',
          category: category || 'Other',
          description: description || '',
          itemType: itemType || 'image'
        }
      });

      // Remove temp local file after successful Cloudinary upload
      if (fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch {}
      }

      return {
        url: uploadRes.secure_url,
        publicId: uploadRes.public_id,
        isCloudinary: true
      };
    } catch (cldError) {
      console.error('Cloudinary upload failed, falling back to local file:', cldError.message);
    }
  }

  // Local fallback URL
  return {
    url: toPublicUrl(`/uploads/gallery/${file.filename}`),
    publicId: file.filename,
    isCloudinary: false
  };
};

exports.uploadGalleryItem = async (req, res) => {
  try {
    const { title, description, category, featured, type } = req.body;

    const imageFile = req.files?.image?.[0];
    let videoFile = req.files?.video?.[0];

    const imageExt = imageFile ? path.extname(imageFile.originalname).toLowerCase() : '';
    const allowedVideoExt = ['.mp4', '.webm', '.ogg', '.mov', '.mkv'];

    let finalType = type;
    if (!finalType) {
      finalType = videoFile ? 'video' : 'image';
    }

    if (finalType === 'video') {
      if (!videoFile && imageFile && allowedVideoExt.includes(imageExt)) {
        videoFile = imageFile;
      }
      if (!videoFile) {
        return res.status(400).json({ message: 'Video file is required for video items' });
      }
    }

    if (finalType === 'image') {
      if (!imageFile && videoFile) {
        finalType = 'video';
      }
      if (!imageFile && finalType === 'image') {
        return res.status(400).json({ message: 'Image file is required for image items' });
      }
    }

    const id = Date.now().toString(36) + '-' + Math.random().toString(16).slice(2);
    const createdAt = new Date().toISOString();

    const itemMeta = {
      title: title || '',
      category: category || 'Other',
      description: description || '',
      itemType: finalType
    };

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
      const uploaded = await uploadFile(imageFile, itemMeta, 'image');
      item.beforeImg = uploaded.url;
      item.publicId = uploaded.publicId;
      item.id = uploaded.publicId || id;
    } else {
      // video item
      if (videoFile) {
        const uploadedVideo = await uploadFile(videoFile, itemMeta, 'video');
        item.src = uploadedVideo.url;
        item.publicId = uploadedVideo.publicId;
        item.id = uploadedVideo.publicId || id;
      }

      if (imageFile && !allowedVideoExt.includes(imageExt)) {
        const uploadedPoster = await uploadFile(imageFile, itemMeta, 'image');
        item.poster = uploadedPoster.url;
      } else {
        item.poster = '';
      }

      if (!item.src && imageFile) {
        const uploadedVideo = await uploadFile(imageFile, itemMeta, 'video');
        item.src = uploadedVideo.url;
        item.publicId = uploadedVideo.publicId;
        item.id = uploadedVideo.publicId || id;
      }
    }

    const items = readStore();
    items.unshift(item);
    writeStore(items);

    return res.status(201).json({ message: 'Uploaded successfully', item });
  } catch (err) {
    console.error('Gallery upload error:', err);
    return res.status(500).json({ message: err.message || 'Upload failed' });
  }
};

exports.getItems = async (req, res) => {
  try {
    const cld = getCloudinary();

    // If Cloudinary is enabled, fetch directly from Cloudinary as the primary source of truth
    if (cld) {
      try {
        const cldResources = await cld.api.resources({
          type: 'upload',
          prefix: 'dp_sofa_gallery',
          max_results: 100,
          context: true
        });

        if (cldResources && Array.isArray(cldResources.resources)) {
          const sorted = cldResources.resources.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

          const cloudItems = sorted.map((resItem) => {
            const ctx = resItem.context?.custom || resItem.context || {};
            const isVid = resItem.resource_type === 'video' || ctx.itemType === 'video';
            return {
              id: resItem.public_id,
              type: isVid ? 'video' : 'image',
              title: ctx.title || 'DP Sofa Dry Cleaning',
              description: ctx.description || '',
              category: ctx.category || 'Other',
              featured: false,
              createdAt: resItem.created_at || new Date().toISOString(),
              beforeImg: isVid ? '' : resItem.secure_url,
              src: isVid ? resItem.secure_url : '',
              poster: '',
              publicId: resItem.public_id
            };
          });

          // Sync back to local JSON cache
          writeStore(cloudItems);
          return res.json(cloudItems);
        }
      } catch (cldErr) {
        console.warn('Cloudinary fetch failed, falling back to local cache:', cldErr.message);
      }
    }

    // Local fallback
    const items = readStore();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to load gallery items' });
  }
};

exports.deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const cld = getCloudinary();

    let removed = null;

    // 1) Delete from Cloudinary if enabled
    if (cld) {
      try {
        const cleanPublicId = id.includes('dp_sofa_gallery') ? id : `dp_sofa_gallery/${id}`;
        await cld.uploader.destroy(id, { invalidate: true });
        await cld.uploader.destroy(cleanPublicId, { invalidate: true });
        await cld.uploader.destroy(id, { resource_type: 'video', invalidate: true });
        await cld.uploader.destroy(cleanPublicId, { resource_type: 'video', invalidate: true });
      } catch (cldDelErr) {
        console.warn('Cloudinary delete error:', cldDelErr.message);
      }
    }

    // 2) Delete from local JSON store
    const items = readStore();
    const index = items.findIndex((item) => item.id === id || item.publicId === id);

    if (index !== -1) {
      [removed] = items.splice(index, 1);
      writeStore(items);

      const deleteLocalFile = (publicUrl) => {
        if (!publicUrl || publicUrl.startsWith('http://') || publicUrl.startsWith('https://')) return;
        const relativePath = publicUrl.startsWith('/') ? publicUrl.slice(1) : publicUrl;
        const filePath = path.join(__dirname, '..', relativePath);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch {}
        }
      };

      deleteLocalFile(removed.beforeImg);
      deleteLocalFile(removed.src);
      if (removed.poster && removed.poster !== removed.beforeImg) {
        deleteLocalFile(removed.poster);
      }
    }

    res.json({ message: 'Gallery item deleted successfully', item: removed || { id } });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to delete gallery item' });
  }
};
