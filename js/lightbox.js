// js/lightbox.js
document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const backdrop = lightbox.querySelector('.image-lightbox-backdrop');

  if (!lightbox || !lightboxImg || !backdrop) return;

  // Open on any player / owner image click
  document.body.addEventListener('click', (e) => {
    const target = e.target;

    // Only react to real images (not placeholders)
    if (target.classList.contains('player-img') || target.classList.contains('owner-img')) {
      const src = target.getAttribute('src');
      const alt = target.getAttribute('alt') || '';

      lightboxImg.src = src;
      lightboxImg.alt = alt;
      lightbox.classList.add('is-open');
    }
  });

  // Close when clicking backdrop
  backdrop.addEventListener('click', () => closeLightbox());

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  });

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightboxImg.src = '';
    lightboxImg.alt = '';
  }
});
