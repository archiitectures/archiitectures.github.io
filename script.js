// Zoom out hero background as you scroll down
const heroBg = document.getElementById('heroBg');
const projectsShell = document.querySelector('.projects-index, .project-page');

if (projectsShell) {
  document.body.classList.add('project-site');
}

function onScroll() {
  if (!heroBg) return;
  const scrollY = window.scrollY;
  const heroH = window.innerHeight;
  const progress = Math.min(scrollY / heroH, 1);
  const scale = 1.12 - progress * 0.12;
  heroBg.style.transform = `scale(${scale})`;
}

document.querySelectorAll('.github-link').forEach((link) => {
  const video = link.querySelector('.github-hover-video');
  const gif = link.querySelector('.github-hover-gif');

  if (!video || !gif) return;

  const canUseWebm = typeof video.canPlayType === 'function' && video.canPlayType('video/webm; codecs="vp8, vorbis"') !== '';

  link.classList.toggle('github-gif-fallback', !canUseWebm);

  video.hidden = true;
  gif.hidden = true;

  const startPreview = () => {
    link.classList.add('is-hovering');
    if (canUseWebm) {
      video.hidden = false;
      gif.hidden = true;
      video.currentTime = 0;
      const maybePromise = video.play();
      if (maybePromise && typeof maybePromise.catch === 'function') {
        maybePromise.catch(() => {});
      }
    } else {
      video.hidden = true;
      gif.hidden = false;
    }
  };

  const stopPreview = () => {
    link.classList.remove('is-hovering');
    if (canUseWebm) {
      video.pause();
      video.currentTime = 0;
    }
    video.hidden = true;
    gif.hidden = true;
  };

  link.addEventListener('pointerenter', startPreview);
  link.addEventListener('pointerleave', stopPreview);
});

document.querySelectorAll('.project-card--gif-preview').forEach((card) => {
  const hoverGif = card.querySelector('.project-card-hover-gif[data-hover-src]');
  if (!hoverGif) return;

  const hoverSrc = hoverGif.dataset.hoverSrc;

  const startPreview = () => {
    card.classList.add('is-hovering');
    hoverGif.removeAttribute('src');
    hoverGif.src = hoverSrc;
  };

  const stopPreview = () => {
    card.classList.remove('is-hovering');
    hoverGif.removeAttribute('src');
  };

  card.addEventListener('pointerenter', startPreview);
  card.addEventListener('pointerleave', stopPreview);
  card.addEventListener('focus', startPreview);
  card.addEventListener('blur', stopPreview);
});

if (heroBg) {
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Toggle protein background
const proteinToggle = document.getElementById('proteinToggle');
const aboutSection = document.querySelector('.about');
const proteinViewer = document.getElementById('proteinViewer');
const proteinHost = aboutSection || document.body;
const proteinStateKey = 'archiitectures.proteinEnabled';
let viewerInitialized = false;
let proteinViewerInstance = null;
let proteinLoadPromise = null;

function readProteinState() {
  try {
    return window.localStorage.getItem(proteinStateKey);
  } catch {
    return null;
  }
}

function writeProteinState(enabled) {
  try {
    window.localStorage.setItem(proteinStateKey, enabled ? '1' : '0');
  } catch {
    // Ignore storage failures and keep the current page state working.
  }
}

function ensureProteinViewer() {
  if (!proteinToggle || !proteinViewer || proteinLoadPromise) return proteinLoadPromise;
  if (viewerInitialized) return Promise.resolve(proteinViewerInstance);

  viewerInitialized = true;
  proteinLoadPromise = Promise.resolve().then(() => {
    proteinViewerInstance = $3Dmol.createViewer('proteinViewer', {
      backgroundColor: 'transparent',
    });

    return fetch('/protein.pdb')
      .then(r => r.text())
      .then(data => {
        proteinViewerInstance.addModel(data, 'pdb');
        proteinViewerInstance.setStyle({}, {
          cartoon: {
            color: '#232323',
            thickness: 0.4,
            opacity: 0.85,
          }
        });
        proteinViewerInstance.setBackgroundColor(0x1c1c1c, 0);
        proteinViewerInstance.zoom(0.85);
        proteinViewerInstance.render();
        proteinViewerInstance.spin('y', 0.5);

        // Allow page scroll when not dragging
        proteinViewer.style.pointerEvents = 'auto';
        const canvas = document.querySelector('#proteinViewer canvas');
        if (canvas) {
          canvas.style.pointerEvents = 'auto';
        }

        return proteinViewerInstance;
      });
  });

  return proteinLoadPromise;
}

function setProteinEnabled(enabled, persist = false) {
  if (!proteinToggle || !proteinViewer) return;

  proteinToggle.classList.toggle('active', enabled);
  if (proteinHost) {
    proteinHost.classList.toggle('protein-active', enabled);
  }

  if (persist) {
    writeProteinState(enabled);
  }

  if (enabled) {
    ensureProteinViewer();
  }
}

const storedProteinState = readProteinState();
const initialProteinEnabled = storedProteinState === null
  ? Boolean(aboutSection)
  : storedProteinState === '1';

if (storedProteinState === null && aboutSection) {
  writeProteinState(true);
}

setProteinEnabled(initialProteinEnabled);

if (window.$3Dmol?.GLViewer?.prototype && !window.$3Dmol.GLViewer.prototype.__archiNoWheelPatch) {
  window.$3Dmol.GLViewer.prototype.__archiNoWheelPatch = true;
  window.$3Dmol.GLViewer.prototype._handleMouseScroll = function() {};
}

if (proteinToggle && proteinViewer) {
  proteinToggle.addEventListener('click', () => {
    setProteinEnabled(!proteinToggle.classList.contains('active'), true);
  });
}
