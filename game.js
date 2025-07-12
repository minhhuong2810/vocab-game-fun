const BALLOON_SIZE = 48;

// --- AUDIO CONTEXT MANAGER FOR AUTOPLAY POLICY ---
class AudioContextManager {
  constructor() {
    this.audioContext = null;
    this.isAudioEnabled = false;
    this.pendingActions = [];
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Check if audio context is suspended (autoplay policy)
      if (this.audioContext.state === 'suspended') {
        this.showAudioEnableOverlay();
      } else {
        this.isAudioEnabled = true;
        this.processPendingActions();
      }
      
      this.initialized = true;
    } catch (error) {
      console.log('AudioContext initialization failed:', error);
    }
  }

  async enableAudio() {
    if (!this.audioContext) return false;
    
    try {
      await this.audioContext.resume();
      this.isAudioEnabled = true;
      this.hideAudioEnableOverlay();
      this.processPendingActions();
      updateAudioIcon(); // Update audio icon
      return true;
    } catch (error) {
      console.log('Audio enable failed:', error);
      return false;
    }
  }

  showAudioEnableOverlay() {
    // Create overlay if it doesn't exist
    if (!document.getElementById('audioEnableOverlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'audioEnableOverlay';
      overlay.innerHTML = `
        <div class="audio-enable-overlay">
          <div class="audio-enable-popup">
            <div class="audio-enable-content">
              <h3>🔊 Bật âm thanh</h3>
              <p>Để có trải nghiệm tốt nhất, hãy bật âm thanh cho game!</p>
              <button id="enableAudioBtn" class="enable-audio-btn">Bật âm thanh</button>
              <button id="playWithoutAudioBtn" class="play-without-audio-btn">Chơi không âm thanh</button>
            </div>
          </div>
        </div>
      `;
      
      // Add CSS styles
      const style = document.createElement('style');
      style.textContent = `
        .audio-enable-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
        }
        
        .audio-enable-popup {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          max-width: 400px;
          margin: 20px;
        }
        
        .audio-enable-content h3 {
          color: white;
          margin-bottom: 15px;
          font-size: 24px;
        }
        
        .audio-enable-content p {
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 25px;
          font-size: 16px;
        }
        
        .enable-audio-btn, .play-without-audio-btn {
          display: block;
          width: 100%;
          padding: 12px 20px;
          margin: 10px 0;
          border: none;
          border-radius: 25px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .enable-audio-btn {
          background: #4CAF50;
          color: white;
        }
        
        .enable-audio-btn:hover {
          background: #45a049;
          transform: translateY(-2px);
        }
        
        .play-without-audio-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }
        
        .play-without-audio-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `;
      
      document.head.appendChild(style);
      document.body.appendChild(overlay);
      
      // Add event listeners
      document.getElementById('enableAudioBtn').addEventListener('click', () => {
        this.enableAudio();
      });
      
      document.getElementById('playWithoutAudioBtn').addEventListener('click', () => {
        this.hideAudioEnableOverlay();
        // Audio will remain disabled
        // Show a small notification about the audio button
        setTimeout(() => {
          console.log('💡 Tip: You can enable audio anytime using the sound button (🔊) in the control panel');
        }, 1000);
      });
    }
    
    document.getElementById('audioEnableOverlay').style.display = 'flex';
  }

  hideAudioEnableOverlay() {
    const overlay = document.getElementById('audioEnableOverlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
    // Update audio icon when overlay is hidden
    updateAudioIcon();
  }

  addPendingAction(action) {
    this.pendingActions.push(action);
  }

  processPendingActions() {
    while (this.pendingActions.length > 0) {
      const action = this.pendingActions.shift();
      action();
    }
  }
}

// Initialize audio context manager
const audioContextManager = new AudioContextManager();

// --- GAME MANAGEMENT SYSTEM ---
const GAME_TYPES = {
  WORD_SHOOTER: 'word_shooter',
  WORD_HUNTER: 'word_hunter', 
  WORD_HEARO: 'word_hearo'
};

const GAME_NAMES = {
  [GAME_TYPES.WORD_SHOOTER]: 'Word Shooter',
  [GAME_TYPES.WORD_HUNTER]: 'Word Hunter',
  [GAME_TYPES.WORD_HEARO]: 'Word Hearo'
};

// --- AUDIO MANAGER ---
class AudioManager {
  constructor() {
    this.sounds = {};
    this.backgroundMusic = null;
    this.isMuted = false;
    this.volume = 0.7;
    this.backgroundMusicVolume = 0.3;
    this.isReady = false;
  }

  // Initialize audio manager with user interaction
  async initialize() {
    if (this.isReady) return;
    
    try {
      // Wait for audio context to be ready
      await audioContextManager.initialize();
      this.isReady = true;
    } catch (error) {
      console.log('Audio manager initialization failed:', error);
    }
  }

  // Load a sound file
  loadSound(name, src) {
    const audio = new Audio();
    audio.src = src;
    audio.preload = 'auto';
    audio.volume = this.volume;
    
    // Handle loading errors
    audio.addEventListener('error', (e) => {
      console.log(`Failed to load sound ${name} from ${src}:`, e.target.error);
      // Don't add to sounds object if failed to load
      return;
    });
    
    // Handle successful loading
    audio.addEventListener('canplaythrough', () => {
      console.log(`Successfully loaded sound: ${name}`);
    });
    
    this.sounds[name] = audio;
    return audio;
  }

  // Load background music
  loadBackgroundMusic(src) {
    this.backgroundMusic = new Audio();
    this.backgroundMusic.src = src;
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = this.backgroundMusicVolume;
    this.backgroundMusic.preload = 'auto';
    
    // Handle loading errors
    this.backgroundMusic.addEventListener('error', (e) => {
      console.log('Failed to load background music:', e);
    });
    
    return this.backgroundMusic;
  }

  // Play a sound effect
  playSound(name) {
    if (this.isMuted) return;
    
    // Check if sound exists
    if (!this.sounds[name]) {
      console.log(`Sound '${name}' not available (file may not exist)`);
      return;
    }
    
    // If audio is not enabled, add to pending actions
    if (!audioContextManager.isAudioEnabled) {
      audioContextManager.addPendingAction(() => this.playSound(name));
      return;
    }
    
    try {
      // Clone the audio to allow overlapping sounds
      const audio = this.sounds[name].cloneNode();
      audio.volume = this.volume;
      
      // Play with user interaction handling
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log(`Audio playback failed for '${name}':`, err);
          // Try to show audio enable overlay if not already shown
          if (!audioContextManager.isAudioEnabled) {
            audioContextManager.showAudioEnableOverlay();
          }
        });
      }
    } catch (error) {
      console.log(`Audio setup failed for '${name}':`, error);
    }
  }

  // Play background music
  playBackgroundMusic() {
    if (this.isMuted || !this.backgroundMusic) return;
    
    // If audio is not enabled, add to pending actions
    if (!audioContextManager.isAudioEnabled) {
      audioContextManager.addPendingAction(() => this.playBackgroundMusic());
      return;
    }
    
    try {
      this.backgroundMusic.currentTime = 0;
      const playPromise = this.backgroundMusic.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log('Background music playback failed:', err);
          // Try to show audio enable overlay if not already shown
          if (!audioContextManager.isAudioEnabled) {
            audioContextManager.showAudioEnableOverlay();
          }
        });
      }
    } catch (error) {
      console.log('Background music setup failed:', error);
    }
  }

  // Stop background music
  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
  }

  // Set volume for all sounds
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    Object.values(this.sounds).forEach(audio => {
      audio.volume = this.volume;
    });
  }

  // Set background music volume
  setBackgroundMusicVolume(volume) {
    this.backgroundMusicVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.backgroundMusicVolume;
    }
  }

  // Toggle mute
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBackgroundMusic();
    }
    return this.isMuted;
  }

  // Create synthetic sounds using Web Audio API (fallback for missing files)
  createSyntheticSound(name, type = 'beep') {
    if (!window.AudioContext && !window.webkitAudioContext) {
      console.log('Web Audio API not supported');
      return;
    }

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const createBeep = (frequency = 800, duration = 0.1, volume = 0.3) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    // Create synthetic sound based on type
    const syntheticAudio = {
      play: () => {
        if (this.isMuted) return;
        
        switch (type) {
          case 'laser':
            createBeep(1000, 0.1, 0.2);
            break;
          case 'explosion':
            createBeep(200, 0.3, 0.4);
            setTimeout(() => createBeep(150, 0.2, 0.3), 100);
            break;
          case 'correct':
            createBeep(523, 0.2, 0.3); // C note
            setTimeout(() => createBeep(659, 0.2, 0.3), 200); // E note
            break;
          case 'wrong':
            createBeep(200, 0.5, 0.3);
            break;
          default:
            createBeep(440, 0.2, 0.3);
        }
      },
      cloneNode: function() { return this; }
    };

    this.sounds[name] = syntheticAudio;
    console.log(`Created synthetic sound: ${name} (${type})`);
  }

  // Initialize fallback sounds if files are not available
  initializeFallbackSounds() {
    // Check if essential sounds are loaded, if not create synthetic ones
    setTimeout(() => {
      if (!this.sounds['explosion']) {
        this.createSyntheticSound('explosion', 'explosion');
      }
      if (!this.sounds['laser']) {
        this.createSyntheticSound('laser', 'laser');
      }
      if (!this.sounds['wordHunterCorrect']) {
        this.createSyntheticSound('wordHunterCorrect', 'correct');
      }
      if (!this.sounds['wordHunterWrong']) {
        this.createSyntheticSound('wordHunterWrong', 'wrong');
      }
    }, 2000); // Wait 2 seconds for file loading attempts
  }
}

