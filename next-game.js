fetch('games.json')
  .then(res => res.json())
  .then(games => {
    const now = new Date();

    const upcoming = games
      .map(g => ({ ...g, dateObj: new Date(g.date) }))
      .filter(g => g.dateObj > now)
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())[0];

    const opponentEl = document.querySelector('.next-game h2');
    const metaEl = document.querySelector('.next-game .game-meta');

    if (!opponentEl || !metaEl) return;

    if (!upcoming) {
      opponentEl.textContent = 'Season complete';
      metaEl.textContent = 'Check back next fall';
      return;
    }

    const prefix = upcoming.location === 'Away' ? '@ ' : 'vs. ';
    opponentEl.textContent = prefix + upcoming.opponent;

    metaEl.textContent =
      upcoming.dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
      ' \u00b7 ' +
      upcoming.dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) +
      ' \u00b7 ' +
      upcoming.location;
  })
  .catch(() => {
    console.error('Could not load games.json — check the file is in the same folder as index.html');
  });

  // 
  //
  //


const remindBtn = document.getElementById('remind-btn');
const calendarBtn = document.getElementById('calendar-btn');

remindBtn.addEventListener('click', () => {
  const shareData = {
    title: 'Leavitt Field Hockey vs. ' + upcoming.opponent,
    text: `Upcoming game vs ${upcoming.opponent} on ${upcoming.dateObj.toLocaleString()} at ${upcoming.location}.`,
    url: window.location.href,
  };

  if (navigator.share) {
   
    navigator.share(shareData).catch((err) => console.log('Share dismissed', err));
  } else {

    navigator.clipboard.writeText(`${shareData.title} — ${shareData.text} (${shareData.url})`)
      .then(() => {
        alert('Game details copied to clipboard! Paste them into your notes or reminders.');
      })
      .catch(() => {
        alert(`Reminder: ${shareData.title} on ${upcoming.dateObj.toLocaleString()}`);
      });
  }
});

calendarBtn.addEventListener('click', () => {
  const title = `Leavitt Field Hockey vs. ${upcoming.opponent}`;
  const startDate = upcoming.dateObj.toISOString().replace(/-|:|\.\d+/g, '');

  const endDate = new Date(upcoming.dateObj.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, '');
  const description = `Leavitt Area High School Field Hockey match at ${upcoming.location}.`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `Leavitt-FH-vs-${upcoming.opponent}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});