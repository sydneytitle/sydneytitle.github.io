// js/players.js
const SQUAD_DATA_PATH = 'data/squad.json';

document.addEventListener('DOMContentLoaded', () => {
  loadSquad();
});

async function loadSquad() {
  const container = document.getElementById('players-container');

  try {
    const res = await fetch(SQUAD_DATA_PATH);
    if (!res.ok) throw new Error('HTTP ' + res.status);

    const data = await res.json();

    const seasonYear = data.season || data.year;
    if (seasonYear) {
      const spanYear = document.getElementById('season-year');
      const spanYearInline = document.getElementById('season-year-inline');
      if (spanYear) spanYear.textContent = seasonYear;
      if (spanYearInline) spanYearInline.textContent = seasonYear;
    }

    const players = Array.isArray(data.players) ? data.players : [];
    renderPlayers(players, container);
  } catch (err) {
    console.error('Error loading squad:', err);
    if (container) {
      container.innerHTML = '<p class="error-text">Could not load squad. Check <code>data/squad.json</code>.</p>';
    }
  }
}

function renderPlayers(players, container) {
  if (!container) return;
  container.innerHTML = '';

  if (!players.length) {
    container.innerHTML = '<p class="error-text">No players found in <code>data/squad.json</code>.</p>';
    return;
  }

  players.forEach((p) => {
    const id = p.number || p.id || p.player || 0;
    const name = p.name || `Player ${id}`;
    const role = p.role || '';
    const isCaptain = !!p.isCaptain;
    const isKeeper = !!p.isKeeper;

    const card = document.createElement('article');
    card.className = 'player-card' + (isCaptain ? ' captain' : '');

    const photoDiv = document.createElement('div');
    photoDiv.className = 'player-photo';

    const img = document.createElement('img');
    img.src = `assets/players/player${id}.jpg`;
    img.alt = name;
    img.className = 'player-img';

    // if the image isn't there yet, fall back to a "upload" placeholder
    img.onerror = function () {
      photoDiv.classList.add('placeholder');
      photoDiv.innerHTML = `<span>No Photo</span>`;
    };

    photoDiv.appendChild(img);

    const infoDiv = document.createElement('div');
    infoDiv.className = 'player-info';

    const title = document.createElement('h3');
    title.className = 'player-name';
    title.textContent = name;

 if (isCaptain) {
  const badge = document.createElement('span');
  badge.className = 'badge badge-captain';
  badge.textContent = 'Captain';
  title.appendChild(badge);
}

if (!isCaptain && p.isViceCaptain) {
  const badgeVC = document.createElement('span');
  badgeVC.className = 'badge badge-vice';
  badgeVC.textContent = 'Vice Captain';
  title.appendChild(badgeVC);
}

if (isKeeper) {
  const badgeWK = document.createElement('span');
  badgeWK.className = 'badge badge-secondary';
  badgeWK.textContent = 'Wicketkeeper';
  title.appendChild(badgeWK);
}

    const roleP = document.createElement('p');
    roleP.className = 'player-role';
    roleP.textContent = role;

    infoDiv.appendChild(title);
    infoDiv.appendChild(roleP);

    card.appendChild(photoDiv);
    card.appendChild(infoDiv);

    container.appendChild(card);
  });
}