// Initialize audio manager
const audioManager = new AudioManager();

// Load sound files - Using fallback approach
// Try to load local files first, with fallbacks for missing files
try {
  audioManager.loadSound('explosion', 'sound/explosion.wav');
  audioManager.loadSound('wordHunterCorrect', 'sound/word_hunter_correct.mp3');
  audioManager.loadSound('wordHunterWrong', 'sound/word_hunter_wrong.mp3');
  audioManager.loadSound('wordHunterMusic', 'sound/word_hunter_music.mp3');
  audioManager.loadSound('wordShooterMusic', 'sound/word_shooter_music.wav');
  
  // Initialize fallback sounds for missing files
  audioManager.initializeFallbackSounds();
} catch (error) {
  console.log('Audio files not found, using synthetic sounds only');
  audioManager.createSyntheticSound('explosion', 'explosion');
  audioManager.createSyntheticSound('laser', 'laser');
  audioManager.createSyntheticSound('wordHunterCorrect', 'correct');
  audioManager.createSyntheticSound('wordHunterWrong', 'wrong');
}

// Background music management
function updateBackgroundMusic() {
  const newMusic = currentGameType === GAME_TYPES.WORD_SHOOTER ? 'sound/word_shooter_music.wav' : 
                   currentGameType === GAME_TYPES.WORD_HUNTER ? 'sound/word_hunter_music.mp3' : 
                   null; // Word Hearo has no background music to avoid interference with pronunciation
  
  if (newMusic !== currentBackgroundMusic) {
    // Stop current background music
    audioManager.stopBackgroundMusic();
    
    // Load new background music
    if (newMusic) {
      audioManager.loadBackgroundMusic(newMusic);
      currentBackgroundMusic = newMusic;
      
      // Play if game is running
      if (isGameRunning) {
        audioManager.playBackgroundMusic();
      }
    } else {
      // No background music for current game type
      currentBackgroundMusic = null;
    }
  }
}
let currentBackgroundMusic = null;

// Current game state
let currentGameType = GAME_TYPES.WORD_SHOOTER;
let gameManager = null;
let wordHunterManager = null;
let wordHearoManager = null;

// Initialize managers immediately when available
function tryInitializeManagers() {
  console.log('Attempting to initialize managers...');
  if (typeof WordHunterManager !== 'undefined' && !wordHunterManager) {
    wordHunterManager = new WordHunterManager();
    console.log('WordHunterManager initialized');
  } else if (typeof WordHunterManager === 'undefined') {
    console.log('WordHunterManager not available yet');
  }
  
  if (typeof WordHearoManager !== 'undefined' && !wordHearoManager) {
    wordHearoManager = new WordHearoManager();
    console.log('WordHearoManager initialized');
  } else if (typeof WordHearoManager === 'undefined') {
    console.log('WordHearoManager not available yet');
  }
}

// Try to initialize managers immediately
tryInitializeManagers();

// --- AUTO RUN ANIMATION ON PAGE LOAD (SHOW BALLOONS & SPACESHIP EVEN IF GAME NOT STARTED) ---
// At the end of this file, we will call gameLoop() once to start the animation.

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
function resizeCanvas() {
  canvas.width = window.innerWidth - 436 - 40;
  canvas.height = window.innerHeight;
}
resizeCanvas();
ctx.font = "bold 20px Arial";

let targetWord = "APPLE";
let collected = "";
let playCount = 0;

const SPACESHIP_SIZE = 150;
const spaceship = { x: canvas.width / 2 - SPACESHIP_SIZE/2, y: canvas.height - SPACESHIP_SIZE - 20, width: SPACESHIP_SIZE, height: SPACESHIP_SIZE, speed: 10 };
let keys = {};
let bullets = [];
let balloons = [];

