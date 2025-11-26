// js/fixtures.js
const FIXTURES_PATH = 'data/fixtures.json';

document.addEventListener('DOMContentLoaded', () => {
  loadFixtures();
});

async function loadFixtures() {
  const listEl = document.getElementById('fixtures-list');
  const nextDateEl = document.querySelector('.next-match-date');
  const nextNoteEl = document.querySelector('.next-match-note');

  try {
    const res = await fetch(FIXTURES_PATH);
    if (!res.ok) throw new Error('HTTP ' + res.status);

    const data = await res.json();
    const fixtures = Array.isArray(data.fixtures) ? data.fixtures : [];

    if (!fixtures.length) {
      if (listEl) listEl.innerHTML = '<li class="fixture-loading">No fixtures scheduled.</li>';
      if (nextDateEl) nextDateEl.textContent = 'TBC';
      if (nextNoteEl) nextNoteEl.textContent = 'Next fixture will appear here.';
      return;
    }

    // sort by date/time
    fixtures.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    // NEXT MATCH = first fixture in the future (or first in list if all past)
    const now = new Date();
    const upcoming = fixtures.filter(f => new Date(f.dateTime) >= now);
    const nextFixture = upcoming[0] || fixtures[0];

    if (nextFixture && nextDateEl && nextNoteEl) {
      const dt = new Date(nextFixture.dateTime);
      nextDateEl.textContent = formatFixtureDate(dt);
      const pieces = [];
      if (nextFixture.opponent) pieces.push(`vs ${nextFixture.opponent}`);
      if (nextFixture.ground) pieces.push(nextFixture.ground);
      if (nextFixture.location) pieces.push(nextFixture.location);
      nextNoteEl.textContent = pieces.join(' • ') || 'Details TBC';
    }

    // Render full list
    if (listEl) {
      listEl.innerHTML = '';
      fixtures.forEach(fix => {
        const li = document.createElement('li');

        const dt = new Date(fix.dateTime);
        const dateSpan = document.createElement('span');
        dateSpan.className = 'fixture-date';
        dateSpan.textContent = formatFixtureDate(dt);

        const vsSpan = document.createElement('span');
        vsSpan.className = 'fixture-vs';

        const parts = [];
        if (fix.opponent) parts.push(`vs ${fix.opponent}`);
        if (fix.ground) parts.push(fix.ground);
        if (fix.location) parts.push(fix.location);

        vsSpan.textContent = parts.length ? ` - ${parts.join(' • ')}` : ' - Details TBC';

        li.appendChild(dateSpan);
        li.appendChild(vsSpan);

        listEl.appendChild(li);
      });
    }
  } catch (err) {
    console.error('Error loading fixtures:', err);
    if (listEl) {
      listEl.innerHTML = '<li class="fixture-loading">Could not load fixtures. Check <code>data/fixtures.json</code>.</li>';
    }
  }
}

function formatFixtureDate(dt) {
  // Example: "14 Dec 4:00 PM"
  return dt.toLocaleString('en-AU', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).replace(',', '');
}
