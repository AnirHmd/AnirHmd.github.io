// Paint dans le menu Démarrer et écran de veille après inactivité.
const uiLanguage = window.portfolioLanguage || 'fr';
const english = uiLanguage === 'en';
const t = (fr, en) => english ? en : fr;

// Une seule entrée Paint, placée dans le menu Démarrer.
const startPrimary = document.querySelector('.start-primary');
const paintMenuButton = document.createElement('button');
paintMenuButton.type = 'button';
paintMenuButton.className = 'start-paint-link';
paintMenuButton.innerHTML = '<span class="start-icon" aria-hidden="true">🎨</span><span><strong>Paint</strong><small>' +
  t('Mini jeu de dessin', 'Mini drawing game') + '</small></span>';
startPrimary?.append(paintMenuButton);

const paintWindow = document.createElement('section');
paintWindow.className = 'paint-window';
paintWindow.hidden = true;
paintWindow.setAttribute('role', 'dialog');
paintWindow.setAttribute('aria-label', 'Paint');
paintWindow.setAttribute('tabindex', '-1');
paintWindow.innerHTML = `
  <div class="paint-titlebar">
    <span aria-hidden="true">🎨</span><strong>Paint — Anir XP</strong>
    <button type="button" class="paint-close" aria-label="${t('Fermer Paint', 'Close Paint')}">×</button>
  </div>
  <div class="paint-toolbar">
    <label>${t('Couleur', 'Color')} <input class="paint-color" type="color" value="#154c9f"></label>
    <label>${t('Taille', 'Size')} <input class="paint-size" type="range" min="2" max="32" value="6"></label>
    <button type="button" class="paint-eraser" aria-pressed="false">◻ ${t('Gomme', 'Eraser')}</button>
    <button type="button" class="paint-undo">↶ ${t('Annuler', 'Undo')}</button>
    <button type="button" class="paint-clear">✕ ${t('Effacer', 'Clear')}</button>
  </div>
  <div class="paint-canvas-wrap">
    <canvas class="paint-canvas" width="800" height="480" aria-label="${t('Zone de dessin', 'Drawing area')}"></canvas>
  </div>
  <div class="paint-footer">
    <span class="paint-status" role="status">${t('Dessine avec ta souris ou ton doigt.', 'Draw with your mouse or finger.')}</span>
    <div class="paint-actions">
      <button type="button" class="paint-download">💾 ${t('Enregistrer PNG', 'Save PNG')}</button>
      <button type="button" class="paint-email">✉ ${t('Envoyer par courriel', 'Send by email')}</button>
    </div>
  </div>`;
document.body.append(paintWindow);

const canvas = paintWindow.querySelector('canvas');
const ctx = canvas.getContext('2d');
const colorInput = paintWindow.querySelector('.paint-color');
const sizeInput = paintWindow.querySelector('.paint-size');
const eraserButton = paintWindow.querySelector('.paint-eraser');
const paintStatus = paintWindow.querySelector('.paint-status');
const undoStack = [];
let drawing = false;
let erasing = false;

// Un fond blanc donne un PNG lisible dans toutes les applications de courriel.
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

function setPaintStatus(fr, en) {
  paintStatus.textContent = t(fr, en);
}

function openPaint() {
  document.getElementById('start-menu').hidden = true;
  document.querySelector('.start-button')?.setAttribute('aria-expanded', 'false');
  paintWindow.hidden = false;
  paintWindow.focus();
}

function closePaint() {
  paintWindow.hidden = true;
  document.querySelector('.start-button')?.focus();
}

paintMenuButton.addEventListener('click', openPaint);
paintWindow.querySelector('.paint-close').addEventListener('click', closePaint);
paintWindow.addEventListener('keydown', event => {
  if (event.key === 'Escape') closePaint();
});

// Chaque trait sauvegarde son état précédent pour permettre Annuler.
function rememberCanvas() {
  if (undoStack.length === 12) undoStack.shift();
  undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width / rect.width,
    y: (event.clientY - rect.top) * canvas.height / rect.height,
  };
}

canvas.addEventListener('pointerdown', event => {
  if (event.button !== 0 && event.pointerType === 'mouse') return;
  rememberCanvas();
  drawing = true;
  canvas.setPointerCapture(event.pointerId);
  const point = canvasPoint(event);
  ctx.strokeStyle = erasing ? '#ffffff' : colorInput.value;
  ctx.lineWidth = Number(sizeInput.value);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(point.x, point.y);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();
});