// Danh sách các file SVG balloon để chọn ngẫu nhiên
const BALLOON_SVGS = [
  "balloon.svg",
  "balloon1.svg", 
  "balloon2.svg",
  "balloon3.svg",
  "balloon4.svg",
  "balloon5.svg"
];

// Cache để preload tất cả balloon images để tránh flickering
const balloonImageCache = {};

// Preload tất cả balloon images
function preloadBalloonImages() {
  BALLOON_SVGS.forEach(svgPath => {
    const img = new Image();
    img.src = svgPath;
    balloonImageCache[svgPath] = img;
  });
}

// Gọi preload ngay khi script load
preloadBalloonImages();

// Spell checking functions using LanguageTool API
async function validateEnglishWord(word) {
  if (!word || word.length < 2) return true; // Skip very short words
  
  try {
    const response = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `text=${encodeURIComponent(word)}&language=en-US`
    });
    
    const data = await response.json();
    return data.matches.length === 0; // No matches means correct spelling
  } catch (error) {
    console.log('Spell check service unavailable, allowing word');
    return true; // Allow word if API fails (graceful fallback)
  }
}

async function getSpellingSuggestions(word) {
  try {
    const response = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `text=${encodeURIComponent(word)}&language=en-US`
    });
    
    const data = await response.json();
    if (data.matches.length > 0 && data.matches[0].replacements) {
      return data.matches[0].replacements.slice(0, 3).map(r => r.value);
    }
    return [];
  } catch (error) {
    return []; // Return empty suggestions if API fails
  }
}

// Custom spelling error popup functions
function showSpellingErrorPopup(word, suggestions) {
  const overlay = document.getElementById('spellingErrorOverlay');
  const errorMessage = document.getElementById('errorMessage');
  const suggestionsContainer = document.getElementById('suggestionsContainer');
  const closeBtn = document.getElementById('closePopupBtn');
  
  // Set error message
  errorMessage.textContent = `"${word}" có thể bị sai chính tả.`;
  
  // Clear and populate suggestions
  suggestionsContainer.innerHTML = '';
  if (suggestions.length > 0) {
    suggestions.forEach(suggestion => {
      const suggestionSpan = document.createElement('span');
      suggestionSpan.className = 'suggestion-item';
      suggestionSpan.textContent = suggestion;
      suggestionSpan.onclick = () => {
        // Apply suggestion to word input
        const wordInput = document.getElementById("word-input");
        wordInput.value = suggestion;
        hideSpellingErrorPopup();
      };
      suggestionsContainer.appendChild(suggestionSpan);
    });
  } else {
    errorMessage.textContent = `"${word}" có thể không phải là từ tiếng Anh hợp lệ.`;
    const checkAgainSpan = document.createElement('span');
    checkAgainSpan.className = 'suggestion-item';
    checkAgainSpan.textContent = 'Kiểm tra lại';
    checkAgainSpan.onclick = () => hideSpellingErrorPopup();
    suggestionsContainer.appendChild(checkAgainSpan);
  }
  
  // Show overlay
  overlay.style.display = 'flex';
  
  // Set up close button
  closeBtn.onclick = hideSpellingErrorPopup;
  
  // Close on overlay click (outside popup)
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      hideSpellingErrorPopup();
    }
  };
}

function hideSpellingErrorPopup() {
  const overlay = document.getElementById('spellingErrorOverlay');
  overlay.style.display = 'none';
}

// Update popup positions - ensuring they stay properly positioned
function updatePopupPositions() {
  // This function ensures popups remain properly positioned
  // Currently popups use CSS positioning, so no dynamic updates needed
  // Function exists to prevent ReferenceError and can be extended if needed
}

function randomChar() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ -";
  return chars.charAt(Math.floor(Math.random() * chars.length));
}

function createBalloon() {
  // Bóng luôn cách mép trái/phải canvas ít nhất 20px
  const minX = 20;
  const maxX = canvas.width - BALLOON_SIZE - 20;
  // Chọn ngẫu nhiên 1 file SVG balloon
  const balloonSvgIdx = Math.floor(Math.random() * BALLOON_SVGS.length);
  return {
    letter: randomChar(),
    x: Math.random() * (maxX - minX) + minX,
    y: -BALLOON_SIZE,
    speed: 2 + Math.random() * 2,
    balloonSvg: BALLOON_SVGS[balloonSvgIdx]
  };
}

function drawSpaceship() {
  if (window.spaceshipAsset && window.spaceshipAsset.complete) {
    ctx.drawImage(window.spaceshipAsset, spaceship.x, spaceship.y, SPACESHIP_SIZE, SPACESHIP_SIZE);
  } else {
    ctx.fillStyle = "white";
    ctx.fillRect(spaceship.x, spaceship.y, SPACESHIP_SIZE, SPACESHIP_SIZE);
  }
}

