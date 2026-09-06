let upcoming = null;

function toIcsDate(date) {
  return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
}

function buildEventDetails() {
  const title = `Leavitt Field Hockey ${upcoming.location === 'Away' ? '@' : 'vs.'} ${upcoming.opponent}`;
  const description = `Leavitt Area High School Field Hockey match at ${upcoming.location}.`;
  const start = upcoming.dateObj;
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  return { title, description, start, end };
}

function buildGoogleCalendarUrl() {
  const { title, description, start, end } = buildEventDetails();
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toIcsDate(start)}/${toIcsDate(end)}`,
    details: description,
    location: upcoming.location
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function buildIcsContent() {
  const { title, description, start, end } = buildEventDetails();
  const uid = `${start.getTime()}-${upcoming.opponent.replace(/\s+/g, '-')}@leavitt-fh.vercel.app`;
  const dtstamp = toIcsDate(new Date());

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Leavitt Field Hockey//Schedule//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${upcoming.location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

function downloadIcs() {
  const icsContent = buildIcsContent();

  if (isIOS()) {
    // iOS Safari needs a direct navigation to a calendar data URI to trigger
    // the native "Add Event" screen — the download attribute is unreliable here.
    window.location.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsContent);
    return;
  }

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `Leavitt-FH-vs-${upcoming.opponent}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(link.href);
}

function closeCalendarMenu() {
  const menu = document.getElementById('calendar-menu');
  if (menu) menu.hidden = true;
}

function initCalendarButton() {
  const calendarBtn = document.getElementById('calendar-btn');
  const calendarMenu = document.getElementById('calendar-menu');
  const googleLink = document.getElementById('google-cal-link');
  const icsBtn = document.getElementById('ics-cal-btn');

  if (!calendarBtn || !calendarMenu || !googleLink || !icsBtn) return;

  calendarBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!upcoming) return;

    const wantsToAdd = window.confirm('Do you want to add this event to your calendar?');
    if (!wantsToAdd) return;

    googleLink.href = buildGoogleCalendarUrl();
    calendarMenu.hidden = false;
  });

  icsBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    downloadIcs();
    closeCalendarMenu();
  });

  googleLink.addEventListener('click', () => {
    closeCalendarMenu();
  });

  calendarMenu.addEventListener('click', (event) => event.stopPropagation());
  document.addEventListener('click', closeCalendarMenu);
}

function initRemindButton() {
  const remindBtn = document.getElementById('remind-btn');
  if (!remindBtn) return;

  remindBtn.addEventListener('click', () => {
    if (!upcoming) return;

    const { title, description } = buildEventDetails();
    const shareData = {
      title,
      text: description,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(`${shareData.title} — ${shareData.text} (${shareData.url})`)
        .then(() => {
          alert('Game details copied to clipboard! Paste them into your notes or reminders app.');
        })
        .catch(() => {
          alert(`Reminder: ${shareData.title}`);
        });
      return;
    }

    alert(`Reminder: ${shareData.title}`);
  });
}

fetch('games.json')
  .then(res => res.json())
  .then(games => {
    const now = new Date();

    upcoming = games
      .map(g => ({ ...g, dateObj: new Date(g.date) }))
      .filter(g => g.dateObj > now)
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())[0];

    const opponentEl = document.querySelector('.next-game h2');
    const metaEl = document.querySelector('.next-game .game-meta');
    const iconsWrap = document.querySelector('.game-icons');

    if (!opponentEl || !metaEl) return;

    if (!upcoming) {
      opponentEl.textContent = 'Season complete';
      metaEl.textContent = 'Check back next fall';
      if (iconsWrap) iconsWrap.style.display = 'none';
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

    initCalendarButton();
    initRemindButton();
  })
  .catch((err) => {
    console.error('Could not load games.json — check the file is in the same folder as index.html', err);
    const opponentEl = document.querySelector('.next-game h2');
    const metaEl = document.querySelector('.next-game .game-meta');
    const iconsWrap = document.querySelector('.game-icons');
    if (opponentEl) opponentEl.textContent = "Couldn't load schedule";
    if (metaEl) metaEl.textContent = 'Try refreshing the page';
    if (iconsWrap) iconsWrap.style.display = 'none';
  });