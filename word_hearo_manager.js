// Word Hearo Manager - Listening and typing game
class WordHearoManager {
  constructor() {
    this.reset();
    this.voices = [
      { name: 'Male', voice: null },
      { name: 'Female', voice: null }, 
      { name: 'Child', voice: null },
      { name: 'Asian Female', voice: null }
    ];
    this.initializeVoices();
  }

  initializeVoices() {
    // Wait for voices to be loaded
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      console.log('Available voices:', availableVoices.map(v => `${v.name} (${v.lang})`));
      
      if (availableVoices.length === 0) {
        console.log('No voices available yet, waiting...');
        return;
      }
      
      // Filter to English voices only
      const englishVoices = availableVoices.filter(v => 
        v.lang.startsWith('en-') || v.lang === 'en'
      );
      
      console.log('English voices:', englishVoices.map(v => `${v.name} (${v.lang})`));
      
      if (englishVoices.length === 0) {
        console.log('No English voices found, using any available voice');
        const anyVoice = availableVoices[0];
        this.voices.forEach(voiceObj => {
          voiceObj.voice = anyVoice;
        });
        return;
      }
      
      // Strategy: Use different voices for different rounds, even if not perfectly matching the description
      
      // Round 1: Try to find a male voice, or use first available
      this.voices[0].voice = englishVoices.find(v => 
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('david') || 
        v.name.toLowerCase().includes('mark') ||
        v.name.toLowerCase().includes('george') ||
        v.name.toLowerCase().includes('alex')
      ) || englishVoices[0];
      
      // Round 2: Try to find a female voice different from round 1
      this.voices[1].voice = englishVoices.find(v => 
        v !== this.voices[0].voice && (
          v.name.toLowerCase().includes('female') || 
          v.name.toLowerCase().includes('samantha') || 
          v.name.toLowerCase().includes('susan') ||
          v.name.toLowerCase().includes('karen') ||
          v.name.toLowerCase().includes('victoria') ||
          v.name.toLowerCase().includes('zira')
        )
      ) || englishVoices.find(v => v !== this.voices[0].voice) || englishVoices[Math.min(1, englishVoices.length - 1)];
      
      // Round 3: Try to find a different voice for child (could be any remaining voice with higher pitch simulation)
      this.voices[2].voice = englishVoices.find(v => 
        v !== this.voices[0].voice && v !== this.voices[1].voice
      ) || englishVoices[Math.min(2, englishVoices.length - 1)];
      
      // Round 4: Use remaining voice or any different voice
      this.voices[3].voice = englishVoices.find(v => 
        v !== this.voices[0].voice && 
        v !== this.voices[1].voice && 
        v !== this.voices[2].voice
      ) || englishVoices[Math.min(3, englishVoices.length - 1)];
      
      // Ensure we have 4 different voices if possible
      const usedVoices = new Set();
      this.voices.forEach((voiceObj, index) => {
        if (usedVoices.has(voiceObj.voice)) {
          // Find an unused voice
          const unusedVoice = englishVoices.find(v => !usedVoices.has(v));
          if (unusedVoice) {
            voiceObj.voice = unusedVoice;
          }
        }
        usedVoices.add(voiceObj.voice);
      });
      
      console.log('Selected voices:');
      this.voices.forEach((voiceObj, index) => {
        console.log(`Round ${index + 1} (${voiceObj.name}): ${voiceObj.voice?.name} (${voiceObj.voice?.lang})`);
      });
      
      // Call debug function to verify voice setup
      this.debugVoices();
    };

    // Load voices immediately if available
    loadVoices();
    