function drawBalloons() {
  balloons.forEach(balloon => {
    // Chỉ vẽ bóng nếu còn nằm trong canvas
    if (balloon.y + BALLOON_SIZE > 0 && balloon.y < canvas.height) {
      // Sử dụng cached image thay vì tạo mới mỗi lần
      const balloonImg = balloonImageCache[balloon.balloonSvg];
      
      if (balloonImg && balloonImg.complete) {
        ctx.drawImage(balloonImg, balloon.x, balloon.y, BALLOON_SIZE, BALLOON_SIZE);
      } else {
        // Fallback: vẽ hình tròn màu mặc định nếu SVG chưa load
        ctx.fillStyle = "#FFB6B6";
        ctx.beginPath();
        ctx.arc(balloon.x + BALLOON_SIZE/2, balloon.y + BALLOON_SIZE/2, BALLOON_SIZE/2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Vẽ chữ cái ở chính giữa bóng
      ctx.save();
      ctx.font = "bold 24px Arial";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(balloon.letter, balloon.x + BALLOON_SIZE/2, balloon.y + BALLOON_SIZE/2);
      ctx.restore();
    }
  });
}

function drawBullets() {
  ctx.fillStyle = "yellow";
  bullets.forEach(bullet => {
    ctx.fillRect(bullet.x, bullet.y, 4, 10);
  });
}

// Function to draw game name indicator
function drawGameName() {
  const gameName = GAME_NAMES[currentGameType];
  ctx.save();
  ctx.font = "bold 24px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  
  // Draw text with stroke for better visibility
  const x = canvas.width / 2;
  const y = 20;
  ctx.strokeText(gameName, x, y);
  ctx.fillText(gameName, x, y);
  ctx.restore();
}

function update(deltaTime = 16.67) { // Default to ~60fps if no deltaTime passed
  if (keys["ArrowLeft"] && spaceship.x > 0) spaceship.x -= spaceship.speed;
  if (keys["ArrowRight"] && spaceship.x < canvas.width - spaceship.width) spaceship.x += spaceship.speed;
  if (keys["ArrowUp"] && spaceship.y > 0) spaceship.y -= spaceship.speed;
  if (keys["ArrowDown"] && spaceship.y < canvas.height - spaceship.height) spaceship.y += spaceship.speed;

  if (Math.random() < 0.05) {
    balloons.push(createBalloon());
  }

  // Delta time standardized balloon movement - reasonable falling speed
  const balloonSpeedMultiplier = deltaTime / 16.67; // Normalize to 60fps baseline
  balloons.forEach(balloon => {
    const standardizedSpeed = balloon.speed * balloonSpeedMultiplier; // Keep original speed scale
    balloon.y += standardizedSpeed;
  });
  
  bullets.forEach(bullet => (bullet.y -= 8));

  bullets = bullets.filter(b => b.y > 0);
  balloons = balloons.filter(b => b.y + BALLOON_SIZE <= canvas.height - 12);
}

function checkCollision() {
  // Only process bullet-balloon collision for Word Shooter game
  if (!isGameRunning || currentGameType !== GAME_TYPES.WORD_SHOOTER) return;
  bullets.forEach((bullet, bIdx) => {
    balloons.forEach((balloon, cIdx) => {
      if (
        bullet.x > balloon.x &&
        bullet.x < balloon.x + BALLOON_SIZE &&
        bullet.y > balloon.y &&
        bullet.y < balloon.y + BALLOON_SIZE
      ) {
        if (balloon.letter === targetWord[collected.length]) {
          collected += balloon.letter;
          // Update collected letters display
          updateCollectedDisplay();
          // Play explosion sound for correct hit
          audioManager.playSound('explosion');
        }
        bullets.splice(bIdx, 1);
        balloons.splice(cIdx, 1);
        if (collected === targetWord) {
          playCount++;
          document.getElementById("play-count").innerText = `${playCount} lượt luyện tập`;
          
          // Automatically show vocab word and meaning when word is completed
          if (!isVocabVisible) {
            toggleVocabVisibility();
          }
          
          showCongratsOverlay();
          resetGame();
          
          // Pause the game after completing the word
          isGameRunning = false;
          gameInitialized = false; // Reset initialization flag when game completes
          const playPauseIcon = document.getElementById("playPauseIcon");
          playPauseIcon.src = "vocab_card_header_icon_play.svg";
          playPauseIcon.alt = "Play";
          // Update input fields state when game is paused after word completion
          updateInputFieldsState();
          // Stop background music
          audioManager.stopBackgroundMusic();
        }
      }
    });
  });
}

// Function to enable/disable input fields based on game state
function updateInputFieldsState() {
  const wordInput = document.getElementById("word-input");
  const meaningInput = document.getElementById("meaning-input");
  
  if (isGameRunning) {
    // Game running: disable inputs and gray them out
    wordInput.disabled = true;
    meaningInput.disabled = true;
    wordInput.style.backgroundColor = "#f0f0f0";
    meaningInput.style.backgroundColor = "#f0f0f0";
  } else {
    // Game paused/stopped: enable inputs and restore normal appearance
    wordInput.disabled = false;
    meaningInput.disabled = false;
    wordInput.style.backgroundColor = "";
    meaningInput.style.backgroundColor = "";
  }
}

// Function to update the collected letters display
function updateCollectedDisplay() {
  const collectedElement = document.getElementById("collected-letters");
  if (collectedElement) {
    if (currentGameType === GAME_TYPES.WORD_SHOOTER) {
      if (collected && collected.length > 0) {
        collectedElement.innerText = collected;
        collectedElement.className = "";
      } else {
        collectedElement.innerText = "Chữ cái đã bắn trúng";
        collectedElement.className = "collected-placeholder";
      }
    } else if (currentGameType === GAME_TYPES.WORD_HUNTER) {
      if (wordHunterManager) {
        const progress = wordHunterManager.getProgress();
        collectedElement.innerText = progress;
        collectedElement.className = progress === "Sẵn sàng bắt đầu" ? "collected-placeholder" : "";
      } else {
        collectedElement.innerText = "Tiến độ Word Hunter";
        collectedElement.className = "collected-placeholder";
      }
    }
  }
}

function resetGame() {
  collected = "";
  updateCollectedDisplay();
  bullets = [];
  balloons = [];
  spaceship.x = canvas.width / 2 - SPACESHIP_SIZE/2;
  spaceship.y = canvas.height - SPACESHIP_SIZE - 20;
}

function drawBackground() {
  if (window.wordShooterBackground && window.wordShooterBackground.complete) {
    ctx.drawImage(window.wordShooterBackground, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = ctx.createLinearGradient(0, 0, 0, canvas.height);
    ctx.fillStyle.addColorStop(0, '#1b005b');
    ctx.fillStyle.addColorStop(1, '#2d006d');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

let isGameRunning = false;
let gameLoopId = null;
let lastFrameTime = 0;
let gameInitialized = false; // Track if game has been initialized for current word
function gameLoop() {
  const currentTime = Date.now();
  const deltaTime = currentTime - lastFrameTime;
  lastFrameTime = currentTime;
  
  drawBackground();
  drawGameName();
  
  // Only draw Word Shooter elements when in Word Shooter game
  if (currentGameType === GAME_TYPES.WORD_SHOOTER) {
    drawSpaceship();
    drawBalloons();
    drawBullets();
    update(deltaTime); // Pass deltaTime to update function
    checkCollision();
  } else if (currentGameType === GAME_TYPES.WORD_HUNTER) {
    // TODO: Draw Word Hunter elements
    drawWordHunter();
  } else if (currentGameType === GAME_TYPES.WORD_HEARO) {
    // TODO: Draw Word Hearo elements
    drawWordHearo(deltaTime);
  }
  
  gameLoopId = requestAnimationFrame(gameLoop);
}

function startGame() {
  resetGame();
  gameLoop();
}

function toggleCard() {
  const card = document.getElementById("vocabCard");
  card.style.display = card.style.display === "none" ? "flex" : "none";
}

function nextWord() {
  // Hide congratulations overlay if it's showing
  hideCongratsOverlay();
  
  // Switch to next game in cycle
  switch(currentGameType) {
    case GAME_TYPES.WORD_SHOOTER:
      currentGameType = GAME_TYPES.WORD_HUNTER;
      break;
    case GAME_TYPES.WORD_HUNTER:
      currentGameType = GAME_TYPES.WORD_HEARO;
      break;
    case GAME_TYPES.WORD_HEARO:
      currentGameType = GAME_TYPES.WORD_SHOOTER;
      break;
  }
  
  // Stop current game if running
  if (isGameRunning) {
    isGameRunning = false;
    const playPauseIcon = document.getElementById("playPauseIcon");
    playPauseIcon.src = "vocab_card_header_icon_play.svg";
    playPauseIcon.alt = "Play";
    updateInputFieldsState();
    
    // Stop background music
    audioManager.stopBackgroundMusic();
  }
  
  // Mark game as not initialized when switching game types
  gameInitialized = false;
  
  // Update background music for new game type
  updateBackgroundMusic();
  
  // Update vocab visibility for Word Hearo
  updateVocabVisibilityForHearo();
  
  // Reset game state for new game (without calling updateCollectedDisplay)
  collected = "";
  bullets = [];
  balloons = [];
  spaceship.x = canvas.width / 2 - SPACESHIP_SIZE/2;
  spaceship.y = canvas.height - SPACESHIP_SIZE - 20;
  
  // Reset Word Hunter if it exists
  if (wordHunterManager) {
    wordHunterManager.reset();
  }
  
  // Reset Word Hearo if it exists
  if (wordHearoManager) {
    wordHearoManager.reset();
  }
  
  // Update collected display after game type has changed
  updateCollectedDisplay();
  
  // Initialize the new game based on type
  initializeCurrentGame();
  
  // Force redraw the canvas to show the new game immediately
  drawBackground();
  drawGameName();
  if (currentGameType === GAME_TYPES.WORD_SHOOTER) {
    drawSpaceship();
    drawBalloons();
    drawBullets();
  } else if (currentGameType === GAME_TYPES.WORD_HUNTER) {
    drawWordHunter();
  } else if (currentGameType === GAME_TYPES.WORD_HEARO) {
    drawWordHearo();
  }
}

// Function to initialize the current game
function initializeCurrentGame() {
  switch(currentGameType) {
    case GAME_TYPES.WORD_SHOOTER:
      initializeWordShooter();
      break;
    case GAME_TYPES.WORD_HUNTER:
      initializeWordHunter();
      break;
    case GAME_TYPES.WORD_HEARO:
      initializeWordHearo();
      break;
  }
}

// Initialize Word Shooter (existing logic)
function initializeWordShooter() {
  // Keep existing Word Shooter initialization
  // This maintains compatibility with current game
}

// Initialize Word Hunter (to be implemented)
function initializeWordHunter() {
  if (!wordHunterManager) {
    wordHunterManager = new WordHunterManager();
  }
  wordHunterManager.reset();
}

// Initialize Word Hearo (implemented)
function initializeWordHearo() {
  if (!wordHearoManager) {
    wordHearoManager = new WordHearoManager();
  }
  wordHearoManager.reset();
}

document.addEventListener("keydown", e => {
  keys[e.key] = true;
  
  // Handle Word Hearo keyboard input
  if (currentGameType === GAME_TYPES.WORD_HEARO && wordHearoManager && isGameRunning) {
    if (wordHearoManager.handleKeyInput(e)) {
      return; // Input was handled by Word Hearo
    }
  }
  
  // Only allow shooting when game is running and in Word Shooter mode
  if (
    isGameRunning &&
    currentGameType === GAME_TYPES.WORD_SHOOTER &&
    e.code === "Space" &&
    document.activeElement.tagName !== "TEXTAREA"
  ) {
    e.preventDefault();
    bullets.push({ x: spaceship.x + spaceship.width / 2 - 2, y: spaceship.y });
    // Play laser sound effect (using synthetic sound if file not available)
    audioManager.playSound('laser');
  }
});
document.addEventListener("keyup", e => (keys[e.key] = false));

// Add mouse click event listener for Word Hunter and Word Hearo
canvas.addEventListener('click', function(event) {
  if (currentGameType === GAME_TYPES.WORD_HUNTER && wordHunterManager && isGameRunning) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const gameCompleted = wordHunterManager.handleClick(x, y);
    
    // Update progress display
    updateCollectedDisplay();
    
    if (gameCompleted) {
      // Game completed successfully
      playCount++;
      document.getElementById("play-count").innerText = `${playCount} lượt luyện tập`;
      
      // Show congratulations overlay
      showCongratsOverlay();
      
      // Reset game and pause
      wordHunterManager.reset();
      isGameRunning = false;
      gameInitialized = false; // Reset initialization flag when game completes
      const playPauseIcon = document.getElementById("playPauseIcon");
      playPauseIcon.src = "vocab_card_header_icon_play.svg";
      playPauseIcon.alt = "Play";
      updateInputFieldsState();
      updateCollectedDisplay();
      // Stop background music
      audioManager.stopBackgroundMusic();
    }
  } else if (currentGameType === GAME_TYPES.WORD_HEARO && wordHearoManager && isGameRunning) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Handle microphone click
    wordHearoManager.handleClick(x, y);
    
    // Update progress display
    updateCollectedDisplay();
  }
});



async function startOrPauseGame() {
  // Hide congratulations overlay if it's showing
  hideCongratsOverlay();
  
  const playPauseIcon = document.getElementById("playPauseIcon");
  const wordInput = document.getElementById("word-input");
  const meaningInput = document.getElementById("meaning-input");
  
  // Auto-trim spaces from input fields
  const trimmedWord = wordInput.value.trim();
  const trimmedMeaning = meaningInput.value.trim();
  wordInput.value = trimmedWord;
  meaningInput.value = trimmedMeaning;
  
  const word = trimmedWord.toUpperCase();
  const meaning = trimmedMeaning;
  let hasError = false;
  
  // Existing empty field validation
  if (!word) {
    wordInput.style.border = '2px solid red';
    hasError = true;
  } else {
    wordInput.style.border = 'none';
  }
  if (!meaning) {
    meaningInput.style.border = '2px solid red';
    hasError = true;
  } else {
    meaningInput.style.border = 'none';
  }
  
  // NEW: Spell checking validation (only if word is not empty)
  if (word && !(await validateEnglishWord(word))) {
    wordInput.style.border = '2px solid orange'; // Orange for spelling errors
    const suggestions = await getSpellingSuggestions(word);
    showSpellingErrorPopup(word, suggestions);
    hasError = true;
  }
  
  if (hasError) {
    isGameRunning = false;
    playPauseIcon.src = "vocab_card_header_icon_play.svg";
    playPauseIcon.alt = "Play";
    return;
  }

  if (!isGameRunning) {
    // Bắt đầu game
    // Only reset collected if it's a new word (different from current targetWord)
    if (targetWord !== word) {
      collected = "";
      playCount = 0;
      document.getElementById("play-count").innerText = "0 lượt luyện tập";
      gameInitialized = false; // Mark as not initialized for new word
    }
    updateCollectedDisplay();
    targetWord = word;
    
    // Only initialize game if it's a new word or hasn't been initialized yet
    if (!gameInitialized) {
      // Initialize game based on current type
      if (currentGameType === GAME_TYPES.WORD_SHOOTER) {
        bullets = [];
        balloons = [];
        spaceship.x = canvas.width / 2 - 25;
        spaceship.y = canvas.height - SPACESHIP_SIZE - 20;
      } else if (currentGameType === GAME_TYPES.WORD_HUNTER) {
        if (wordHunterManager) {
          wordHunterManager.initialize(word);
          wordHunterManager.startGame();
        }
      } else if (currentGameType === GAME_TYPES.WORD_HEARO) {
        if (wordHearoManager) {
          wordHearoManager.startGame(word);
        }
      }
      gameInitialized = true;
    }
    
    isGameRunning = true;
    playPauseIcon.src = "pause.svg";
    playPauseIcon.alt = "Pause";
    
    // Start background music based on current game type
    updateBackgroundMusic();
    if (currentBackgroundMusic) {
      audioManager.playBackgroundMusic();
    }
    // Note: Word Hearo has no background music to avoid interference with pronunciation
    
    if (gameLoopId === null) {
      gameLoop();
    }
    
    // Update vocab visibility for Word Hearo
    updateVocabVisibilityForHearo();
  } else {
    // Pause game
    isGameRunning = false;
    playPauseIcon.src = "vocab_card_header_icon_play.svg";
    playPauseIcon.alt = "Play";
    
    // Stop background music
    audioManager.stopBackgroundMusic();
    if (gameLoopId !== null) {
      cancelAnimationFrame(gameLoopId);
      gameLoopId = null;
    }
    
    // Update vocab visibility for Word Hearo
    updateVocabVisibilityForHearo();
  }
  // Update input fields state based on the new game state
  updateInputFieldsState();
}

// --- AUDIO CONTROL FUNCTIONS ---
async function toggleAudio() {
  const audioIcon = document.getElementById("audioIcon");
  const audioBtn = document.getElementById("audioBtn");
  
  if (!audioContextManager.isAudioEnabled) {
    // Try to enable audio
    const success = await audioContextManager.enableAudio();
    if (success) {
      audioIcon.src = "game_sound_on.svg";
      audioIcon.alt = "Sound On";
      audioBtn.classList.remove("sound-off");
      audioManager.isMuted = false;
      
      // Start background music if game is running and there's music for current game type
      if (isGameRunning && currentBackgroundMusic) {
        audioManager.playBackgroundMusic();
      }
      
      console.log('Audio enabled successfully');
    } else {
      console.log('Failed to enable audio');
    }
  } else {
    // Toggle mute state
    const isMuted = audioManager.toggleMute();
    audioIcon.src = isMuted ? "game_sound_off.svg" : "game_sound_on.svg";
    audioIcon.alt = isMuted ? "Sound Off" : "Sound On";
    
    // Update button styling based on state
    if (isMuted) {
      audioBtn.classList.add("sound-off");
      // Stop background music when muting
      audioManager.stopBackgroundMusic();
    } else {
      audioBtn.classList.remove("sound-off");
      // Start background music when unmuting if game is running
      if (isGameRunning && currentBackgroundMusic) {
        audioManager.playBackgroundMusic();
      }
    }
    
    console.log(isMuted ? 'Audio muted' : 'Audio unmuted');
  }
}

// Update audio icon based on current state
function updateAudioIcon() {
  const audioIcon = document.getElementById("audioIcon");
  const audioBtn = document.getElementById("audioBtn");
  
  if (!audioContextManager.isAudioEnabled) {
    audioIcon.src = "game_sound_off.svg";
    audioIcon.alt = "Sound Off";
    audioBtn.classList.add("sound-off");
  } else if (audioManager.isMuted) {
    audioIcon.src = "game_sound_off.svg";
    audioIcon.alt = "Sound Off";
    audioBtn.classList.add("sound-off");
  } else {
    audioIcon.src = "game_sound_on.svg";
    audioIcon.alt = "Sound On";
    audioBtn.classList.remove("sound-off");
  }
}

// Initialize audio on user interaction
let audioInitialized = false;

async function initializeAudioOnInteraction() {
  if (!audioInitialized) {
    try {
      await audioManager.initialize();
      audioInitialized = true;
      console.log('Audio system initialized successfully');
    } catch (error) {
      console.log('Audio initialization failed:', error);
    }
  }
}

// --- INITIALIZE AUDIO ON USER INTERACTION ---
document.addEventListener('DOMContentLoaded', () => {
  // Initialize audio context manager when page loads
  audioContextManager.initialize();
  
  // Update audio icon on page load
  updateAudioIcon();
  
  // Add click listeners to common interactive elements
  const interactiveElements = [
    'nextBtn', 'eyeBtn', 'microBtn', 'audioBtn', 'playPauseBtn',
    'gameCanvas', 'word-input', 'meaning-input'
  ];
  
  interactiveElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('click', initializeAudioOnInteraction);
      element.addEventListener('keydown', initializeAudioOnInteraction);
    }
  });
  
  // Global listeners for any user interaction
  document.addEventListener('click', initializeAudioOnInteraction, { once: true });
  document.addEventListener('keydown', initializeAudioOnInteraction, { once: true });
  document.addEventListener('touchstart', initializeAudioOnInteraction, { once: true });
});

