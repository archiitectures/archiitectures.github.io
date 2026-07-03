// Zoom out hero background as you scroll down
const heroBg = document.getElementById('heroBg');

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

if (heroBg) {
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Toggle protein background
const proteinToggle = document.getElementById('proteinToggle');
const aboutSection = document.querySelector('.about');
const proteinViewer = document.getElementById('proteinViewer');
const proteinHost = aboutSection || document.body;
let viewerInitialized = false;

if (window.$3Dmol?.GLViewer?.prototype && !window.$3Dmol.GLViewer.prototype.__archiNoWheelPatch) {
  window.$3Dmol.GLViewer.prototype.__archiNoWheelPatch = true;
  window.$3Dmol.GLViewer.prototype._handleMouseScroll = function() {};
}

if (proteinToggle && proteinViewer) {
  proteinToggle.addEventListener('click', () => {
    proteinToggle.classList.toggle('active');
    if (proteinHost) {
      proteinHost.classList.toggle('protein-active');
    }

    if (!viewerInitialized) {
      viewerInitialized = true;

      const viewer = $3Dmol.createViewer('proteinViewer', {
        backgroundColor: 'transparent',
      });

      fetch('/protein.pdb')
        .then(r => r.text())
        .then(data => {
          viewer.addModel(data, 'pdb');
          viewer.setStyle({}, {
            cartoon: {
              color: '#232323',
              thickness: 0.4,
              opacity: 0.85,
            }
          });
          viewer.setBackgroundColor(0x1c1c1c, 0);
          viewer.zoom(0.85);
          viewer.render();
          viewer.spin('y', 0.5);

          // Allow page scroll when not dragging
          proteinViewer.style.pointerEvents = 'auto';
          const canvas = document.querySelector('#proteinViewer canvas');
          if (canvas) {
            canvas.style.pointerEvents = 'auto';
          }
        });
    }
  });
}
