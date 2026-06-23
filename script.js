// Zoom out hero background as you scroll down
const heroBg = document.getElementById('heroBg');

function onScroll() {
  const scrollY = window.scrollY;
  const heroH = window.innerHeight;
  const progress = Math.min(scrollY / heroH, 1);
  const scale = 1.12 - progress * 0.12;
  heroBg.style.transform = `scale(${scale})`;
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Toggle protein background
const proteinToggle = document.getElementById('proteinToggle');
const aboutSection = document.querySelector('.about');
let viewerInitialized = false;

proteinToggle.addEventListener('click', () => {
  proteinToggle.classList.toggle('active');
  aboutSection.classList.toggle('protein-active');

  if (!viewerInitialized) {
    viewerInitialized = true;

    const viewer = $3Dmol.createViewer('proteinViewer', {
      backgroundColor: 'transparent',
    });

    fetch('protein.pdb')
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

        // Disable zoom by overriding 3Dmol's internal zoom handler
        const canvas = document.querySelector('#proteinViewer canvas');
        if (canvas) {
          canvas.addEventListener('wheel', e => {
            e.preventDefault();
            e.stopImmediatePropagation();
            window.scrollBy(0, e.deltaY);
          }, { passive: false, capture: true });
        }

        // Allow page scroll when not dragging
        const viewer_div = document.getElementById('proteinViewer');
        viewer_div.style.pointerEvents = 'none';
        canvas.style.pointerEvents = 'auto';
      });
  }
});