// Start game loop
gameLoop();

// Prevent spacebar from triggering play/pause button when it's focused
document.getElementById("playPauseBtn").addEventListener("keydown", function(e) {
  if (e.code === "Space") {
    e.preventDefault();
  }
});

// Prevent spacebar from triggering navigate next button when it's focused
document.getElementById("nextBtn").addEventListener("keydown", function(e) {
  if (e.code === "Space") {
    e.preventDefault();
  }
});

// Prevent spacebar from triggering eye button when it's focused
document.getElementById("eyeBtn").addEventListener("keydown", function(e) {
  if (e.code === "Space") {
    e.preventDefault();
  }
});

// Prevent spacebar from triggering microphone button when it's focused
document.getElementById("microBtn").addEventListener("keydown", function(e) {
  if (e.code === "Space") {
    e.preventDefault();
  }
});

// Initialize input fields state on page load
updateInputFieldsState();

// Vocab visibility toggle functionality
let isVocabVisible = true;

function toggleVocabVisibility() {
  // Prevent toggling when Word Hearo is running
  if (currentGameType === GAME_TYPES.WORD_HEARO && isGameRunning) {
    return;
  }
  
  const eyeIcon = document.getElementById("eyeIcon");
  const wordInput = document.getElementById("word-input");
  const meaningInput = document.getElementById("meaning-input");
  
  isVocabVisible = !isVocabVisible;
  
  if (isVocabVisible) {
    // Show vocab
    eyeIcon.src = "Eye.svg";
    eyeIcon.alt = "Show";
    wordInput.classList.remove("vocab-hidden");
    meaningInput.classList.remove("vocab-hidden");
  } else {
    // Hide vocab
    eyeIcon.src = "Eye_off.svg";
    eyeIcon.alt = "Hide";
    wordInput.classList.add("vocab-hidden");
    meaningInput.classList.add("vocab-hidden");
  }
}

