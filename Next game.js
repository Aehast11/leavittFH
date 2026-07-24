fetch('games.json')
  .then(res => res.json())
  .then(games => {
    const now = new Date();
    const upcoming = games
      .map(g => ({ ...g, dateObj: new Date(g.date) }))
      .filter(g => g.dateObj > now)
      .sort((a, b) => a.dateObj - b.dateObj)[0];

    const opponentEl = document.querySelector('.next-game h2');
    const metaEl = document.querySelector('.next-game .game-meta');

    if (!upcoming) {
      opponentEl.textContent = 'Season complete';
      metaEl.textContent = 'Check back next fall';
      return;
    }

    const prefix = upcoming.location === 'Away' ? '@ ' : 'vs. ';

    opponentEl.textContent = prefix + upcoming.opponent;
    metaEl.textContent = upcoming.dateObj.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    }) + ' \u00b7 ' + upcoming.dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit'
    }) + ' \u00b7 ' + upcoming.location;
  })
  .catch(() => {
    console.error('Could not load games.json — check the file is in the same folder as index.html');
  });
