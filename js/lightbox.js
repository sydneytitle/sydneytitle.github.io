// js/lightbox.js

document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const backdrop = lightbox ? lightbox.querySelector('.image-lightbox-backdrop') : null;
  const captionEl = document.getElementById('lightbox-caption');
  const prevBtn = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
  const nextBtn = lightbox ? lightbox.querySelector('.lightbox-next') : null;

  if (!lightbox || !lightboxImg || !backdrop) return;

  let galleryImages = [];
  let galleryIndex = 0;
  let galleryLabel = '';
let thumbGrid = null;

  function ensureThumbGrid() {
    if (thumbGrid) return thumbGrid;

    thumbGrid = document.createElement('div');
    thumbGrid.className = 'image-lightbox-thumbs';
    lightbox.appendChild(thumbGrid);
    return thumbGrid;
  }

  function openGrid(images, label = '') {
    if (!images || !images.length) return;

    const grid = ensureThumbGrid();
    grid.innerHTML = '';

    images.forEach((src, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'image-lightbox-thumb';

      const img = document.createElement('img');
      img.src = src;
      img.alt = `${label || 'Image'} ${idx + 1}`;

      btn.appendChild(img);

      btn.addEventListener('click', () => {
        // switch from grid mode to normal gallery mode
        lightbox.classList.remove('is-grid');
        grid.innerHTML = '';
        openGallery(images, idx, label);
      });

      grid.appendChild(btn);
    });

    galleryLabel = label || '';
    lightbox.classList.add('is-open', 'is-grid');
  }
  function openGallery(images, startIndex = 0, label = '') {
    if (!images || !images.length) return;
    galleryImages = images;
    galleryIndex = Math.min(Math.max(startIndex, 0), images.length - 1);
    galleryLabel = label || '';
    updateLightboxImage();
    lightbox.classList.add('is-open');
    lightbox.classList.remove('is-grid'); // make sure we’re not in grid mode
  }

  function updateLightboxImage() {
    const src = galleryImages[galleryIndex];
    lightboxImg.src = src;
    lightboxImg.alt = galleryLabel || 'Image';

    if (captionEl) {
      if (galleryImages.length > 1) {
        captionEl.textContent = `${galleryIndex + 1} / ${galleryImages.length}`;
      } else {
        captionEl.textContent = '';
      }
    }
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open', 'is-grid');
    galleryImages = [];
    galleryIndex = 0;
    galleryLabel = '';
    lightboxImg.src = '';
    lightboxImg.alt = '';
    if (captionEl) captionEl.textContent = '';
    if (thumbGrid) thumbGrid.innerHTML = '';
  }

  function showPrev() {
    if (!galleryImages.length) return;
    galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
  }

  function showNext() {
    if (!galleryImages.length) return;
    galleryIndex = (galleryIndex + 1) % galleryImages.length;
    updateLightboxImage();
  }

  // Click handler for players, owners, and news
  document.body.addEventListener('click', (e) => {
    const target = e.target;

    // Player or owner – single image
    if (target.classList.contains('player-img') || target.classList.contains('owner-img')) {
      const src = target.getAttribute('src');
      const alt = target.getAttribute('alt') || '';
      if (!src) return;
      openGallery([src], 0, alt);
      return;
    }

    // News image – possibly multiple images (from data-images)
    // News image – possibly multiple images (from data-images)
    if (target.classList.contains('news-image')) {
      const imagesAttr = target.dataset.images || '';
      const all = imagesAttr.split('|').map((s) => s.trim()).filter(Boolean);
      const startIndex = parseInt(target.dataset.imgIndex || '0', 10) || 0;
      const alt = target.getAttribute('alt') || 'News image';
      if (!all.length) return;

      // If only 1 image, behave exactly as before
      if (all.length === 1) {
        openGallery(all, 0, alt);
      } else {
        // Show grid of all photos first
        openGrid(all, alt);

        // Optional: scroll current image’s thumb into view
        setTimeout(() => {
          const grid = lightbox.querySelector('.image-lightbox-thumbs');
          if (!grid) return;
          const thumbs = grid.querySelectorAll('.image-lightbox-thumb');
          const currentThumb = thumbs[startIndex];
          if (currentThumb && currentThumb.scrollIntoView) {
            currentThumb.scrollIntoView({ block: 'center' });
          }
        }, 0);
      }
      return;
    }

  });

  // Backdrop click closes
  backdrop.addEventListener('click', () => closeLightbox());

  // Buttons
  if (prevBtn) prevBtn.addEventListener('click', showPrev);
  if (nextBtn) nextBtn.addEventListener('click', showNext);

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      showPrev();
    } else if (e.key === 'ArrowRight') {
      showNext();
    }
  });

  // OPTIONAL: allow external scripts to open galleries
  window.addEventListener('open-image-gallery', (ev) => {
    const detail = ev.detail || {};
    const imgs = detail.images || [];
    const start = detail.startIndex || 0;
    const label = detail.label || '';
    if (!imgs.length) return;
    openGallery(imgs, start, label);
  });
});
