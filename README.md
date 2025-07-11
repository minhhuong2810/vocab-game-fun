# 🎮 Vocab Fun - Interactive Vocabulary Learning Game

An engaging HTML5 Canvas-based vocabulary learning game with three distinct game modes to make learning new words fun and interactive.

## 🌟 Features

### 🎯 Three Game Modes
1. **Word Shooter** - Shoot letters to spell out vocabulary words
2. **Word Hunter** - Hunt for correct vocabulary cards among distractors  
3. **Word Hearo** - Listen and type the vocabulary words you hear

### 🎵 Audio Features
- Background music for each game mode
- Text-to-speech pronunciation for vocabulary words
- Sound effects for correct/incorrect answers
- Audio controls with visual feedback

### 🎨 User Interface
- Modern glass-effect popups with animations
- Responsive design with flexible canvas area
- Visual feedback for all interactions
- Spelling error detection with suggestions

### 📚 Vocabulary Management
- Input fields for vocabulary words and meanings
- Toggle visibility for vocabulary (show/hide)
- Clear function to reset inputs and game state
- Automatic vocabulary display on word completion

## 🚀 Getting Started

### Prerequisites
- Modern web browser with HTML5 Canvas support
- Local web server (for audio features to work properly)

### Installation

1. **Clone or download** the project files
2. **Start a local server**:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js
   npx serve .
   ```
3. **Open browser** and navigate to `http://localhost:8000`

### Quick Start
1. Enter a vocabulary word and its meaning in the input fields
2. Select a game mode by clicking the play button (cycles through modes)
3. Click play again to start the selected game
4. Enjoy learning!

## 🎮 Game Modes

### 🔫 Word Shooter
- **Objective**: Shoot letters in the correct order to spell the vocabulary word
- **Controls**: Click on falling letters or use keyboard
- **Features**: 
  - Animated spaceship shooter
  - Falling letter targets
  - Progressive difficulty
  - Visual feedback for hits/misses

### 🃏 Word Hunter  
- **Objective**: Find and click the correct vocabulary card among distractors
- **Features**:
  - Colorful gradient cards with various spellings
  - Balloon-style animated cards
  - Multiple rounds with increasing difficulty
  - Timer-based gameplay

### 🎧 Word Hearo
- **Objective**: Listen to the pronunciation and type the correct word
- **Features**:
  - Text-to-speech audio playback
  - Real-time typing with visual feedback
  - Multiple rounds (4 rounds per game)
  - Canvas-based input display
  - Automatic vocabulary hiding during gameplay

## 🎛️ Controls

### Header Controls
- **Next (▶️)**: Cycle through vocabulary words
- **Play/Pause (⏯️)**: Start/stop games and cycle game modes
- **Eye (👁️)**: Toggle vocabulary visibility  
- **Microphone (🎤)**: Pronounce current vocabulary word
- **Delete (🗑️)**: Clear inputs and reset game state

### Game Area Controls  
- **Sound Toggle**: Enable/disable game audio (top-left corner)
- **Canvas Interaction**: Click, type, or use keyboard depending on game mode

## 🔧 Technical Details

### Architecture
- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Graphics**: HTML5 Canvas API
- **Audio**: Web Audio API with autoplay policy compliance
- **Styling**: CSS3 with modern effects (backdrop-filter, gradients, animations)

### File Structure
```
📁 Vocab Fun/
├── 📄 index.html              # Main HTML structure
├── 📄 style.css               # Main stylesheet  
├── 📄 congrats_overlay.css    # Popup styling
├── 📄 game.js                 # Core game logic
├── 📄 word_hunter_manager.js  # Word Hunter game logic
├── 📄 word_hearo_manager.js   # Word Hearo game logic
├── 📄 background_loader.js    # Background graphics
├── 📄 balloon_loader.js       # Balloon animations
├── 📄 spaceship_loader.js     # Spaceship graphics
├── 📁 sound/                  # Audio files
│   ├── 🔊 word_shooter_music.wav
│   ├── 🔊 word_hunter_music.mp3  
│   ├── 🔊 word_hunter_correct.mp3
│   ├── 🔊 word_hunter_wrong.mp3
│   ├── 🔊 explosion.wav
│   └── 🔊 laser.ogg
└── 📁 assets/                 # SVG icons and graphics
    ├── 🖼️ logo.png
    ├── 🖼️ spaceship.svg
    ├── 🖼️ balloon*.svg
    ├── 🖼️ congratulation*.svg
    └── 🖼️ [various UI icons].svg
```

### Browser Support
- ✅ Chrome 60+
- ✅ Firefox 55+  
- ✅ Safari 11+
- ✅ Edge 79+

## ⚙️ Configuration

### Audio Settings
- Background music can be toggled on/off
- Automatic handling of browser autoplay policies
- Fallback for browsers without speech synthesis

### Game Difficulty  
- Word Hunter: Configurable number of distractor cards
- Word Hearo: Adjustable number of rounds (default: 4)
- Word Shooter: Dynamic letter spawn rate

## 🎨 Customization

### Styling
- Modify `style.css` for layout and colors
- Update `congrats_overlay.css` for popup appearances  
- SVG assets can be replaced for different themes

### Game Logic
- Extend game modes in respective manager files
- Add new vocabulary sources in `game.js`
- Customize difficulty settings in game managers

## 🛠️ Development

### Code Structure
- **Modular Design**: Separate managers for each game mode
- **Event-Driven**: Comprehensive event handling for user interactions
- **Responsive**: Flexible layout adapting to different screen sizes
- **Accessible**: Keyboard navigation and screen reader support

### Key Classes and Functions
- `AudioManager`: Handles all audio operations
- `WordHunterManager`: Manages Word Hunter game logic
- `WordHearoManager`: Manages Word Hearo game logic  
- `clearInputs()`: Resets game state and inputs
- `toggleVocabVisibility()`: Controls vocabulary display
- `startOrPauseGame()`: Main game control function

## 🐛 Troubleshooting

### Common Issues

**Audio not playing:**
- Ensure you're running on a local server (not file:// protocol)
- Check browser autoplay policies
- Verify audio files are accessible

**Game not responding:**
- Check browser console for JavaScript errors
- Ensure all asset files are loaded properly
- Verify browser compatibility

**Canvas rendering issues:**
- Check if hardware acceleration is enabled
- Try different browsers
- Verify Canvas API support

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly across different browsers
5. Submit a pull request

## 📞 Support

For questions, issues, or suggestions, please:
- Open an issue on the repository
- Check the troubleshooting section above
- Review browser console for error messages

---

**Happy Learning! 🎓✨**

*Built with ❤️ for vocabulary learners everywhere*
