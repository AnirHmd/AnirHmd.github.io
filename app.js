// Éléments communs aux trois pages du portfolio.
function getLanguage() {
  const queryLanguage = new URLSearchParams(window.location.search).get('lang');
  if (queryLanguage === 'en' || queryLanguage === 'fr') return queryLanguage;
  try {
    return localStorage.getItem('portfolio-language') === 'en' ? 'en' : 'fr';
  } catch {
    return 'fr';
  }
}

const language = getLanguage();
window.portfolioLanguage = language;
const translations = window.portfolioTranslations || {};

// Traduit les nœuds texte sans toucher à la structure HTML des fiches.
if (language === 'en') {
  document.documentElement.lang = 'en';
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const source = node.textContent.trim();
    if (translations[source]) {
      node.textContent = node.textContent.replace(source, translations[source]);
    }
  }

  document.title = translations[document.title.trim()] || document.title;
  document.querySelector('meta[name="description"]')?.setAttribute(
    'content',
    'Portfolio of Anir Hamdaoui — computer science, software engineering, and IT analysis.'
  );
  const accessibleLabels = {
    'Navigation principale': 'Main navigation',
    'Commandes de la fenêtre': 'Window controls',
    'Fermer le site': 'Close website',
    'Heure actuelle': 'Current time',
    'Pages du portfolio': 'Portfolio pages',
    'Liens personnels': 'Personal links',
    'Installation en cours': 'Installation in progress',
    "Portrait d'Anir Hamdaoui": 'Portrait of Anir Hamdaoui',
  };
  document.querySelectorAll('[aria-label],[alt]').forEach(element => {
    for (const attribute of ['aria-label', 'alt']) {
      const value = element.getAttribute(attribute);
      if (accessibleLabels[value]) element.setAttribute(attribute, accessibleLabels[value]);
    }
  });
}

const languageButton = document.querySelector('[data-language-toggle]');
if (languageButton) {
  languageButton.querySelector('.language-label').textContent = language === 'en' ? 'Français' : 'English';
  languageButton.setAttribute('aria-label', language === 'en' ? 'Passer en français' : 'Switch to English');
  languageButton.addEventListener('click', () => {
    const nextLanguage = language === 'en' ? 'fr' : 'en';
    try {
      localStorage.setItem('portfolio-language', nextLanguage);
      const url = new URL(window.location.href);
      url.searchParams.delete('lang');
      window.location.assign(url);
    } catch {
      // Le paramètre d'URL permet de changer la langue sans stockage local.
      const url = new URL(window.location.href);
      url.searchParams.set('lang', nextLanguage);
      window.location.assign(url);
    }
  });
}

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
    button.querySelector('.theme-label').textContent =
      language === 'en'
        ? (useNightMode ? 'Day mode' : 'Night mode')
        : (useNightMode ? 'Mode jour' : 'Mode nuit');
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
  const locale = language === 'en' ? 'en-CA' : 'fr-CA';
  clock.textContent = new Intl.DateTimeFormat(locale, {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(now);
  clock.title = new Intl.DateTimeFormat(locale, {
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

