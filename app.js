// Éléments communs aux trois pages du portfolio.
const clock = document.getElementById('clock');
const startButton = document.querySelector('.start-button');
const startMenu = document.getElementById('start-menu');
const updateScreen = document.getElementById('xp-update-screen');
const themeButtons = document.querySelectorAll('[data-theme-toggle]');

// Conserve le thème choisi lors de la navigation entre les pages.
function readNightPreference() {
  try {
    return localStorage.getItem('portfolio-theme') === 'night';
  } catch {
    return false;
  }
}

function applyTheme(useNightMode, persist = false) {
  document.body.classList.toggle('night-mode', useNightMode);
  document.documentElement.style.colorScheme = useNightMode ? 'dark' : 'light';

  themeButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(useNightMode));
    button.querySelector('.night-icon').textContent = useNightMode ? '☀' : '☾';
    button.querySelector('.theme-label').textContent = useNightMode ? 'Mode jour' : 'Mode nuit';
  });

  if (persist) {
    try {
      localStorage.setItem('portfolio-theme', useNightMode ? 'night' : 'day');
    } catch {
      // Le thème fonctionne même si le stockage local est désactivé.
    }
  }
}

applyTheme(readNightPreference());

themeButtons.forEach(button => {
  button.addEventListener('click', () => {
    applyTheme(!document.body.classList.contains('night-mode'), true);
  });
});

// Affiche l'heure locale en direct dans la zone de notification.
function updateClock() {
  if (!clock) return;
  const now = new Date();
  clock.textContent = new Intl.DateTimeFormat('fr-CA', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(now);
  clock.title = new Intl.DateTimeFormat('fr-CA', {
    dateStyle: 'full', timeStyle: 'long',
  }).format(now);
}

updateClock();
setInterval(updateClock, 1_000);

// Ouvre et ferme le menu Démarrer.
function closeStartMenu() {
  if (!startMenu || !startButton) return;
  startMenu.hidden = true;
  startButton.setAttribute('aria-expanded', 'false');
}

startButton?.addEventListener('click', () => {
  const shouldOpen = startMenu.hidden;
  startMenu.hidden = !shouldOpen;
  startButton.setAttribute('aria-expanded', String(shouldOpen));
});

document.addEventListener('click', event => {
  if (startMenu && startButton && !startMenu.hidden &&
      !startMenu.contains(event.target) && !startButton.contains(event.target)) {
    closeStartMenu();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && startMenu && !startMenu.hidden) {
    closeStartMenu();
    startButton?.focus();
  }
});

// Agrandit une expérience ou un projet et replie les autres cartes.
document.querySelectorAll('[data-expand-card]').forEach(button => {
  button.addEventListener('click', () => {
    const card = button.closest('.expandable-card');
    if (!card) return;
    const willOpen = !card.classList.contains('is-open');
    card.parentElement?.querySelectorAll('.expandable-card.is-open').forEach(openCard => {
      openCard.classList.remove('is-open');
      openCard.querySelector('[data-expand-card]')?.setAttribute('aria-expanded', 'false');
    });
    card.classList.toggle('is-open', willOpen);
    button.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) {
      window.setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 180);
    }
  });
});

// Un navigateur ne permet de fermer que les onglets ouverts par script.
// Si la fermeture est refusée, le bouton redirige vers Google.
document.querySelectorAll('.close-button').forEach(button => {
  button.addEventListener('click', () => {
    window.close();
    window.setTimeout(() => window.location.replace('https://www.google.com/'), 180);
  });
});

// Simule l'écran d'installation Windows XP sans fin.
document.querySelectorAll('[data-shutdown]').forEach(button => {
  button.addEventListener('click', () => {
    closeStartMenu();
    if (!updateScreen) return;
    updateScreen.hidden = false;
    document.body.classList.add('is-updating');
  });
});

