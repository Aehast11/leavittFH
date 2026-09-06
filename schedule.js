const scheduleList = document.querySelector('.schedule-list');
const scheduleStatus = document.querySelector('.schedule-status');

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric'
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit'
});

function createGameRow(game) {
  const date = new Date(game.date);
  const row = document.createElement('article');
  const isPast = date < new Date();

  row.className = `game-row ${game.location.toLowerCase()} ${isPast ? 'past' : 'upcoming'}`;
  row.innerHTML = `
    <p class="game-date"><span>${date.toLocaleDateString('en-US', { month: 'short' })}</span>${date.getDate()}</p>
    <div>
      <h3 class="game-opponent">${game.opponent}</h3>
      <p class="game-time">${dateFormatter.format(date)} &middot; ${timeFormatter.format(date)}</p>
    </div>
    <p class="game-location">${game.location}</p>
  `;

  return row;
}

fetch('games.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Schedule data could not be loaded.');
    }
    return response.json();
  })
  .then(games => {
    const sortedGames = games
      .map(game => ({ ...game, dateObject: new Date(game.date) }))
      .sort((a, b) => a.dateObject - b.dateObject);

    sortedGames.forEach(game => scheduleList.appendChild(createGameRow(game)));
    scheduleStatus.textContent = `${sortedGames.length} matches scheduled`;
  })
  .catch(error => {
    scheduleStatus.textContent = error.message;
  });
