// Constants and Globals (TILE_SIZE and GRAVITY moved to LevelData.js)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State Enum
const GameState = {
    START: 0,
    PLAYING: 1,
    PAUSED: 2,
    LEVEL_SELECT: 3,
    LEVEL_COMPLETE: 4,
    GAME_OVER: 5,
    VICTORY: 6
};

let currentState = GameState.START;
let score = 0;
let currentLevelIndex = 0;
// Track progress (save/load from localStorage)
let unlockedLevelIndex = parseInt(localStorage.getItem('coinQuestProgress')) || 0;

let player;
let currentLevel;

// Device Detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Input Handling
const keys = {
    left: false,
    right: false,
    up: false
};

window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
    if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') keys.up = true;
    if (e.code === 'Escape' && currentState === GameState.PLAYING) switchState(GameState.PAUSED);
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') keys.up = false;
});

// UI Elements
const uiElements = {
    hud: document.getElementById('hud'),
    scoreDisplay: document.getElementById('scoreDisplay'),
    levelDisplay: document.getElementById('levelDisplay'),
    
    startScreen: document.getElementById('start-screen'),
    levelSelectScreen: document.getElementById('level-select-screen'),
    levelsGrid: document.getElementById('levels-grid'),
    settingsScreen: document.getElementById('settings-screen'),
    gameOverScreen: document.getElementById('game-over-screen'),
    levelCompleteScreen: document.getElementById('level-complete-screen'),
    victoryScreen: document.getElementById('victory-screen'),
    
    finalScoreDisplay: document.getElementById('finalScoreDisplay'),
    victoryScoreDisplay: document.getElementById('victoryScoreDisplay'),
    
    startBtn: document.getElementById('startBtn'),
    levelSelectBtn: document.getElementById('levelSelectBtn'),
    backToMenuBtn: document.getElementById('backToMenuBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    resumeBtn: document.getElementById('resumeBtn'),
    restartLevelBtn: document.getElementById('restartLevelBtn'),
    quitGameBtn: document.getElementById('quitGameBtn'),
    restartBtn: document.getElementById('restartBtn'),
    nextLevelBtn: document.getElementById('nextLevelBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),

    joystickContainer: document.getElementById('joystick-container'),
    joystickKnob: document.getElementById('joystick-knob'),
    jumpBtnMobile: document.getElementById('jump-btn-mobile')
};

// Level Select Logic
function populateLevelSelect() {
    uiElements.levelsGrid.innerHTML = '';
    levelsData.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        if (index > unlockedLevelIndex) {
            btn.classList.add('locked');
            btn.innerHTML = index + 1;
        } else {
            btn.innerHTML = index + 1;
            btn.addEventListener('click', () => {
                currentLevelIndex = index;
                startLevel();
            });
        }
        uiElements.levelsGrid.appendChild(btn);
    });
}

// Mobile Controls Logic
if (isMobile) {
    uiElements.joystickContainer.style.display = 'block';
    uiElements.jumpBtnMobile.style.display = 'flex';
    
    let joystickActive = false;
    const centerX = 60; // relative to container
    const centerY = 60;
    
    uiElements.joystickContainer.addEventListener('touchstart', (e) => {
        joystickActive = true;
        handleJoystick(e.touches[0]);
    });
    
    uiElements.joystickContainer.addEventListener('touchmove', (e) => {
        if (joystickActive) handleJoystick(e.touches[0]);
    });
    
    uiElements.joystickContainer.addEventListener('touchend', () => {
        joystickActive = false;
        keys.left = false;
        keys.right = false;
        uiElements.joystickKnob.style.left = '50%';
        uiElements.joystickKnob.style.top = '50%';
    });
    
    function handleJoystick(touch) {
        const rect = uiElements.joystickContainer.getBoundingClientRect();
        const x = touch.clientX - rect.left - centerX;
        const y = touch.clientY - rect.top - centerY;
        const dist = Math.sqrt(x*x + y*y);
        const maxDist = 50;
        
        const angle = Math.atan2(y, x);
        const moveX = Math.cos(angle) * Math.min(dist, maxDist);
        const moveY = Math.sin(angle) * Math.min(dist, maxDist);
        
        uiElements.joystickKnob.style.left = (centerX + moveX) + 'px';
        uiElements.joystickKnob.style.top = (centerY + moveY) + 'px';
        
        keys.left = x < -20;
        keys.right = x > 20;
    }
    
    uiElements.jumpBtnMobile.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.up = true;
    });
    uiElements.jumpBtnMobile.addEventListener('touchend', () => {
        keys.up = false;
    });
}