// Function to pronounce vocabulary word
async function pronounceWord() {
  // Handle Word Hearo pronunciation differently
  if (currentGameType === GAME_TYPES.WORD_HEARO && wordHearoManager && isGameRunning) {
    wordHearoManager.pronounceWord();
    return;
  }
  
  // Regular pronunciation for other games
  const wordInput = document.getElementById("word-input");
  const microIcon = document.getElementById("microIcon");
  
  // Auto-trim spaces from input field
  const trimmedWord = wordInput.value.trim();
  wordInput.value = trimmedWord;
  
  const word = trimmedWord.toLowerCase();
  
  // Check if word exists
  if (!word) {
    wordInput.style.border = '2px solid red';
    return;
  } else {
    wordInput.style.border = 'none';
  }
  
  // Check spelling
  if (!(await validateEnglishWord(word))) {
    wordInput.style.border = '2px solid orange';
    const suggestions = await getSpellingSuggestions(word);
    showSpellingErrorPopup(word, suggestions);
    return;
  }
  
  // Change icon to active microphone
  microIcon.src = "micro.svg";
  microIcon.alt = "Speaking";
  
  // Use Speech Synthesis API to pronounce the word
  if ('speechSynthesis' in window) {
    try {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Set up event listener for when speech ends
      utterance.onend = () => {
        microIcon.src = "micro_off.svg";
        microIcon.alt = "Microphone";
      };
      
      utterance.onerror = () => {
        microIcon.src = "micro_off.svg";
        microIcon.alt = "Microphone";
        console.log('Speech synthesis error');
      };
      
      // Start speaking
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.log('Speech synthesis not supported or error occurred');
      microIcon.src = "micro_off.svg";
      microIcon.alt = "Microphone";
    }
  } else {
    console.log('Speech synthesis not supported in this browser');
    microIcon.src = "micro_off.svg";
    microIcon.alt = "Microphone";
  }
}

