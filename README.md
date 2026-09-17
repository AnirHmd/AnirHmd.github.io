# QR Musique

Une page web qui affiche un code QR vers une musique YouTube. La sélection et le code changent automatiquement toutes les 30 secondes. Le minuteur est synchronisé sur l'heure UTC, de sorte que les visiteurs voient la même musique au même moment.

## Utilisation

Ouvrez la page avec un navigateur ou un serveur statique. Scannez le code QR ou utilisez le bouton **Ouvrir sur YouTube**.

## Catalogue

Les musiques sont définies dans le tableau `songs` de `index.html`. Ajoutez des vidéos YouTube avec leur titre, artiste, genre et identifiant pour élargir la sélection. Le site n'utilise pas l'API YouTube ni de clé API. L'image du code QR est générée par l'API publique `api.qrserver.com` ; si elle ne charge pas, le lien YouTube reste disponible.

