// Écran de démarrage affiché une fois par onglet, avant le portfolio.
(() => {
  const storageKey = 'portfolio-boot-seen';
  let alreadySeen = false;
  try {
    alreadySeen = sessionStorage.getItem(storageKey) === '1';
  } catch {
    // La visite fonctionne aussi lorsque le stockage du navigateur est bloqué.
  }
  if (alreadySeen) return;

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
    // Carillon original inspiré des anciens ordinateurs, créé sans fichier audio externe.
    function playStartupChime() {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      try {
        const audio = new AudioContextClass();
        // Le navigateur peut refuser l'audio sans geste préalable : aucun son différé.
        audio.resume().catch(() => {
          if (audio.state !== 'closed') void audio.close().catch(() => {});
        });
        const notes = [
          [392, 0, 0.72], [523.25, 0.14, 0.9], [659.25, 0.32, 1.12],
          [783.99, 0.61, 1.25], [1046.5, 0.86, 1.36], [659.25, 1.07, 1.12]
        ];
        notes.forEach(([frequency, delay, duration]) => {
          const oscillator = audio.createOscillator();
          const gain = audio.createGain();
          oscillator.type = 'sine';
          oscillator.frequency.value = frequency;
          oscillator.connect(gain);
          gain.connect(audio.destination);
          const start = audio.currentTime + delay;
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(0.055, start + 0.07);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
          oscillator.start(start);
          oscillator.stop(start + duration + 0.02);
        });
        window.setTimeout(() => {
          if (audio.state !== 'closed') void audio.close().catch(() => {});
        }, 3500);
      } catch {
        // Si Web Audio est indisponible, l'animation continue en silence.
      }
    }

    function start() {
      playStartupChime();
      boot.classList.add('boot-running');
      try { sessionStorage.setItem(storageKey, '1'); } catch { /* Stockage facultatif. */ }
      window.setTimeout(() => {
        document.documentElement.classList.remove('boot-pending');
        boot.remove();
      }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 500 : 2800);
    }

    start();
  }, { once: true });
})();
