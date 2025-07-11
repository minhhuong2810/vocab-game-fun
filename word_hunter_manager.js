// Word Hunter Game Manager
// Implements the card-matching gameplay with 4 levels of difficulty

class WordHunterManager {
  constructor() {
    this.isActive = false;
    this.currentLevel = 1; // 1: 4 cards, 2: 8 cards, 3: 16 cards, 4: 20 cards
    this.targetWord = "";
    this.cards = [];
    this.cardImage = null;
    this.gameState = 'initial'; // 'initial', 'playing', 'completed'
    this.setupCardAsset();
    this.setupAudio();
  }

  setupCardAsset() {
    // Load word hunter card asset
    this.cardImage = new Image();
    this.cardImage.src = 'word_hunter_card.svg';
  }

  setupAudio() {
    // Setup audio for feedback with error handling
    try {
      this.correctSound = new Audio('sound/word_hunter_correct.mp3'); // Use word hunter correct sound
      this.wrongSound = new Audio('sound/word_hunter_wrong.mp3'); // Use word hunter wrong sound
      
      // Set volume levels
      this.correctSound.volume = 0.5;
      this.wrongSound.volume = 0.3;
      
      // Preload sounds
      this.correctSound.preload = 'auto';
      this.wrongSound.preload = 'auto';
      
      // Add error handlers to prevent blocking
      this.correctSound.addEventListener('error', (e) => {
        console.log('Correct sound loading failed:', e);
        this.correctSound = null;
      });
      
      this.wrongSound.addEventListener('error', (e) => {
        console.log('Wrong sound loading failed:', e);
        this.wrongSound = null;
      });
    } catch (e) {
      console.log('Audio setup failed:', e);
      this.correctSound = null;
      this.wrongSound = null;
    }
  }

