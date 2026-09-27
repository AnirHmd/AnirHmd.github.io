// Écran de démarrage à la première entrée sur l'accueil dans cet onglet.
(() => {
  const storageKey = 'portfolio-boot-seen';
  let alreadySeen = false;
  try {
    alreadySeen = sessionStorage.getItem(storageKey) === '1';
  } catch {
    // La visite fonctionne aussi lorsque le stockage du navigateur est bloqué.
  }

  // Un retour depuis Expérience ou Projets reste une navigation du portfolio,
  // même si le navigateur refuse l'accès à sessionStorage.
  let fromPortfolio = false;
  try {
    const previous = new URL(document.referrer);
    fromPortfolio = previous.origin === window.location.origin;
  } catch {
    // Aucun référent : ouverture directe du site.
  }
  if (alreadySeen || fromPortfolio) return;

  document.documentElement.classList.add('boot-pending');

  document.addEventListener('DOMContentLoaded', () => {
    const english = window.portfolioLanguage === 'en';
    const boot = document.createElement('div');
    boot.className = 'boot-screen';
    boot.setAttribute('role', 'dialog');
    boot.setAttribute('aria-modal', 'true');
    boot.setAttribute('aria-label', english ? 'Windows XP style startup' : 'Démarrage style Windows XP');
    boot.innerHTML = `
      <div class="boot-top-line" aria-hidden="true"></div>
      <div class="boot-content">
        <div class="boot-brand">
          <img src="windows-xp-logo.png" alt="" width="82" height="82">
          <div><span>Anir</span><strong>Windows <em>xp</em></strong></div>
        </div>
        <div class="boot-progress" aria-hidden="true"><span></span><span></span><span></span></div>
        <p class="boot-message">${english ? 'Starting...' : 'Démarrage en cours...'}</p>
      </div>
      <div class="boot-bottom-line" aria-hidden="true"></div>`;
    document.body.prepend(boot);
    const sound = new Audio('windows-xp-startup.wav');
    sound.preload = 'auto';
    sound.volume = 0.8;

    function start() {
      boot.classList.add('boot-running');
      // Le son original est tenté automatiquement ; le navigateur peut le bloquer.
      try { void sound.play().catch(() => {}); } catch { /* Démarrage silencieux. */ }
      try { sessionStorage.setItem(storageKey, '1'); } catch { /* Stockage facultatif. */ }
      window.setTimeout(() => {
        sound.pause();
        document.documentElement.classList.remove('boot-pending');
        boot.remove();
      }, 6000);
    }

    start();
  }, { once: true });
})();