// Main Game Loop
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (currentState === GameState.PLAYING) {
        update(deltaTime);
    }
    draw();

    requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
    player.update(deltaTime, currentLevel);
    currentLevel.update(deltaTime, player);
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (currentState === GameState.PLAYING || currentState === GameState.PAUSED) {
        currentLevel.draw(ctx);
        player.draw(ctx);
    }
}

// State Management
function switchState(newState) {
    currentState = newState;
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
    uiElements.hud.classList.add('hidden');
    uiElements.pauseBtn.classList.add('hidden');

    switch (newState) {
        case GameState.START:
            uiElements.startScreen.classList.remove('hidden');
            break;
        case GameState.LEVEL_SELECT:
            populateLevelSelect();
            uiElements.levelSelectScreen.classList.remove('hidden');
            break;
        case GameState.PLAYING:
            uiElements.hud.classList.remove('hidden');
            uiElements.pauseBtn.classList.remove('hidden');
            break;
        case GameState.PAUSED:
            uiElements.settingsScreen.classList.remove('hidden');
            break;
        case GameState.LEVEL_COMPLETE:
            // Unlock next level
            if (currentLevelIndex === unlockedLevelIndex && unlockedLevelIndex < levelsData.length - 1) {
                unlockedLevelIndex++;
                localStorage.setItem('coinQuestProgress', unlockedLevelIndex);
            }
            uiElements.levelCompleteScreen.classList.remove('hidden');
            break;
        case GameState.GAME_OVER:
            uiElements.finalScoreDisplay.innerText = score;
            uiElements.gameOverScreen.classList.remove('hidden');
            break;
        case GameState.VICTORY:
            // Unlock last level if finishing 9
            if (currentLevelIndex === unlockedLevelIndex && unlockedLevelIndex < levelsData.length - 1) {
                unlockedLevelIndex++;
                localStorage.setItem('coinQuestProgress', unlockedLevelIndex);
            }
            uiElements.victoryScoreDisplay.innerText = score;
            uiElements.victoryScreen.classList.remove('hidden');
            break;
    }
}

// Button Listeners
uiElements.startBtn.addEventListener('click', startGame);
uiElements.levelSelectBtn.addEventListener('click', () => switchState(GameState.LEVEL_SELECT));
uiElements.backToMenuBtn.addEventListener('click', () => switchState(GameState.START));
uiElements.pauseBtn.addEventListener('click', () => switchState(GameState.PAUSED));
uiElements.resumeBtn.addEventListener('click', () => switchState(GameState.PLAYING));
uiElements.restartLevelBtn.addEventListener('click', restartGame);
uiElements.quitGameBtn.addEventListener('click', () => switchState(GameState.START));
uiElements.restartBtn.addEventListener('click', restartGame);
uiElements.nextLevelBtn.addEventListener('click', loadNextLevel);
uiElements.playAgainBtn.addEventListener('click', resetGameFull);

function startGame() {
    score = 0;
    // Don't override currentLevelIndex, keep it for progress or start at 0 if first time
    currentLevelIndex = 0; 
    startLevel();
}

function startLevel() {
    loadLevel(currentLevelIndex);
    switchState(GameState.PLAYING);
}

function restartGame() {
    startLevel();
}

function loadNextLevel() {
    currentLevelIndex++;
    if (currentLevelIndex >= levelsData.length) {
        switchState(GameState.VICTORY);
        return;
    }
    startLevel();
}

function resetGameFull() {
    startGame();
}

function loadLevel(index) {
    const data = levelsData[index];
    currentLevel = new Level(data);
    player = new Player(currentLevel.startX, currentLevel.startY);
    updateHUD();
}

function updateHUD() {
    uiElements.scoreDisplay.innerText = score;
    uiElements.levelDisplay.innerText = currentLevelIndex + 1;
}

// Initialize
requestAnimationFrame(gameLoop);
switchState(GameState.START);
