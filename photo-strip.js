const REPO_OWNER = 'Aehast11';
const REPO_NAME = 'leavittFH';
const FOLDER = 'photostrip';
const ROTATE_SECONDS = 5;

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FOLDER}`)
  .then(res => {
    if (!res.ok) throw new Error('GitHub API request failed: ' + res.status);
    return res.json();
  })
  .then(files => {
    const photos = files
      .filter(
        f =>
          f.type === 'file' &&
          IMAGE_EXTENSIONS.some(ext => f.name.toLowerCase().endsWith(ext))
      )
      .map(f => f.download_url)
      .filter(url => typeof url === 'string');

    const stripEl = document.querySelector('.photo-strip');
    if (!(stripEl instanceof HTMLElement)) return;

    if (photos.length === 0) {
      stripEl.remove();
      return;
    }

    photos.forEach((url, i) => {
      const imgEl = document.createElement('img');
      imgEl.src = url;
      imgEl.alt = '';
      imgEl.className = 'photo-strip-img';
      if (i === 0) imgEl.classList.add('is-active');
      stripEl.appendChild(imgEl);
    });

    if (photos.length > 1) {
      let currentIndex = 0;

      window.setInterval(() => {
        const imgs = stripEl.querySelectorAll('.photo-strip-img');

        imgs[currentIndex].classList.remove('is-active');
        currentIndex = (currentIndex + 1) % imgs.length;
        imgs[currentIndex].classList.add('is-active');
      }, ROTATE_SECONDS * 1000);
    }
  })
  .catch(err => {
    console.error('Could not load photo strip:', err);

    const stripElErrCase = document.querySelector('.photo-strip');
    if (stripElErrCase instanceof HTMLElement) stripElErrCase.remove();
  });