// js/owners.js
const OWNERS_PATH = 'data/owners.json';

document.addEventListener('DOMContentLoaded', () => {
  loadOwners();
});

async function loadOwners() {
  const container = document.getElementById('owners-container');
  if (!container) return;

  try {
    const res = await fetch(OWNERS_PATH);
    if (!res.ok) throw new Error('HTTP ' + res.status);

    const data = await res.json();
    const owners = Array.isArray(data.owners) ? data.owners : [];

    renderOwners(owners, container);
  } catch (err) {
    console.error('Error loading owners:', err);
    container.innerHTML = '<p class="error-text">Could not load owners. Check <code>data/owners.json</code>.</p>';
  }
}

function renderOwners(owners, container) {
  container.innerHTML = '';

  if (!owners.length) {
    container.innerHTML = '<p class="error-text">No owners listed in <code>data/owners.json</code>.</p>';
    return;
  }

  owners.forEach((o) => {
    const id = o.number || o.id || 0;
    const name = o.name || `Owner ${id}`;
    const title = o.title || '';
    const about = o.about || '';

    const card = document.createElement('article');
    card.className = 'owner-card';

    const photoDiv = document.createElement('div');
    photoDiv.className = 'owner-photo';

    const img = document.createElement('img');
    img.src = `assets/owners/owner${id}.jpg`;
    img.alt = name;
    img.className = 'owner-img';

    img.onerror = function () {
      photoDiv.classList.add('placeholder');
      photoDiv.innerHTML = `<span>No Photo</span>`;
    };

    photoDiv.appendChild(img);

    const infoDiv = document.createElement('div');
    infoDiv.className = 'owner-info';

    const h3 = document.createElement('h3');
    h3.className = 'owner-name';
    h3.textContent = name;

    const roleP = document.createElement('p');
    roleP.className = 'owner-title';
    roleP.textContent = title;

    const aboutP = document.createElement('p');
    aboutP.className = 'owner-about';
    aboutP.textContent = about;

    infoDiv.appendChild(h3);
    if (title) infoDiv.appendChild(roleP);
    if (about) infoDiv.appendChild(aboutP);

    card.appendChild(photoDiv);
    card.appendChild(infoDiv);

    container.appendChild(card);
  });
}
