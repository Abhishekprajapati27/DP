document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : window.location.origin;
  const token = localStorage.getItem('adminToken');

  const form = document.getElementById('uploadForm');
  const msg = document.getElementById('uploadMessage');
  const logoutBtn = document.getElementById('logoutBtn');
  const uploadBtn = form?.querySelector('button[type="submit"]');

  const typeEl = document.getElementById('itemType');
  const imageEl = document.getElementById('imageFile');
  const videoEl = document.getElementById('videoFile');
  const categoryEl = document.getElementById('category');
  const imageField = document.getElementById('imageFileField');
  const videoField = document.getElementById('videoFileField');

  if (!token) {
    if (msg) {
      msg.textContent = 'Login first (adminToken missing).';
      msg.className = 'form-message error';
    }
    // Redirect to login page
    setTimeout(() => (window.location.href = 'admin.html'), 1200);
    return;
  }

  const setMessage = (text, kind = 'error') => {
    if (!msg) return;
    msg.textContent = text;
    msg.className = `form-message ${kind}`;
    setTimeout(() => {
      msg.textContent = '';
      msg.className = 'form-message';
    }, 5000);
  };

  const galleryItemsContainer = document.getElementById('galleryItemsContainer');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = 'admin.html';
    });
  }

  const updateFileInputs = () => {
    const selectedType = typeEl?.value || 'image';
    if (imageField) imageField.style.display = selectedType === 'image' ? 'block' : 'none';
    if (videoField) videoField.style.display = selectedType === 'video' ? 'block' : 'none';
  };

  typeEl?.addEventListener('change', updateFileInputs);
  updateFileInputs();

  const renderGalleryItems = (items) => {
    if (!galleryItemsContainer) return;

    if (!items || items.length === 0) {
      galleryItemsContainer.innerHTML = '<p class="helper">No gallery items found yet.</p>';
      return;
    }

    galleryItemsContainer.innerHTML = items.map((item) => {
      const preview = item.type === 'video'
        ? `<video controls width="100%" style="max-height:220px; border-radius: 12px;"><source src="${item.src}" type="video/mp4">Your browser does not support video.</video>`
        : `<img src="${item.beforeImg}" alt="${item.title}" style="width:100%; border-radius:12px; object-fit:cover; max-height:220px;" />`;

      return `
        <div class="gallery-item-card">
          <div class="gallery-item-header">
            <div>
              <strong>${item.title || 'Untitled'}</strong>
              <div class="gallery-item-meta">${item.type.toUpperCase()} • ${item.category || 'Uncategorized'} • ${new Date(item.createdAt).toLocaleString()}</div>
            <button type="button" class="delete-item-btn btn-secondary" data-id="${item.id}">Delete</button>
          </div>
          <div style="margin-top:12px;">${preview}</div>
          <p class="gallery-item-meta" style="margin-top:12px;">${item.description || 'No description.'}</p>
        </div>`;
    }).join('');
  };

  const loadGalleryItems = async () => {
    if (!galleryItemsContainer) return;
    galleryItemsContainer.innerHTML = '<p class="helper">Loading gallery items...</p>';

    try {
      const res = await fetch(`${API_BASE}/api/gallery-no-db/items`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to load gallery items');
      }
      renderGalleryItems(data);
    } catch (error) {
      galleryItemsContainer.innerHTML = `<p class="helper error">${error.message || 'Unable to load gallery items.'}</p>`;
    }
  };

  const deleteGalleryItem = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/gallery-no-db/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Delete failed');
      }
      setMessage('Gallery item deleted successfully.', 'success');
      loadGalleryItems();
    } catch (error) {
      setMessage(error.message || 'Unable to delete item.', 'error');
    }
  };

  galleryItemsContainer?.addEventListener('click', async (e) => {
    const button = e.target.closest('.delete-item-btn');
    if (!button) return;
    const id = button.dataset.id;
    if (!id) return;
    if (confirm('Are you sure you want to delete this gallery item?')) {
      await deleteGalleryItem(id);
    }
  });

  // Load existing items on page open so delete UI works immediately
  loadGalleryItems();

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (uploadBtn) uploadBtn.disabled = true;

    const itemType = typeEl?.value || 'image';

    const formData = new FormData();
    formData.append('type', itemType);
    formData.append('title', document.getElementById('title').value.trim());
    formData.append('description', document.getElementById('description').value.trim());
    formData.append('category', categoryEl?.value || 'Other');
    formData.append('featured', document.getElementById('featured').value);

    // Attach image/video
    if (imageEl?.files?.[0]) formData.append('image', imageEl.files[0]);
    if (videoEl?.files?.[0]) formData.append('video', videoEl.files[0]);

    // Client-side validation to avoid 400
    if (itemType === 'image' && !imageEl?.files?.[0]) {
      setMessage('Please choose an image file.', 'error');
      if (uploadBtn) uploadBtn.disabled = false;
      return;
    }
    if (itemType === 'video' && !videoEl?.files?.[0]) {
      setMessage('Please choose a video file for type=video.', 'error');
      if (uploadBtn) uploadBtn.disabled = false;
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/gallery-no-db/upload-gallery-item`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setMessage('Upload successful! Gallery updated.', 'success');
      await loadGalleryItems();

      // clear files
      if (imageEl) imageEl.value = '';
      if (videoEl) videoEl.value = '';

    } catch (err) {
      setMessage(err.message || 'Upload error', 'error');
    } finally {
      if (uploadBtn) uploadBtn.disabled = false;
    }
  });
});