  playCorrectSound() {
    if (!this.correctSound) return;
    
    // If audio is not enabled, add to pending actions
    if (!audioContextManager.isAudioEnabled) {
      audioContextManager.addPendingAction(() => this.playCorrectSound());
      return;
    }
    
    try {
      // Clone audio to avoid blocking
      const audioClone = this.correctSound.cloneNode();
      audioClone.volume = 0.5;
      const playPromise = audioClone.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.log('Audio play failed:', e);
          // Try to show audio enable overlay if not already shown
          if (!audioContextManager.isAudioEnabled) {
            audioContextManager.showAudioEnableOverlay();
          }
        });
      }
    } catch (e) {
      console.log('Audio play error:', e);
    }
  }

  playWrongSound() {
    if (!this.wrongSound) return;
    
    // If audio is not enabled, add to pending actions
    if (!audioContextManager.isAudioEnabled) {
      audioContextManager.addPendingAction(() => this.playWrongSound());
      return;
    }
    
    try {
      // Clone audio to avoid blocking
      const audioClone = this.wrongSound.cloneNode();
      audioClone.volume = 0.3;
      const playPromise = audioClone.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.log('Audio play failed:', e);
          // Try to show audio enable overlay if not already shown
          if (!audioContextManager.isAudioEnabled) {
            audioContextManager.showAudioEnableOverlay();
          }
        });
      }
    } catch (e) {
      console.log('Audio play error:', e);
    }
  }

  // Initialize game with target word
  initialize(targetWord) {
    // Convert to title case instead of uppercase
    this.targetWord = this.toTitleCase(targetWord);
    this.currentLevel = 1;
    this.gameState = 'initial';
    this.generateInitialCards();
  }

  // Generate cards for initial state (before game starts)
  generateInitialCards() {
    const cardCount = 4;
    this.cards = [];
    
    // Generate 4 cards with radial gradient backgrounds
    const gradients = [
      { start: '#FFB6B6', end: '#996D6D' }, // Pink gradient
      { start: '#FF9B04', end: '#995D02' }, // Orange gradient
      { start: '#58D7FF', end: '#358199' }, // Blue gradient
      { start: '#FFE178', end: '#998748' }, // Yellow gradient
      { start: '#D7FFD0', end: '#81997D' }  // Green gradient
    ];
    
    for (let i = 0; i < cardCount; i++) {
      this.cards.push({
        id: i,
        word: '',
        gradient: gradients[i % gradients.length], // Cycle through gradients
        x: 0,
        y: 0,
        width: 400,
        height: 80,
        isCorrect: false,
        clicked: false,
        isLandscape: false,
        optimalFontSize: undefined
      });
    }
    
    this.arrangeCards(2, 2); // 2x2 grid
  }

  // Start the game - generate level 1 cards
  startGame() {
    this.gameState = 'playing';
    this.currentLevel = 1;
    this.generateCardsForLevel(1);
  }

  // Generate cards for specific level
  generateCardsForLevel(level) {
    this.currentLevel = level;
    let cardCount, rows, cols, cardWidth, cardHeight;

    // Determine grid layout and card size based on level
    switch (level) {
      case 1: 
        cardCount = 4; rows = 2; cols = 2; 
        cardWidth = 400; cardHeight = 80;
        break;
      case 2: 
        cardCount = 8; rows = 4; cols = 2; 
        cardWidth = 400; cardHeight = 80;
        break;
      case 3: 
        cardCount = 16; rows = 8; cols = 2; 
        cardWidth = 400; cardHeight = 80;
        break;
      case 4: 
        cardCount = 20; rows = 10; cols = 2; 
        cardWidth = 400; cardHeight = 80;
        break;
      default: 
        cardCount = 4; rows = 2; cols = 2; 
        cardWidth = 400; cardHeight = 80; 
        break;
    }

    this.cards = [];
    
    // Generate one correct word and multiple misspelled versions
    const correctWord = this.targetWord;
    
    try {
      const incorrectWords = this.generateMisspelledWords(correctWord, cardCount - 1);
      
      // Create all words array and shuffle
      const allWords = [correctWord, ...incorrectWords];
      this.shuffleArray(allWords);

      // Check if we need landscape orientation for long words
      const maxWordLength = Math.max(...allWords.map(word => word.length));
      const shouldUseLandscape = maxWordLength > 10;

      // For very long words, keep the wide landscape format but don't swap dimensions
      if (maxWordLength > 10) {
        const multiplier = 1.2 + Math.min(0.3, (maxWordLength - 10) * 0.02); // 1.2x to 1.5x
        cardWidth = Math.floor(cardWidth * multiplier);
        // Keep height the same for horizontal cards
      }

      // Create cards
      for (let i = 0; i < cardCount; i++) {
        // Gradient colors for cards
        const gradients = [
          { start: '#FFB6B6', end: '#996D6D' }, // Pink gradient
          { start: '#FF9B04', end: '#995D02' }, // Orange gradient
          { start: '#58D7FF', end: '#358199' }, // Blue gradient
          { start: '#FFE178', end: '#998748' }, // Yellow gradient
          { start: '#D7FFD0', end: '#81997D' }  // Green gradient
        ];
        
        // All cards use horizontal format now
        this.cards.push({
          id: i,
          word: allWords[i],
          gradient: gradients[i % gradients.length], // Cycle through gradients
          x: 0,
          y: 0,
          width: cardWidth,  // Always use the wide format
          height: cardHeight, // Always use the short format
          isCorrect: allWords[i] === correctWord,
          clicked: false,
          isLandscape: true, // All cards are landscape now
          optimalFontSize: undefined // Reset for new calculation
        });
      }

      this.arrangeCards(rows, cols);
    } catch (error) {
      console.error('Error generating cards for level', level, ':', error);
    }
  }

  // Generate misspelled words that are similar to the correct word
  generateMisspelledWords(correctWord, count) {
    // Work with uppercase for easier processing
    const workingWord = correctWord.toUpperCase();
    const misspelledWords = new Set();
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let attempts = 0;
    const maxAttempts = Math.max(50, count * 10); // Reduce max attempts to prevent infinite loops
    
    while (misspelledWords.size < count && attempts < maxAttempts) {
      attempts++;
      let misspelled = workingWord;
      const changeType = Math.random();
      
      if (changeType < 0.3 && misspelled.length > 1) {
        // Substitute a character (prefer middle/end positions for longer words)
        let pos;
        if (misspelled.length > 8) {
          pos = Math.floor(Math.random() * (misspelled.length - 2)) + 1; // Avoid first letter
        } else {
          pos = Math.floor(Math.random() * misspelled.length);
        }
        let newChar;
        do {
          newChar = alphabet[Math.floor(Math.random() * alphabet.length)];
        } while (newChar === misspelled[pos]); // Ensure it's different
        misspelled = misspelled.substring(0, pos) + newChar + misspelled.substring(pos + 1);
      } else if (changeType < 0.5 && misspelled.length > 3) {
        // Remove a character (prefer middle positions for longer words)
        let pos;
        if (misspelled.length > 8) {
          pos = Math.floor(Math.random() * (misspelled.length - 4)) + 2; // Keep first/last letters
        } else {
          pos = Math.floor(Math.random() * (misspelled.length - 2)) + 1;
        }
        misspelled = misspelled.substring(0, pos) + misspelled.substring(pos + 1);
      } else if (changeType < 0.7) {
        // Add a character (prefer middle positions)
        let pos;
        if (misspelled.length > 8) {
          pos = Math.floor(Math.random() * (misspelled.length - 2)) + 1;
        } else {
          pos = Math.floor(Math.random() * (misspelled.length + 1));
        }
        const newChar = alphabet[Math.floor(Math.random() * alphabet.length)];
        misspelled = misspelled.substring(0, pos) + newChar + misspelled.substring(pos);
      } else if (changeType < 0.85) {
        // Swap two adjacent characters (prefer middle positions for longer words)
        if (misspelled.length > 1) {
          let pos;
          if (misspelled.length > 8) {
            pos = Math.floor(Math.random() * (misspelled.length - 3)) + 1;
          } else {
            pos = Math.floor(Math.random() * (misspelled.length - 1));
          }
          misspelled = misspelled.substring(0, pos) + 
                     misspelled[pos + 1] + 
                     misspelled[pos] + 
                     misspelled.substring(pos + 2);
        }
      } else {
        // Double character (duplicate a character)
        if (misspelled.length > 1) {
          const pos = Math.floor(Math.random() * misspelled.length);
          misspelled = misspelled.substring(0, pos) + 
                     misspelled[pos] + 
                     misspelled.substring(pos);
        }
      }
      
      // Make sure it's different from original and reasonable length
      if (misspelled !== workingWord && 
          misspelled.length >= Math.max(3, workingWord.length - 3) && 
          misspelled.length <= workingWord.length + 4) {
        misspelledWords.add(misspelled);
      }
    }
    
    // If we don't have enough unique misspellings, generate simple variants
    const commonPrefixes = ['UN', 'RE', 'PRE', 'MIS', 'DE', 'IN', 'DIS'];
    const commonSuffixes = ['ED', 'ING', 'LY', 'ION', 'TION', 'ER', 'EST', 'S'];
    
    let fallbackAttempts = 0;
    const maxFallbackAttempts = 20; // Limit fallback attempts
    
    while (misspelledWords.size < count && fallbackAttempts < maxFallbackAttempts) {
      fallbackAttempts++;
      let variant = workingWord;
      
      if (Math.random() < 0.5 && workingWord.length < 12) {
        // Add prefix
        const prefix = commonPrefixes[Math.floor(Math.random() * commonPrefixes.length)];
        variant = prefix + workingWord;
      } else if (workingWord.length < 12) {
        // Add suffix  
        const suffix = commonSuffixes[Math.floor(Math.random() * commonSuffixes.length)];
        variant = workingWord + suffix;
      } else {
        // For very long words, create simple variations
        variant = workingWord + Math.floor(Math.random() * 99);
      }
      
      if (variant !== workingWord && variant.length <= 20) {
        misspelledWords.add(variant);
      }
    }
    
    // Final fallback: create simple numbered variants if still not enough
    let finalCount = misspelledWords.size;
    while (finalCount < count) {
      const variant = workingWord + (finalCount + 1);
      misspelledWords.add(variant);
      finalCount++;
    }
    
    const result = Array.from(misspelledWords).slice(0, count).map(word => this.toTitleCase(word));
    return result;
  }

  // Arrange cards in grid layout
  arrangeCards(rows, cols) {
    const canvas = document.getElementById("gameCanvas");
    const padding = 12; // Reduce padding to save space
    
    // Calculate total grid dimensions accounting for different card sizes
    let maxRowHeight = 0;
    let maxRowWidth = 0;
    
    // Find maximum dimensions per row
    for (let row = 0; row < rows; row++) {
      let rowWidth = 0;
      let rowHeight = 0;
      
      for (let col = 0; col < cols; col++) {
        const cardIndex = row * cols + col;
        if (cardIndex < this.cards.length) {
          const card = this.cards[cardIndex];
          rowWidth += card.width + (col > 0 ? padding : 0);
          rowHeight = Math.max(rowHeight, card.height);
        }
      }
      
      maxRowHeight = Math.max(maxRowHeight, rowHeight);
      maxRowWidth = Math.max(maxRowWidth, rowWidth);
    }
    
    const totalHeight = rows * maxRowHeight + (rows - 1) * padding;
    
    // Scale down if content is too wide for canvas
    let scale = 1;
    const availableWidth = canvas.width - 40; // Leave 20px margin each side
    const availableHeight = canvas.height - 160; // Leave space for UI elements
    
    if (maxRowWidth > availableWidth) {
      scale = Math.min(0.9, availableWidth / maxRowWidth);
    }
    
    if (totalHeight * scale > availableHeight) {
      scale = Math.min(scale, availableHeight / totalHeight);
    }
    
    // Apply scale to all cards
    if (scale < 1) {
      this.cards.forEach(card => {
        card.width = Math.floor(card.width * scale);
        card.height = Math.floor(card.height * scale);
      });
      
      // Recalculate dimensions after scaling
      maxRowHeight = 0;
      maxRowWidth = 0;
      
      for (let row = 0; row < rows; row++) {
        let rowWidth = 0;
        let rowHeight = 0;
        
        for (let col = 0; col < cols; col++) {
          const cardIndex = row * cols + col;
          if (cardIndex < this.cards.length) {
            const card = this.cards[cardIndex];
            rowWidth += card.width + (col > 0 ? padding : 0);
            rowHeight = Math.max(rowHeight, card.height);
          }
        }
        
        maxRowHeight = Math.max(maxRowHeight, rowHeight);
        maxRowWidth = Math.max(maxRowWidth, rowWidth);
      }
    }
    
    const finalTotalHeight = rows * maxRowHeight + (rows - 1) * padding;
    
    const startX = Math.max(20, (canvas.width - maxRowWidth) / 2);
    const startY = Math.max(80, (canvas.height - finalTotalHeight) / 2 + 30);
    
    // Position cards
    for (let row = 0; row < rows; row++) {
      let currentX = startX;
      const currentY = startY + row * (maxRowHeight + padding);
      
      for (let col = 0; col < cols; col++) {
        const cardIndex = row * cols + col;
        if (cardIndex < this.cards.length) {
          const card = this.cards[cardIndex];
          
          card.x = currentX;
          // Center card vertically in its row
          card.y = currentY + (maxRowHeight - card.height) / 2;
          
          currentX += card.width + padding;
        }
      }
    }
  }

  // Handle mouse click on canvas
  handleClick(x, y) {
    if (this.gameState !== 'playing') return false;
    
    for (let card of this.cards) {
      if (x >= card.x && x <= card.x + card.width &&
          y >= card.y && y <= card.y + card.height && !card.clicked) {
        
        card.clicked = true;
        
        if (card.isCorrect) {
          // Correct card clicked - play success sound
          this.playCorrectSound();
          
          // Advance to next level or complete game
          if (this.currentLevel < 4) {
            setTimeout(() => {
              this.currentLevel++;
              this.generateCardsForLevel(this.currentLevel);
            }, 800); // Slightly longer delay to show selection
          } else {
            // Game completed
            setTimeout(() => {
              this.gameState = 'completed';
            }, 800);
            return true; // Signal game completion
          }
        } else {
          // Wrong card clicked - play error sound
          this.playWrongSound();
          
          // Reset after delay
          setTimeout(() => {
            card.clicked = false;
          }, 1200); // Longer delay for wrong answers
        }
        return false; // Continue game
      }
    }
    return false;
  }

  // Draw the game
  draw(ctx) {
    // Calculate optimal font size for all cards first
    if (this.gameState === 'playing') {
      this.calculateOptimalFontSize(ctx);
    }
    
    // Draw cards
    for (let card of this.cards) {
      this.drawCard(ctx, card);
    }
    
    // Draw level indicator
    if (this.gameState === 'playing') {
      this.drawLevelIndicator(ctx);
    }
  }

  // Calculate optimal font size that works for all cards
  calculateOptimalFontSize(ctx) {
    if (this.cards.length === 0 || this.cards[0].optimalFontSize !== undefined) {
      return; // Already calculated
    }
    
    let globalOptimalSize = 24; // Higher starting font for wider cards
    
    // Test each card to find the limiting font size
    for (let card of this.cards) {
      if (!card.word) continue;
      
      const padding = 30; // More padding for wider cards
      const maxWidth = card.width - padding;
      const maxHeight = card.height - 20; // Less vertical padding needed
      
      // Find optimal font size for this specific card
      let cardOptimalSize = 24; // Start higher for horizontal cards
      
      while (cardOptimalSize >= 10) {
        ctx.font = `${cardOptimalSize}px Arial`;
        
        // Try single line first (preferred for horizontal cards)
        const singleLineWidth = ctx.measureText(card.word).width;
        const singleLineHeight = cardOptimalSize;
        
        if (singleLineWidth <= maxWidth && singleLineHeight <= maxHeight) {
          // Single line fits - this is ideal for horizontal cards
          break;
        }
        
        // Try multi-line if single line doesn't fit
        const lines = this.smartWrapText(ctx, card.word, maxWidth);
        const lineHeight = cardOptimalSize + 2;
        const totalTextHeight = lines.length * lineHeight;
        
        if (totalTextHeight <= maxHeight) {
          // Multi-line fits
          break;
        }
        
        cardOptimalSize -= 1;
      }
      
      // Use the smallest font size that works for all cards
      globalOptimalSize = Math.min(globalOptimalSize, cardOptimalSize);
    }
    
    // Ensure minimum readability - higher minimum for horizontal cards
    globalOptimalSize = Math.max(12, Math.min(globalOptimalSize, 20));
    
    // Apply the global optimal size to all cards
    for (let card of this.cards) {
      card.optimalFontSize = globalOptimalSize;
    }
  }

  // Draw individual card
  drawCard(ctx, card) {
    ctx.save();
    
    // Define corner radius
    const cornerRadius = 20;
    
    // Always use gradient background (no color change on click)
    if (card.gradient) {
      const centerX = card.x + card.width / 2;
      const centerY = card.y + card.height / 2;
      const radius = Math.min(card.width, card.height) / 2;
      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,           // Inner circle (center)
        centerX, centerY, radius       // Outer circle
      );
      gradient.addColorStop(0, card.gradient.start);  // 0% color
      gradient.addColorStop(1, card.gradient.end);    // 100% color
      
      ctx.fillStyle = gradient;
    } else {
      // Fallback solid color
      ctx.fillStyle = '#FFFFFF';
    }
    
    // Draw rounded rectangle for card background
    this.drawRoundedRect(ctx, card.x, card.y, card.width, card.height, cornerRadius);
    ctx.fill();
    
    // Draw border with rounded corners
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    this.drawRoundedRect(ctx, card.x, card.y, card.width, card.height, cornerRadius);
    ctx.stroke();
    
    // Card text (only show when game is playing)
    if (this.gameState === 'playing' && card.word) {
      this.drawCardText(ctx, card);
    }
    
    ctx.restore();
  }

  // Improved text drawing function
  drawCardText(ctx, card) {
    const word = card.word;
    const padding = 30; // More horizontal padding for wide cards
    const maxWidth = card.width - padding;
    
    // Use the globally calculated optimal font size
    const fontSize = card.optimalFontSize || 16;
    ctx.font = `${fontSize}px Arial`;
    
    // Generate text lines using the optimal font size
    const lines = this.smartWrapText(ctx, word, maxWidth);
    
    // Calculate positioning - center vertically in the short card height
    const lineHeight = fontSize + 2;
    const totalTextHeight = lines.length * lineHeight;
    const startY = card.y + (card.height - totalTextHeight) / 2 + lineHeight / 2;
    
    // Draw text directly on card background (no background for text)
    ctx.fillStyle = '#000000';
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    lines.forEach((line, index) => {
      const y = startY + (index * lineHeight);
      ctx.fillText(line, card.x + card.width / 2, y);
    });
  }

  // Smart text wrapping that handles long words better
  smartWrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    
    for (let word of words) {
      // Check if single word is too long
      if (ctx.measureText(word).width > maxWidth) {
        // For very long words, try to break at syllable boundaries
        const chunks = this.breakLongWordIntelligently(ctx, word, maxWidth);
        lines.push(...chunks);
      } else {
        // Normal word wrapping
        if (lines.length === 0) {
          lines.push(word);
        } else {
          const testLine = lines[lines.length - 1] + ' ' + word;
          if (ctx.measureText(testLine).width <= maxWidth) {
            lines[lines.length - 1] = testLine;
          } else {
            lines.push(word);
          }
        }
      }
    }
    
    return lines;
  }

  // Break long words more intelligently, trying to find syllable boundaries
  breakLongWordIntelligently(ctx, word, maxWidth) {
    const chunks = [];
    
    // Common syllable patterns in English
    const syllablePatterns = [
      /([bcdfghjklmnpqrstvwxyz][aeiou])/gi, // consonant + vowel
      /([aeiou][bcdfghjklmnpqrstvwxyz])/gi, // vowel + consonant
      /(tion|sion|ing|ed|er|est|ly|ness)/gi // common suffixes
    ];
    
    // Try to find natural break points
    let breakPoints = [0];
    
    for (let pattern of syllablePatterns) {
      let match;
      while ((match = pattern.exec(word)) !== null) {
        const breakPoint = match.index + match[0].length;
        if (breakPoint > 0 && breakPoint < word.length) {
          breakPoints.push(breakPoint);
        }
      }
    }
    
    // Remove duplicates and sort
    breakPoints = [...new Set(breakPoints)].sort((a, b) => a - b);
    breakPoints.push(word.length);
    
    // Try to create chunks using break points
    let currentChunk = '';
    let lastBreakPoint = 0;
    
    for (let i = 1; i < breakPoints.length; i++) {
      const segment = word.substring(lastBreakPoint, breakPoints[i]);
      const testChunk = currentChunk + segment;
      
      if (ctx.measureText(testChunk).width <= maxWidth) {
        currentChunk = testChunk;
      } else {
        // Current chunk doesn't fit, save what we have
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = segment;
        } else {
          // Even the segment alone is too long, break it character by character
          const charChunks = this.breakLongWord(ctx, segment, maxWidth);
          chunks.push(...charChunks);
          currentChunk = '';
        }
      }
      lastBreakPoint = breakPoints[i];
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    // Fallback to character-by-character if no chunks were created
    if (chunks.length === 0) {
      return this.breakLongWord(ctx, word, maxWidth);
    }
    
    return chunks;
  }

  // Break long words into manageable chunks
  breakLongWord(ctx, word, maxWidth) {
    const chunks = [];
    let currentChunk = '';
    
    for (let i = 0; i < word.length; i++) {
      const testChunk = currentChunk + word[i];
      
      if (ctx.measureText(testChunk).width <= maxWidth) {
        currentChunk = testChunk;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = word[i];
        } else {
          // Even single character is too wide, force it
          chunks.push(word[i]);
          currentChunk = '';
        }
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }

  // Word wrapping utility
  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  // Draw level indicator
  drawLevelIndicator(ctx) {
    ctx.save();
    ctx.font = '18px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    
    const text = `Bàn ${this.currentLevel}/4`;
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
    const progress = this.currentLevel / 4;
    const progressWidth = barWidth * progress;
    
    // Create gradient for progress bar
    const gradient = ctx.createLinearGradient(barX, barY, barX + progressWidth, barY);
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(1, '#66BB6A');
    
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
      ctx.strokeStyle = i <= this.currentLevel ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(indicatorX, barY - 2);
      ctx.lineTo(indicatorX, barY + barHeight + 2);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  // Utility function to shuffle array
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Reset game
  reset() {
    this.isActive = false;
    this.gameState = 'initial';
    this.currentLevel = 1;
    this.cards = [];
    this.generateInitialCards();
  }

  // Get current progress for display
  getProgress() {
    if (this.gameState === 'initial') {
      return 'Sẵn sàng bắt đầu';
    } else if (this.gameState === 'playing') {
      return `Bàn ${this.currentLevel}/4`;
    } else if (this.gameState === 'completed') {
      return 'Hoàn thành tất cả!';
    }
    return '';
  }

  // Convert text to Title Case (first letter uppercase, rest lowercase)
  toTitleCase(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  // Helper method to draw rounded rectangle
  drawRoundedRect(ctx, x, y, width, height, radius) {
    // Ensure radius doesn't exceed half of width or height
    radius = Math.min(radius, width / 2, height / 2);
    
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
}

// Export for use in main game
window.WordHunterManager = WordHunterManager;