    // Also listen for voices changed event (some browsers load voices asynchronously)
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    // Force reload after a short delay to ensure voices are loaded
    setTimeout(loadVoices, 100);
    setTimeout(loadVoices, 500); // Additional delay for some browsers
  }

  reset() {
    this.currentRound = 1;
    this.totalRounds = 4;
    this.isGameActive = false;
    this.currentWord = '';
    this.userInput = '';
    this.hasPlayedAudio = false;
    this.roundComplete = false;
    this.gameComplete = false;
    
    // Canvas input properties
    this.canvasInput = '';
    this.inputFocused = false;
    this.cursorVisible = true;
    this.cursorBlinkTime = 0;
  }

  startGame(targetWord) {
    this.reset();
    this.currentWord = targetWord.toLowerCase();
    this.isGameActive = true;
    this.hasPlayedAudio = false;
    this.roundComplete = false;
    console.log(`Word Hearo started with word: ${this.currentWord}`);
  }

  getCurrentVoice() {
    return this.voices[this.currentRound - 1];
  }

  pronounceWord() {
    if (!this.isGameActive || !this.currentWord) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(this.currentWord);
    const currentVoice = this.getCurrentVoice();
    
    if (currentVoice.voice) {
      utterance.voice = currentVoice.voice;
      console.log(`Using voice: ${currentVoice.voice.name} for round ${this.currentRound}`);
    } else {
      console.log(`No voice available for round ${this.currentRound}`);
    }
    
    // Set voice parameters with different characteristics for each round
    utterance.lang = 'en-US';
    
    // Customize voice characteristics per round
    switch (this.currentRound) {
      case 1: // Male voice
        utterance.rate = 0.9;
        utterance.pitch = 0.8;
        utterance.volume = 1.0;
        break;
      case 2: // Female voice
        utterance.rate = 1.0;
        utterance.pitch = 1.2;
        utterance.volume = 1.0;
        break;
      case 3: // Child voice (higher pitch, slightly faster)
        utterance.rate = 1.1;
        utterance.pitch = 1.5;
        utterance.volume = 0.9;
        break;
      case 4: // Asian Female voice
        utterance.rate = 0.95;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;
        break;
      default:
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
    }

    // Play the word
    speechSynthesis.speak(utterance);
    this.hasPlayedAudio = true;
    this.inputFocused = true;
    
    console.log(`Playing word "${this.currentWord}" with ${currentVoice.name} voice (Round ${this.currentRound}) - Rate: ${utterance.rate}, Pitch: ${utterance.pitch}`);
  }

  handleUserInput(input) {
    if (!this.isGameActive || this.roundComplete) return false;

    // Normalize both input and target word for comparison
    const normalizeText = (text) => {
      return text.trim().toLowerCase().replace(/\s+/g, ' ');
    };

    const normalizedInput = normalizeText(input);
    const normalizedTarget = normalizeText(this.currentWord);
    
    this.userInput = normalizedInput;
    
    if (normalizedInput === normalizedTarget) {
      // Correct answer
      this.handleCorrectAnswer();
      return true;
    } else if (normalizedInput.length > 0) {
      // Wrong answer (only if user typed something)
      this.handleWrongAnswer();
      return false;
    }
    
    return null; // No input yet
  }

  handleCorrectAnswer() {
    this.roundComplete = true;
    
    // Play correct sound
    this.playSound('correct');
    
    if (this.currentRound >= this.totalRounds) {
      // Game completed
      this.gameComplete = true;
      this.isGameActive = false;
      console.log('Word Hearo game completed!');
    } else {
      // Move to next round
      setTimeout(() => {
        this.currentRound++;
        this.roundComplete = false;
        this.hasPlayedAudio = false;
        this.userInput = '';
        console.log(`Advanced to Round ${this.currentRound}`);
      }, 1500); // 1.5 second delay before next round
    }
  }

  handleWrongAnswer() {
    // Play wrong sound
    this.playSound('wrong');
    
    // Show spelling error popup (reuse existing system)
    this.showMisspellingPopup();
  }

  showMisspellingPopup() {
    // Reuse the existing spelling error popup system
    if (window.showSpellingErrorPopup) {
      window.showSpellingErrorPopup(this.userInput, [this.currentWord]);
    }
  }

  playSound(type) {
    // If audio is not enabled, add to pending actions
    if (!audioContextManager.isAudioEnabled) {
      audioContextManager.addPendingAction(() => this.playSound(type));
      return;
    }
    
    try {
      const audio = new Audio();
      audio.src = type === 'correct' ? 'sound/word_hunter_correct.mp3' : 'sound/word_hunter_wrong.mp3';
      
      // Clone for non-blocking playback
      const audioClone = audio.cloneNode();
      const playPromise = audioClone.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log('Audio playback failed:', err);
          // Try to show audio enable overlay if not already shown
          if (!audioContextManager.isAudioEnabled) {
            audioContextManager.showAudioEnableOverlay();
          }
        });
      }
    } catch (error) {
      console.log('Audio setup failed:', error);
    }
  }

  getProgress() {
    if (!this.isGameActive && !this.gameComplete) {
      return "Sẵn sàng bắt đầu";
    }
    
    if (this.gameComplete) {
      return "Hoàn thành tất cả vòng!";
    }
    
    const currentVoice = this.getCurrentVoice();
    const voiceName = currentVoice.voice ? `${currentVoice.name} (${currentVoice.voice.name})` : currentVoice.name;
    const status = this.roundComplete ? "Đúng rồi!" : 
                  this.hasPlayedAudio ? "Đang nghe..." : "Nhấn mic để nghe";
    
    return `Vòng ${this.currentRound}/${this.totalRounds} - ${voiceName} - ${status}`;
  }

  isComplete() {
    return this.gameComplete;
  }

  getCurrentRoundInfo() {
    if (!this.isGameActive) return null;
    
    return {
      round: this.currentRound,
      totalRounds: this.totalRounds,
      voiceType: this.getCurrentVoice().name,
      hasPlayedAudio: this.hasPlayedAudio,
      roundComplete: this.roundComplete,
      gameComplete: this.gameComplete
    };
  }

  draw(ctx) {
    if (!this.isGameActive && !this.gameComplete) {
      // Show initial state - completely clean canvas with no text
      return;
    }

    // Draw game interface
    ctx.save();
    
    // Calculate center coordinates
    const centerX = ctx.canvas.width / 2;
    const canvasHeight = ctx.canvas.height;
    
    // Define element sizes and spacing
    const micSize = 80;
    const spacing = 40;
    const textHeight = 25; // Approximate height for text
    
    // Calculate input field height dynamically
    let inputHeight = 80; // Default height
    if (this.hasPlayedAudio && !this.roundComplete) {
      // Calculate the actual height needed for the input field
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.font = '18px Arial';
      
      const minWidth = 400;
      const maxWidth = 1200;
      const padding = 30;
      
      let requiredWidth = minWidth;
      if (this.canvasInput) {
        const textWidth = tempCtx.measureText(this.canvasInput).width;
        requiredWidth = Math.min(maxWidth, Math.max(minWidth, textWidth + padding));
      }
      
      const maxTextWidth = requiredWidth - 30;
      const lineHeight = 24;
      const numberOfLines = this.calculateTextLines(tempCtx, this.canvasInput, maxTextWidth);
      inputHeight = Math.max(80, (numberOfLines * lineHeight) + 30);
    }
    
    // Calculate total height of all elements and their spacing
    let totalElementsHeight = micSize; // Microphone circle
    totalElementsHeight += spacing; // Space between mic and text
    totalElementsHeight += textHeight; // Instruction text
    
    if (this.hasPlayedAudio && !this.roundComplete) {
      totalElementsHeight += spacing; // Space between text and input
      totalElementsHeight += inputHeight; // Input field
    }
    
    // Calculate starting Y position to center the entire group
    const groupStartY = (canvasHeight - totalElementsHeight) / 2;
    
    // Position each element relative to the group start (center of each element)
    const micY = groupStartY + (micSize / 2);
    const textY = groupStartY + micSize + spacing + (textHeight / 2);
    const inputY = groupStartY + micSize + spacing + textHeight + spacing + (inputHeight / 2);
    
    // Draw microphone icon area
    ctx.fillStyle = this.hasPlayedAudio ? "#4CAF50" : "#FF6B6B";
    ctx.beginPath();
    ctx.arc(centerX, micY, micSize / 2 + 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw microphone icon (simplified) - perfectly centered
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(centerX - 15, micY - 25, 30, 35);
    ctx.beginPath();
    ctx.arc(centerX, micY + 10, 20, 0, Math.PI);
    ctx.fill();
    ctx.fillRect(centerX - 5, micY + 20, 10, 15);
    ctx.fillRect(centerX - 20, micY + 30, 40, 8);
    
    // Draw instruction text
    ctx.font = "18px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    if (!this.hasPlayedAudio) {
      ctx.strokeText("Nhấn vào micro để nghe từ", centerX, textY);
      ctx.fillText("Nhấn vào micro để nghe từ", centerX, textY);
    } else if (this.roundComplete) {
      ctx.fillStyle = "#4CAF50";
      ctx.strokeText("Đúng rồi! Chờ vòng tiếp theo...", centerX, textY);
      ctx.fillText("Đúng rồi! Chờ vòng tiếp theo...", centerX, textY);
    } else {
      ctx.strokeText("Nhập từ bạn nghe được rồi ấn Enter", centerX, textY);
      ctx.fillText("Nhập từ bạn nghe được rồi ấn Enter", centerX, textY);
    }
    
    // Draw canvas input field (only show when audio has been played and round not complete)
    if (this.hasPlayedAudio && !this.roundComplete) {
      this.drawCanvasInput(ctx, centerX, inputY);
    }
    
    // Store positions for click detection
    this.micPosition = { x: centerX, y: micY, size: micSize };
    this.inputPosition = { x: centerX, y: inputY, height: inputHeight };
    
    // Draw level indicator (same style as Word Hunter)
    this.drawLevelIndicator(ctx);
    
    ctx.restore();
  }

  // Draw level indicator (same style as Word Hunter)
  drawLevelIndicator(ctx) {
    ctx.save();
    ctx.font = '18px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    
    const text = `Bàn ${this.currentRound}/4`;
    const x = ctx.canvas.width - 20;
    const y = 60;
    
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    
    // Draw progress bar
    const barWidth = 120;
    const barHeight = 10;
    const barX = x - barWidth;
    const barY = y + 25;
    
    // Background bar with rounded corners effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Progress bar with gradient
    const progress = this.currentRound / 4;
    const progressWidth = barWidth * progress;
    
    // Create gradient for progress bar (blue theme for Word Hearo)
    const gradient = ctx.createLinearGradient(barX, barY, barX + progressWidth, barY);
    gradient.addColorStop(0, '#2196F3');
    gradient.addColorStop(1, '#42A5F5');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, progressWidth, barHeight);
    
    // Border with slight shadow effect
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // Inner border for polished look
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(barX + 0.5, barY + 0.5, barWidth - 1, barHeight - 1);
    
    // Add small indicators for each level
    for (let i = 1; i <= 4; i++) {
      const indicatorX = barX + (barWidth / 4) * i - 1;
      ctx.strokeStyle = i <= this.currentRound ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(indicatorX, barY - 2);
      ctx.lineTo(indicatorX, barY + barHeight + 2);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  // Draw canvas input field (textarea style with dynamic width)
  drawCanvasInput(ctx, centerX, centerY) {
    ctx.save();
    
    // Calculate dynamic width based on text content
    ctx.font = '18px Arial'; // Set font first for text measurement
    const minWidth = 400;
    const maxWidth = 1200;
    const padding = 30;
    
    let requiredWidth = minWidth;
    if (this.canvasInput) {
      const textWidth = ctx.measureText(this.canvasInput).width;
      requiredWidth = Math.min(maxWidth, Math.max(minWidth, textWidth + padding));
    }
    
    // Textarea dimensions - dynamic width, minimum 80px height
    const inputWidth = requiredWidth;
    const baseHeight = 80;
    
    // Calculate required height based on text wrapping
    const maxTextWidth = inputWidth - 30; // Leave padding on both sides
    const lineHeight = 24;
    const numberOfLines = this.calculateTextLines(ctx, this.canvasInput, maxTextWidth);
    const inputHeight = Math.max(baseHeight, (numberOfLines * lineHeight) + 30); // Add padding
    
    const inputX = centerX - inputWidth / 2;
    const inputY = centerY - inputHeight / 2;
    
    // Draw input background with rounded corners
    ctx.fillStyle = '#FFFFFF';
    this.drawRoundedRect(ctx, inputX, inputY, inputWidth, inputHeight, 20);
    ctx.fill();
    
    // Remove border - no stroke drawing
    
    // Text properties
    ctx.fillStyle = '#333333';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const textX = inputX + 15;
    const textY = inputY + 15;
    
    // Draw the input text with word wrapping
    if (this.canvasInput) {
      this.drawWrappedText(ctx, this.canvasInput, textX, textY, maxTextWidth, lineHeight);
    }
    
    // Draw placeholder text if empty
    if (!this.canvasInput) {
      ctx.fillStyle = '#999999';
      ctx.fillText('Nhập từ bạn nghe được rồi ấn Enter', textX, textY);
    }
    
    // Draw cursor (blinking) - position at end of text
    if (this.inputFocused && this.cursorVisible && this.canvasInput) {
      ctx.fillStyle = '#333333';
      const cursorPos = this.getCursorPosition(ctx, this.canvasInput, textX, textY, maxTextWidth, lineHeight);
      ctx.fillRect(cursorPos.x, cursorPos.y, 2, lineHeight);
    } else if (this.inputFocused && this.cursorVisible && !this.canvasInput) {
      // Show cursor at start if no text
      ctx.fillStyle = '#333333';
      ctx.fillRect(textX, textY, 2, lineHeight);
    }
    
    ctx.restore();
  }

  // Helper method to draw wrapped text
  drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let testLine = '';
    let currentY = y;
    
    for (let n = 0; n < words.length; n++) {
      testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  // Helper method to get cursor position for wrapped text
  getCursorPosition(ctx, text, x, y, maxWidth, lineHeight) {
    if (!text) return { x: x, y: y };
    
    const words = text.split(' ');
    let line = '';
    let testLine = '';
    let currentY = y;
    
    for (let n = 0; n < words.length; n++) {
      testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    
    // Get width of final line
    const finalLineWidth = ctx.measureText(line.trim()).width;
    return { x: x + finalLineWidth, y: currentY };
  }

  // Helper method to calculate number of lines needed for text
  calculateTextLines(ctx, text, maxWidth) {
    if (!text) return 1;
    
    const words = text.split(' ');
    let line = '';
    let lineCount = 1;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        lineCount++;
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    
    return lineCount;
  }

  // Helper method to draw rounded rectangle
  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Handle canvas clicks (for microphone and input field)
  handleClick(x, y) {
    if (!this.isGameActive || this.roundComplete) return false;
    
    // Get canvas from document
    const canvas = document.getElementById("gameCanvas");
    if (!canvas) return false;
    
    const centerX = canvas.width / 2;
    const canvasHeight = canvas.height;
    
    // Use the same positioning logic as in draw() method
    const micSize = 80;
    const spacing = 40;
    const textHeight = 25;
    
    // Calculate input field height dynamically (same as draw method)
    let inputHeight = 80;
    if (this.hasPlayedAudio && !this.roundComplete) {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.font = '18px Arial';
      
      const minWidth = 400;
      const maxWidth = 1200;
      const padding = 30;
      
      let requiredWidth = minWidth;
      if (this.canvasInput) {
        const textWidth = tempCtx.measureText(this.canvasInput).width;
        requiredWidth = Math.min(maxWidth, Math.max(minWidth, textWidth + padding));
      }
      
      const maxTextWidth = requiredWidth - 30;
      const lineHeight = 24;
      const numberOfLines = this.calculateTextLines(tempCtx, this.canvasInput, maxTextWidth);
      inputHeight = Math.max(80, (numberOfLines * lineHeight) + 30);
    }
    
    // Calculate total height and positioning (exactly same as draw method)
    let totalElementsHeight = micSize;
    totalElementsHeight += spacing;
    totalElementsHeight += textHeight;
    
    if (this.hasPlayedAudio && !this.roundComplete) {
      totalElementsHeight += spacing;
      totalElementsHeight += inputHeight;
    }
    
    const groupStartY = (canvasHeight - totalElementsHeight) / 2;
    const micY = groupStartY + (micSize / 2);
    const inputY = groupStartY + micSize + spacing + textHeight + spacing + (inputHeight / 2);
    
    // Check if click is within microphone area
    const distance = Math.sqrt((x - centerX) ** 2 + (y - micY) ** 2);
    if (distance <= micSize / 2 + 10) {
      this.pronounceWord();
      return true;
    }
    
    // Check if click is within input field area (when it's visible)
    if (this.hasPlayedAudio && !this.roundComplete) {
      // Calculate dynamic input dimensions
      const minWidth = 400;
      const maxWidth = 1200;
      const padding = 30;
      
      let requiredWidth = minWidth;
      if (this.canvasInput) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.font = '18px Arial';
        const textWidth = tempCtx.measureText(this.canvasInput).width;
        requiredWidth = Math.min(maxWidth, Math.max(minWidth, textWidth + padding));
      }
      
      const inputWidth = requiredWidth;
      const inputX = centerX - inputWidth / 2;
      const inputYTop = inputY - inputHeight / 2;
      
      if (x >= inputX && x <= inputX + inputWidth && y >= inputYTop && y <= inputYTop + inputHeight) {
        this.inputFocused = true;
        return true;
      }
    }
    
    return false;
  }

  // Handle keyboard input for canvas input
  handleKeyInput(event) {
    if (!this.isGameActive || this.roundComplete || !this.hasPlayedAudio) return false;
    
    // Always set input as focused during active gameplay
    this.inputFocused = true;
    
    if (event.key === 'Enter') {
      // Submit input
      event.preventDefault();
      this.submitCanvasInput();
      return true;
    } else if (event.key === 'Backspace') {
      // Remove last character
      event.preventDefault();
      this.canvasInput = this.canvasInput.slice(0, -1);
      return true;
    } else if (event.key.length === 1 && /^[a-zA-Z ]$/.test(event.key)) {
      // Add character (only letters and spaces)
      event.preventDefault();
      this.canvasInput += event.key;
      return true;
    }
    
    return false;
  }
  
  // Submit canvas input
  submitCanvasInput() {
    if (this.canvasInput.trim()) {
      const isCorrect = this.handleUserInput(this.canvasInput);
      
      if (isCorrect) {
        // Correct answer - clear input first
        this.canvasInput = '';
        
        // Check if game is complete
        if (this.isComplete()) {
          // Game completed successfully - trigger game completion logic
          // This will be handled by periodic checking in the game loop
          // or we can dispatch a custom event
          this.onGameComplete();
        }
      } else {
        // Wrong answer - clear input after popup
        setTimeout(() => {
          this.canvasInput = '';
        }, 100);
      }
    }
  }
  
  // Handle game completion
  onGameComplete() {
    // This method can be overridden or we can dispatch an event
    // For now, we'll let the existing game logic in game.js handle it
    console.log('Word Hearo game completed!');
  }
  
  // Update cursor blinking animation
  updateCursor(deltaTime) {
    if (this.inputFocused) {
      this.cursorBlinkTime += deltaTime;
      if (this.cursorBlinkTime > 500) { // Blink every 500ms
        this.cursorVisible = !this.cursorVisible;
        this.cursorBlinkTime = 0;
      }
    }
  }

  // Debug function to test voices
  debugVoices() {
    console.log('=== WORD HEARO VOICE DEBUG ===');
    const availableVoices = speechSynthesis.getVoices();
    console.log(`Total available voices: ${availableVoices.length}`);
    
    availableVoices.forEach((voice, index) => {
      console.log(`${index}: ${voice.name} (${voice.lang}) - Default: ${voice.default}, Local: ${voice.localService}`);
    });
    
    console.log('\n=== SELECTED VOICES FOR WORD HEARO ===');
    this.voices.forEach((voiceObj, index) => {
      console.log(`Round ${index + 1} (${voiceObj.name}): ${voiceObj.voice?.name || 'NOT SET'} (${voiceObj.voice?.lang || 'NO LANG'})`);
    });
    
    // Test if voices are actually different
    const uniqueVoices = new Set(this.voices.map(v => v.voice?.name));
    console.log(`Unique voices count: ${uniqueVoices.size} out of 4 rounds`);
    if (uniqueVoices.size < 4) {
      console.warn('⚠️ Some rounds are using the same voice!');
    } else {
      console.log('✅ All rounds have different voices');
    }
  }

  // Test function to play all 4 voices sequentially
  testAllVoices(testWord = "hello") {
    console.log('Testing all 4 voices...');
    
    this.voices.forEach((voiceObj, index) => {
      setTimeout(() => {
        console.log(`Testing voice ${index + 1}: ${voiceObj.name}`);
        
        if (voiceObj.voice) {
          speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(testWord);
          utterance.voice = voiceObj.voice;
          utterance.lang = 'en-US';
          
          // Apply the same settings as in pronounceWord
          switch (index + 1) {
            case 1: // Male voice
              utterance.rate = 0.9;
              utterance.pitch = 0.8;
              utterance.volume = 1.0;
              break;
            case 2: // Female voice
              utterance.rate = 1.0;
              utterance.pitch = 1.2;
              utterance.volume = 1.0;
              break;
            case 3: // Child voice
              utterance.rate = 1.1;
              utterance.pitch = 1.5;
              utterance.volume = 0.9;
              break;
            case 4: // Asian Female voice
              utterance.rate = 0.95;
              utterance.pitch = 1.1;
              utterance.volume = 1.0;
              break;
          }
          
          utterance.onstart = () => {
            console.log(`Playing: ${voiceObj.voice.name} - Rate: ${utterance.rate}, Pitch: ${utterance.pitch}`);
          };
          
          speechSynthesis.speak(utterance);
        } else {
          console.log(`Voice ${index + 1} not available`);
        }
      }, index * 2000); // 2 second delay between each voice
    });
  }
}

// Export for use in main game
window.WordHearoManager = WordHearoManager;

// Expose test functions globally for debugging
window.testWordHearoVoices = function() {
  if (window.wordHearoManager) {
    window.wordHearoManager.testAllVoices("apple");
  } else {
    console.log('WordHearoManager not initialized yet');
  }
};

window.debugWordHearoVoices = function() {
  if (window.wordHearoManager) {
    window.wordHearoManager.debugVoices();
  } else {
    console.log('WordHearoManager not initialized yet');
  }
};