canvas.addEventListener('pointermove', event => {
  if (!drawing) return;
  const point = canvasPoint(event);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();
});

for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  canvas.addEventListener(eventName, () => {
    if (drawing) ctx.closePath();
    drawing = false;
  });
}

eraserButton.addEventListener('click', () => {
  erasing = !erasing;
  eraserButton.setAttribute('aria-pressed', String(erasing));
});
colorInput.addEventListener('input', () => {
  erasing = false;
  eraserButton.setAttribute('aria-pressed', 'false');
});

paintWindow.querySelector('.paint-undo').addEventListener('click', () => {
  const previous = undoStack.pop();
  if (previous) ctx.putImageData(previous, 0, 0);
});
paintWindow.querySelector('.paint-clear').addEventListener('click', () => {
  rememberCanvas();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

function drawingFile() {
  const base64 = canvas.toDataURL('image/png').split(',')[1];
  const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
  return new File([bytes], 'dessin-anir-xp.png', { type: 'image/png' });
}

function downloadDrawing(file) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

paintWindow.querySelector('.paint-download').addEventListener('click', () => {
  downloadDrawing(drawingFile());
  setPaintStatus('Image PNG enregistrée.', 'PNG image saved.');
});

paintWindow.querySelector('.paint-email').addEventListener('click', async () => {
  const file = drawingFile();
  const subject = t('Mon dessin Paint', 'My Paint drawing');
  const message = t(
    "Salut Anir, voici mon dessin réalisé sur ton portfolio !",
    "Hi Anir, here is the drawing I made on your portfolio!"
  );

  // Sur les appareils compatibles, le partage natif peut transmettre le PNG
  // directement à l'application de courriel choisie par le visiteur.
  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    try {
      await navigator.share({ files: [file], title: subject, text: message });
      setPaintStatus('Dessin partagé.', 'Drawing shared.');
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }

  // mailto: ne sait pas joindre un fichier : enregistrer le PNG et ouvrir un
  // brouillon prérempli, puis demander au visiteur de joindre le fichier.
  downloadDrawing(file);
  setPaintStatus('PNG téléchargé : joins-le au courriel ouvert.', 'PNG downloaded: attach it to the email draft.');
  const body = t(
    message + "\n\nJ'ai téléchargé le fichier dessin-anir-xp.png et je le joins à ce message.",
    message + "\n\nI downloaded dessin-anir-xp.png and will attach it to this message."
  );
  window.location.href = 'mailto:anirhamdaouii@gmail.com?subject=' +
    encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
});

// Écran de veille Windows XP après exactement deux minutes sans interaction.
const screenSaver = document.createElement('div');
screenSaver.className = 'screen-saver';
screenSaver.hidden = true;
screenSaver.setAttribute('role', 'dialog');
screenSaver.setAttribute('aria-label', t('Écran de veille', 'Screen saver'));
screenSaver.innerHTML = `
  <div class="screen-saver-mark">
    <img src="windows-xp-logo.png" alt="" width="100" height="100">
    <strong>Anir XP</strong>
    <span>${t('Portfolio personnel', 'Personal portfolio')}</span>
  </div>
  <p>${t('Bougez la souris ou appuyez sur une touche pour continuer.', 'Move the mouse or press a key to continue.')}</p>`;
document.body.append(screenSaver);

let idleTimer;
let lastPointerActivity = 0;
const idleDuration = 120_000;

function scheduleScreenSaver() {
  window.clearTimeout(idleTimer);
  if (document.hidden || !screenSaver.hidden || document.body.classList.contains('is-updating')) return;
  idleTimer = window.setTimeout(() => {
    if (!document.hidden && !document.body.classList.contains('is-updating')) {
      screenSaver.hidden = false;
      document.body.classList.add('screen-saver-active');
    }
  }, idleDuration);
}

function resumeFromScreenSaver() {
  if (!screenSaver.hidden) {
    screenSaver.hidden = true;
    document.body.classList.remove('screen-saver-active');
  }
  scheduleScreenSaver();
}

for (const eventName of ['keydown', 'pointerdown', 'wheel', 'touchstart']) {
  window.addEventListener(eventName, resumeFromScreenSaver, { passive: true });
}
window.addEventListener('pointermove', () => {
  const now = Date.now();
  if (!screenSaver.hidden || now - lastPointerActivity > 900) {
    lastPointerActivity = now;
    resumeFromScreenSaver();
  }
}, { passive: true });
document.addEventListener('visibilitychange', scheduleScreenSaver);
scheduleScreenSaver();