// Hiển thị overlay chúc mừng
function showCongratsOverlay() {
  const overlay = document.getElementById('congratsOverlay');
  const popupImage = document.getElementById('congratsPopupImage');
  const closeBtn = document.getElementById('closeCongratsPopupBtn');
  
  // Chọn ngẫu nhiên 1 trong 3 popup asset
  const popupAssets = [
    "congratulation_popup1.svg",
    "congratulation_popup2.svg", 
    "congratulation_popup3.svg"
  ];
  const randomAsset = popupAssets[Math.floor(Math.random() * popupAssets.length)];
  
  // Set random popup image
  popupImage.src = randomAsset;
  
  // Set up close button
  closeBtn.onclick = hideCongratsOverlay;
  
  // Close on overlay click (outside popup)
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      hideCongratsOverlay();
    }
  };
  
  // Show overlay
  overlay.style.display = 'flex';
}

function hideCongratsOverlay() {
  const overlay = document.getElementById('congratsOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// --- START ANIMATION LOOP ON PAGE LOAD ---
// This line ensures the canvas always animates, even if the game is not started

// Test function to demonstrate auto-height for collected letters (for debugging)
function testCollectedLettersAutoHeight() {
  const testText = "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z A B C D E F G H I J K L M N O P Q R S T U V W X Y Z";
  collected = testText;
  updateCollectedDisplay();
  console.log("Testing auto-height with long collected letters text");
}

// Update popup positions when window resizes
window.addEventListener('resize', () => {
  resizeCanvas();
  updatePopupPositions();
});

// If DOM is already loaded, setup immediately
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setupAutoResize();
    updateCollectedDisplay();
    updatePopupPositions();
  });
} else {
  setupAutoResize();
  updateCollectedDisplay();
  updatePopupPositions();
}

// Placeholder draw functions for other games
function drawWordHunter() {
  if (wordHunterManager) {
    wordHunterManager.draw(ctx);
  } else {
    ctx.save();
    ctx.font = "24px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText("Word Hunter Game - Loading...", canvas.width / 2, canvas.height / 2);
    ctx.restore();
  }
}

function drawWordHearo(deltaTime) {
  if (wordHearoManager) {
    // Update cursor blinking
    if (deltaTime) {
      wordHearoManager.updateCursor(deltaTime);
    }
    
    // Check for game completion
    if (isGameRunning && wordHearoManager.isComplete()) {
      // Game completed successfully
      playCount++;
      document.getElementById("play-count").innerText = `${playCount} lượt luyện tập`;
      
      // Show congratulations overlay
      showCongratsOverlay();
      
      // Reset game and pause
      wordHearoManager.reset();
      isGameRunning = false;
      gameInitialized = false; // Reset initialization flag when game completes
      const playPauseIcon = document.getElementById("playPauseIcon");
      playPauseIcon.src = "vocab_card_header_icon_play.svg";
      playPauseIcon.alt = "Play";
      updateInputFieldsState();
      // Stop background music
      audioManager.stopBackgroundMusic();
      
      // Update vocab visibility for Word Hearo completion
      updateVocabVisibilityForHearo();
    }
    
    wordHearoManager.draw(ctx);
  } else {
    ctx.save();
    ctx.font = "24px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText("Word Hearo Game - Loading...", canvas.width / 2, canvas.height / 2);
    ctx.restore();
  }
}

// Final initialization attempt after all scripts are loaded
setTimeout(() => {
  tryInitializeManagers();
  console.log('Final manager initialization check complete');
}, 100);

