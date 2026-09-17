// Ces éléments existent sur les trois pages du portfolio.
const clock = document.getElementById('clock');
const startButton = document.querySelector('.start-button');
const startMenu = document.getElementById('start-menu');

// Affiche l'heure locale dans la zone de notification de la barre des tâches.
function updateClock() {
  clock.textContent = new Intl.DateTimeFormat('fr-CA', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

updateClock();
setInterval(updateClock, 30_000);

function closeStartMenu() {
  startMenu.hidden = true;
  startButton.setAttribute('aria-expanded', 'false');
}

// Le bouton Démarrer sert aussi de navigation secondaire sur petit écran.
startButton.addEventListener('click', () => {
  const shouldOpen = startMenu.hidden;
  startMenu.hidden = !shouldOpen;
  startButton.setAttribute('aria-expanded', String(shouldOpen));
});

// Ferme le menu si l'utilisateur clique ailleurs ou appuie sur Échap.
document.addEventListener('click', event => {
  if (
    !startMenu.hidden &&
    !startMenu.contains(event.target) &&
    !startButton.contains(event.target)
  ) {
    closeStartMenu();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !startMenu.hidden) {
    closeStartMenu();
    startButton.focus();
  }
});

