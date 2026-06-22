// Zoom out hero background as you scroll down
const heroBg = document.getElementById('heroBg');

function onScroll() {
  const scrollY   = window.scrollY;
  const heroH     = window.innerHeight;
  const progress  = Math.min(scrollY / heroH, 1);   // 0 → 1 over one viewport height

  // Start at scale(1), zoom out to scale(1.12) as you scroll
  // "Zoom out" means the image appears to pull back — we go from 1.12 → 1
  const scale = 1.12 - progress * 0.12;
  heroBg.style.transform = `scale(${scale})`;
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // init
