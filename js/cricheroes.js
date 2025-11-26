// js/cricheroes.js
document.addEventListener('DOMContentLoaded', () => {
  fetch('data/cricheroes.json')
    .then((res) => {
      if (!res.ok) throw new Error('Failed to load CricHeroes config');
      return res.json();
    })
    .then((cfg) => {
      const { tournamentName, tournamentUrl, teamUrl } = cfg;

      const nameEl = document.getElementById('cricheroes-tournament-name');
      const linkEl = document.getElementById('cricheroes-tournament-link');
      const frameEl = document.getElementById('cricheroes-embed');
      const teamLinkEl = document.getElementById('cricheroes-team-link');
      const teamWrapperEl = document.getElementById('cricheroes-team-link-wrapper');

      if (tournamentName && nameEl) {
        nameEl.textContent = tournamentName;
      }

      if (tournamentUrl && linkEl) {
        linkEl.href = tournamentUrl;
        if (!linkEl.textContent.trim()) {
          linkEl.textContent = 'View tournament on CricHeroes';
        }
      }

      // Try to embed the tournament page in an iframe
      if (tournamentUrl && frameEl) {
        frameEl.src = tournamentUrl;
      }

      // Optional team profile link
      if (teamUrl && teamLinkEl) {
        teamLinkEl.href = teamUrl;
        teamLinkEl.textContent = 'team profile';
      } else if (teamWrapperEl) {
        teamWrapperEl.style.display = 'none';
      }
    })
    .catch((err) => {
      console.warn('CricHeroes config error:', err);
      const section = document.getElementById('tournament');
      if (section) {
        section.style.display = 'none'; // hide section if config missing
      }
    });
});
