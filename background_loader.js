// background_loader.js
// Preload SVG background and expose for game.js
const bgImg = new Image();
bgImg.src = 'word_shooter_background.svg';
window.wordShooterBackground = bgImg;
