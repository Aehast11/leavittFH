const RESULTS_TO_SHOW = 5;

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric'
});

function outcome(score) {
  if (score.for > score.against) return 'win';
  if (score.for < score.against) return 'loss';
  return 'tie';
}

function outcomeLabel(kind) {
  if (kind === 'win') return 'W';
  if (kind === 'loss') return 'L';
  return 'T';
}

function createResultRow(game) {
  const kind = outcome(game.score);
  const row = document.createElement('div');
  row.className = `result-row ${kind}`;

  const vsPrefix = game.location === 'Away' ? '@' : 'vs.';

  row.innerHTML = `
    <div class="result-opponent">
      <span class="vs-line">${vsPrefix} ${game.opponent}</span>
      <span class="result-date">${dateFormatter.format(game.dateObj)}</span>
    </div>
    <div class="result-score">
      <span class="result-badge">${outcomeLabel(kind)}</span>
      <span class="result-score-value">${game.score.for}-${game.score.against}</span>
    </div>
  `;

  return row;
}

fetch('games.json')
  .then(res => res.json())
  .then(games => {
    const now = new Date();
    const listEl = document.querySelector('.results-list');
    if (!listEl) return;

    const played = games
      .map(g => ({ ...g, dateObj: new Date(g.date) }))
      .filter(g => g.dateObj < now && g.score)
      .sort((a, b) => b.dateObj - a.dateObj)
      .slice(0, RESULTS_TO_SHOW);

    if (played.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'results-empty';
      empty.textContent = 'No results posted yet — check back after the next game.';
      listEl.appendChild(empty);
      return;
    }

    played.forEach(game => listEl.appendChild(createResultRow(game)));
  })
  .catch((err) => {
    console.error('Could not load recent results:', err);
    const listEl = document.querySelector('.results-list');
    if (listEl) {
      listEl.innerHTML = '<p class="results-empty">Couldn\'t load results right now — try refreshing.</p>';
    }
  });