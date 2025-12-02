// js/news.js
const NEWS_JSON_PATH = 'data/news.json';
const AUTO_ROTATE_MS = 7000; // 7 seconds
const IMAGE_ROTATE_MS = 2000; // 4 seconds for rotating images within a news item

document.addEventListener('DOMContentLoaded', () => {
  loadNews();
});

let newsItems = [];
let currentIndex = 0;
let autoTimer = null;
let imageTimer = null;  
async function loadNews() {
  const slidesEl = document.getElementById('news-slides');
  const dotsEl = document.getElementById('news-dots');

  if (!slidesEl) return;

  try {
    const res = await fetch(NEWS_JSON_PATH);
    if (!res.ok) throw new Error('HTTP ' + res.status);

    const cfg = await res.json();
    const items = Array.isArray(cfg.items) ? cfg.items : [];

    if (!items.length) {
      slidesEl.innerHTML =
        '<p class="error-text">No news configured. Check <code>data/news.json</code>.</p>';
      return;
    }

    newsItems = items.map((item) => {
      const images = Array.isArray(item.images) ? item.images : [];
      return { ...item, images };
    });

    console.log('Final newsItems:', newsItems);

    renderNewsSlides(slidesEl, dotsEl);
    attachNewsControls();

    if (newsItems.length) {
      showNewsSlide(0);
      startAutoRotate();
    }
  } catch (err) {
    console.error('Error loading news:', err);
    slidesEl.innerHTML =
      '<p class="error-text">Could not load news. Check <code>data/news.json</code>.</p>';
  }
}

function renderNewsSlides(slidesEl, dotsEl) {
  slidesEl.innerHTML = '';
  if (dotsEl) dotsEl.innerHTML = '';

  newsItems.forEach((item, index) => {
    const slide = document.createElement('article');
    slide.className = 'news-slide';
    slide.setAttribute('data-index', index);

    const imgWrap = document.createElement('div');
    imgWrap.className = 'news-image-wrap';

    const images = Array.isArray(item.images) ? item.images : [];
    console.log('Rendering slide for', item.title, 'with images:', images);

    if (images.length) {
      const img = document.createElement('img');
      img.className = 'news-image';
      img.src = images[0];
      img.alt = item.title || 'News image';

      img.dataset.images = images.join('|');
      img.dataset.imgIndex = '0';

      img.onerror = function () {
        console.error('News image failed to load:', img.src);
        imgWrap.classList.add('placeholder');
        imgWrap.innerHTML = '<span>Image not available</span>';
      };

      imgWrap.appendChild(img);

      if (images.length > 1) {
        const badge = document.createElement('div');
        badge.className = 'news-photo-count';
        badge.textContent = images.length + ' photos';
        imgWrap.appendChild(badge);
      }
    } else {
      imgWrap.classList.add('placeholder');
      imgWrap.innerHTML =
        '<span>No images configured. Check <code>data/news.json</code> and assets/news/.</span>';
    }

    const body = document.createElement('div');
    body.className = 'news-body';

    const title = document.createElement('h3');
    title.className = 'news-title';
    title.textContent = item.title || 'News item';

    const meta = document.createElement('p');
    meta.className = 'news-meta';
    if (item.date) {
      meta.textContent = formatNewsDate(item.date);
    } else {
      meta.textContent = '';
    }

    const summary = document.createElement('p');
    summary.className = 'news-summary';
    summary.textContent = item.summary || '';

    body.appendChild(title);
    if (meta.textContent) body.appendChild(meta);
    if (summary.textContent) body.appendChild(summary);

    if (item.link) {
      const link = document.createElement('a');
      link.className = 'news-link';
      link.href = item.link;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Open details';
      body.appendChild(link);
    }

    slide.appendChild(imgWrap);
    slide.appendChild(body);
    slidesEl.appendChild(slide);

    if (dotsEl) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'news-dot';
      dot.setAttribute('data-index', index);
      dot.addEventListener('click', () => {
        showNewsSlide(index);
        resetAutoRotate();
      });
      dotsEl.appendChild(dot);
    }
  });
}

function attachNewsControls() {
  const prevBtn = document.querySelector('.news-prev');
  const nextBtn = document.querySelector('.news-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      showNewsSlide(currentIndex - 1);
      resetAutoRotate();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      showNewsSlide(currentIndex + 1);
      resetAutoRotate();
    });
  }
}

function showNewsSlide(index) {
  if (!newsItems.length) return;

  const slides = document.querySelectorAll('.news-slide');
  const dots = document.querySelectorAll('.news-dot');

  const total = newsItems.length;
  currentIndex = ((index % total) + total) % total;

  slides.forEach((slide, idx) => {
    slide.classList.toggle('is-active', idx === currentIndex);
  });

  dots.forEach((dot, idx) => {
    dot.classList.toggle('is-active', idx === currentIndex);
  });

  // NEW: when the active slide changes, rotate its images (if more than one)
  resetImageRotateForActiveSlide();
}


function startAutoRotate() {
  stopAutoRotate();
  autoTimer = setInterval(() => {
    showNewsSlide(currentIndex + 1);
  }, AUTO_ROTATE_MS);
}

function stopAutoRotate() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
}

function resetAutoRotate() {
  startAutoRotate();
}
function stopImageRotate() {
  if (imageTimer) {
    clearInterval(imageTimer);
    imageTimer = null;
  }
}

function resetImageRotateForActiveSlide() {
  stopImageRotate();

  const activeSlide = document.querySelector('.news-slide.is-active');
  if (!activeSlide) return;

  const img = activeSlide.querySelector('.news-image');
  if (!img) return;

  const imagesAttr = img.dataset.images || '';
  const all = imagesAttr.split('|').map((s) => s.trim()).filter(Boolean);

  if (all.length <= 1) return; // nothing to rotate

  let imgIndex = parseInt(img.dataset.imgIndex || '0', 10) || 0;

  imageTimer = setInterval(() => {
    imgIndex = (imgIndex + 1) % all.length;
    img.dataset.imgIndex = String(imgIndex);
    img.src = all[imgIndex];
  }, IMAGE_ROTATE_MS);
}

function formatNewsDate(dateStr) {
  const dt = new Date(dateStr);
  if (isNaN(dt)) return dateStr;
  return dt.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}