// Function to manage vocab visibility and eye button state for Word Hearo
function updateVocabVisibilityForHearo() {
  const eyeBtn = document.getElementById("eyeBtn");
  const eyeIcon = document.getElementById("eyeIcon");
  const wordInput = document.getElementById("word-input");
  const meaningInput = document.getElementById("meaning-input");
  
  if (currentGameType === GAME_TYPES.WORD_HEARO && isGameRunning) {
    // Word Hearo is running: hide vocab and deactivate eye button
    eyeBtn.disabled = true;
    eyeBtn.style.opacity = "0.5";
    eyeBtn.style.cursor = "not-allowed";
    
    // Hide vocab regardless of current state
    eyeIcon.src = "Eye_off.svg";
    eyeIcon.alt = "Hide";
    wordInput.classList.add("vocab-hidden");
    meaningInput.classList.add("vocab-hidden");
  } else {
    // Word Hearo is not running or different game: reactivate eye button
    eyeBtn.disabled = false;
    eyeBtn.style.opacity = "1";
    eyeBtn.style.cursor = "pointer";
    
    // Restore vocab visibility state
    if (isVocabVisible) {
      eyeIcon.src = "Eye.svg";
      eyeIcon.alt = "Show";
      wordInput.classList.remove("vocab-hidden");
      meaningInput.classList.remove("vocab-hidden");
    } else {
      eyeIcon.src = "Eye_off.svg";
      eyeIcon.alt = "Hide";
      wordInput.classList.add("vocab-hidden");
      meaningInput.classList.add("vocab-hidden");
    }
    
    // Show vocab when Word Hearo ends
    if (currentGameType === GAME_TYPES.WORD_HEARO && !isGameRunning) {
      isVocabVisible = true;
      eyeIcon.src = "Eye.svg";
      eyeIcon.alt = "Show";
      wordInput.classList.remove("vocab-hidden");
      meaningInput.classList.remove("vocab-hidden");
    }
  }
}

// --- INPUT MANAGEMENT FUNCTIONS ---
function clearInputs() {
  console.log("clearInputs() called");
  console.log("isGameRunning:", isGameRunning);
  console.log("currentGameType:", currentGameType);
  console.log("GAME_TYPES.WORD_HEARO:", GAME_TYPES.WORD_HEARO);
  
  const wordInput = document.getElementById("word-input");
  const meaningInput = document.getElementById("meaning-input");
  
  // Special handling for Word Hearo - show and active vocab inputs FIRST
  if (isGameRunning && currentGameType === GAME_TYPES.WORD_HEARO) {
    console.log("Word Hearo clearInputs - inside condition");
    console.log("Word Hearo clearInputs - checking vocab visibility:", isVocabVisible);
    console.log("wordInput has vocab-hidden class:", wordInput.classList.contains("vocab-hidden"));
    console.log("meaningInput has vocab-hidden class:", meaningInput.classList.contains("vocab-hidden"));
    
    // Ensure vocab inputs are visible and active
    if (!isVocabVisible) {
      console.log("Word Hearo clearInputs - making vocab visible");
      isVocabVisible = true;
      const eyeIcon = document.getElementById("eyeIcon");
      eyeIcon.src = "Eye.svg";
      eyeIcon.alt = "Show";
      wordInput.classList.remove("vocab-hidden");
      meaningInput.classList.remove("vocab-hidden");
      console.log("Word Hearo clearInputs - vocab inputs should now be visible");
      console.log("After removal - wordInput has vocab-hidden class:", wordInput.classList.contains("vocab-hidden"));
      console.log("After removal - meaningInput has vocab-hidden class:", meaningInput.classList.contains("vocab-hidden"));
    } else {
      console.log("Word Hearo clearInputs - vocab already visible, no need to change");
    }
  } else {
    console.log("Word Hearo clearInputs - condition not met, skipping vocab visibility logic");
  }
  
  // Clear input values
  wordInput.value = "";
  meaningInput.value = "";
  
  // Reset all styling
  wordInput.style.border = "none";
  meaningInput.style.border = "none";
  wordInput.style.backgroundColor = "";
  meaningInput.style.backgroundColor = "";
  
  // Ensure inputs are enabled
  wordInput.disabled = false;
  meaningInput.disabled = false;
  
  // Reset game state
  targetWord = "";
  collected = "";
  playCount = 0;
  
  // Update displays
  updateCollectedDisplay();
  document.getElementById("play-count").innerText = "0 lượt luyện tập";
  
  // Stop game if running
  if (isGameRunning) {
    isGameRunning = false;
    const playPauseIcon = document.getElementById("playPauseIcon");
    playPauseIcon.src = "vocab_card_header_icon_play.svg";
    playPauseIcon.alt = "Play";
    
    // Stop background music
    audioManager.stopBackgroundMusic();
  }
  
  // Reset game initialization flag
  gameInitialized = false;
  
  // Update input fields state to ensure they are enabled
  updateInputFieldsState();
  
  // BACKUP: Force show vocab inputs for Word Hearo after clearing (regardless of previous state)
  if (currentGameType === GAME_TYPES.WORD_HEARO) {
    console.log("BACKUP: Forcing Word Hearo vocab inputs to be visible");
    isVocabVisible = true;
    const eyeIcon = document.getElementById("eyeIcon");
    eyeIcon.src = "Eye.svg";
    eyeIcon.alt = "Show";
    wordInput.classList.remove("vocab-hidden");
    meaningInput.classList.remove("vocab-hidden");
    console.log("BACKUP: Word Hearo vocab inputs forced visible");
  }
  
  console.log("Inputs cleared and game reset");
}

// ========================================
// RESPONSIVE HELPER FUNCTIONS - NOT USED YET
// ========================================

/**
 * Get current screen type based on window width
 * NOT CALLED YET - ready for implementation
 * @returns {string} Screen type: 'mobile-small', 'mobile', 'tablet', 'desktop'
 */
function getScreenType() {
  const width = window.innerWidth;
  if (width <= 480) return 'mobile-small';
  if (width <= 768) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
}

/**
 * Check if current screen is mobile (tablet or smaller)
 * NOT CALLED YET - ready for implementation
 * @returns {boolean} True if mobile/tablet screen
 */
function isMobileScreen() {
  return window.innerWidth <= 1024;
}

/**
 * Check if screen is in landscape orientation
 * NOT CALLED YET - ready for implementation
 * @returns {boolean} True if landscape orientation
 */
function isLandscapeOrientation() {
  return window.innerHeight <= 600 && 
         (screen.orientation?.angle === 90 || screen.orientation?.angle === 270 || 
          window.innerWidth > window.innerHeight);
}

/**
 * Get responsive canvas dimensions
 * NOT CALLED YET - ready for implementation
 * @returns {object} {width, height} Canvas dimensions for current screen
 */
function getResponsiveCanvasDimensions() {
  const isMobile = isMobileScreen();
  
  if (isMobile) {
    return {
      width: window.innerWidth,
      height: Math.min(window.innerHeight * 0.6, 500)
    };
  } else {
    return {
      width: window.innerWidth - 436 - 40,
      height: window.innerHeight
    };
  }
}

// These functions are defined but NOT EXECUTED
// Current canvas resizing logic remains unchanged


