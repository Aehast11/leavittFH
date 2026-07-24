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
      .filter(f => f.type === 'file' && IMAGE_EXTENSIONS.some(ext => f.name.toLowerCase().endsWith(ext)))
      .map(f => f.download_url);

    const strip = document.querySelector('.photo-strip');

    if (photos.length === 0) {
      strip.remove();
      return;
    }

    photos.forEach((url, i) => {
      const img = document.createElement('img');
      img.src = url;
      img.alt = '';
      img.className = 'photo-strip-img';
      if (i === 0) img.classList.add('is-active');
      strip.appendChild(img);
    });

    if (photos.length > 1) {
      let current = 0;
      setInterval(() => {
        const imgs = strip.querySelectorAll('.photo-strip-img');
        imgs[current].classList.remove('is-active');
        current = (current + 1) % imgs.length;
        imgs[current].classList.add('is-active');
      }, ROTATE_SECONDS * 1000);
    }
  })
  .catch(err => {
    console.error('Could not load photo strip:', err);
    const strip = document.querySelector('.photo-strip');
    if (strip) strip.remove();
  });
