document.addEventListener('DOMContentLoaded', () => {
  // GSAP optional
  if (typeof window.gsap !== 'undefined') {
    gsap.from('.hero h1', {
      opacity: 0,
      y: 80,
      duration: 1
    });

    gsap.from('.gallery-card', {
      opacity: 0,
      y: 100,
      duration: 1,
      stagger: 0.15
    });
  }

  const galleryGrid = document.querySelector('.gallery');

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxVideo = document.getElementById('lightboxVideo');
  const closeBtn = document.getElementById('closeBtn');

  // gallery items come from gallery-content.js
  // If module import fails (older browsers), the page will still not crash.
  // We rely on gallery.html using <script type="module">.
  const renderFromItems = (items) => {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = '';

    items.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'gallery-card';

      // Support: image-only and video items
      const overlay = document.createElement('div');
      overlay.className = 'overlay';
      overlay.textContent = item.title || '';

      const isVideoItem = item.type === 'video' || /\.(mp4|webm|ogg|mov|mkv)$/i.test(item.beforeImg || item.src || item.poster);
      if (isVideoItem) {
        const videoPreview = document.createElement('video');
        videoPreview.muted = true;
        videoPreview.playsInline = true;
        videoPreview.preload = 'metadata';
        videoPreview.style.width = '100%';
        videoPreview.style.maxHeight = '260px';
        videoPreview.style.objectFit = 'cover';
        videoPreview.style.borderRadius = '12px';
        if (item.poster) videoPreview.poster = item.poster;
        const videoSrc = item.src || item.beforeImg;
        if (videoSrc) {
          const source = document.createElement('source');
          source.src = videoSrc;
          source.type = 'video/mp4';
          videoPreview.appendChild(source);
        }
        card.appendChild(videoPreview);
        card.appendChild(overlay);

        card.addEventListener('click', () => {
          openLightbox({
            type: 'video',
            title: item.title,
            src: videoSrc,
            poster: item.poster || item.beforeImg
          });
        });
      } else {
        const img = document.createElement('img');
        img.src = item.beforeImg;
        img.alt = item.title || 'Gallery item';
        card.appendChild(img);
        card.appendChild(overlay);

        card.addEventListener('click', () => {
          openLightbox({
            type: 'image',
            title: item.title,
            src: item.beforeImg
          });
        });
      }

      galleryGrid.appendChild(card);
    });
  };

  const openLightbox = ({ type, src, poster }) => {
    if (!lightbox) return;

    lightbox.style.display = 'flex';

    if (type === 'video') {
      if (lightboxVideo) {
        lightboxVideo.style.display = 'block';
        lightboxVideo.poster = poster || '';
        lightboxVideo.src = src;
        lightboxVideo.load();
      }
      if (lightboxImg) lightboxImg.style.display = 'none';
    } else {
      if (lightboxImg) {
        lightboxImg.style.display = 'block';
        lightboxImg.src = src;
      }
      if (lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.removeAttribute('src');
        lightboxVideo.load();
        lightboxVideo.style.display = 'none';
      }
    }
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.style.display = 'none';

    // stop video if open
    if (lightboxVideo) {
      lightboxVideo.pause();
      lightboxVideo.removeAttribute('src');
      lightboxVideo.load();
    }
  };

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Dev: localhost server on port 5000. Prod: same origin (backend serves frontend).
  const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : window.location.origin;
  const API_PATH = `${API_BASE}/api`;
  const toBackendUrl = (src) => {
    if (!src) return src;
    if (/^https?:\/\//i.test(src)) return src;
    if (src.startsWith('/')) return `${API_BASE}${src}`;
    return `${API_BASE}/${src}`;
  };

  // Load items (images/videos) directly without modifying HTML:
  // Update urls in js/gallery-items.json.
  (async () => {
    try {
      const endpoints = [`${API_PATH}/gallery-no-db/items`, `${API_PATH}/gallery/items`];
      let items = [];

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, { cache: 'no-store' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          if (Array.isArray(data)) {
            items = data;
            break;
          }
        } catch (err) {
          console.warn(`Failed to load gallery from ${endpoint}:`, err.message);
        }
      }

      if (items.length > 0) {
        items = items.map((item) => ({
          ...item,
          beforeImg: toBackendUrl(item.beforeImg),
          poster: toBackendUrl(item.poster),
          src: toBackendUrl(item.src)
        }));
        renderFromItems(items);
        return;
      }
    } catch (err) {
      console.warn('gallery-items.json load failed:', err);
    }

    // Fallback: keep existing markup
    const galleryCards = document.querySelectorAll('.gallery-card');
    galleryCards.forEach((card) => {
      card.addEventListener('click', () => {
        const img = card.querySelector('img');
        if (!img) return;
        openLightbox({ type: 'image', src: img.src });
      });
    });
  })();
});
