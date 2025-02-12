document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('start-game');
    const restartButton = document.getElementById('restart-game');
    const mainMenuBtn = document.getElementById('main-menu-btn');
    const scoreDisplay = document.getElementById('score-display');
    const highestScoreDisplay = document.getElementById('highest-score');
    const finalScoreDisplay = document.getElementById('final-score');
    const gameContainer = document.getElementById('game-container');
    const mainMenu = document.getElementById('main-menu');
    const gameOverModal = document.getElementById('game-over-modal');
    const mobileControls = document.getElementById('mobile-controls');

    // Game variables
    let snake = [];
    let food = {};
    let dx = 0;
    let dy = 0;
    let score = 0;
    let highestScore = localStorage.getItem('snakeHighScore') || 0;
    let gameLoop;
    let currentDirection = 'right';
    let nextDirection = 'right';
    let gridSize;
    let tileCount;

    // Color themes
    let currentTheme = {
        snakeHead: '#45a049',
        snakeBody: '#4CAF50',
        food: '#ff4444'
    };

    const colorThemes = {
        default: {
            snakeHead: '#45a049',
            snakeBody: '#4CAF50',
            food: '#ff4444'
        },
        'red-yellow': {
            snakeHead: '#cc0000',
            snakeBody: '#ff4444',
            food: '#ffd700'
        },
        'white-red': {
            snakeHead: '#dddddd',
            snakeBody: '#ffffff',
            food: '#ff4444'
        }
    };

    // Initialize game
    function calculateGridSize() {
        const screenSize = Math.min(window.innerWidth, window.innerHeight);
        if(window.innerWidth <= 768) {
            tileCount = 15;
            gridSize = Math.floor((screenSize * 0.95) / tileCount);
        } else {
            tileCount = 30;
            gridSize = 20;
        }
        
        canvas.width = gridSize * tileCount;
        canvas.height = gridSize * tileCount;
    }

    calculateGridSize();
    window.addEventListener('resize', calculateGridSize);

    // Event listeners
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    mainMenuBtn.addEventListener('click', returnToMainMenu);
    document.addEventListener('keydown', changeDirection);

    // Color selection
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            const theme = this.dataset.theme;
            currentTheme = colorThemes[theme];
            localStorage.setItem('snakeColorTheme', theme);
        });
    });

    // Load saved theme
    window.addEventListener('load', () => {
        const savedTheme = localStorage.getItem('snakeColorTheme') || 'default';
        const themeButton = document.querySelector(`[data-theme="${savedTheme}"]`);
        if(themeButton) {
            themeButton.click();
        }
        highestScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        highestScoreDisplay.textContent = `Highest Score: ${highestScore}`;
    });

    // Mobile controls
    document.querySelectorAll('.control-btn').forEach(button => {
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleMobileControl(button.classList[1]);
        });
    });

    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, false);

    canvas.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        if(Math.abs(dx) > Math.abs(dy)) {
            handleMobileControl(dx > 0 ? 'right' : 'left');
        } else {
            handleMobileControl(dy > 0 ? 'down' : 'up');
        }
        e.preventDefault();
    }, false);

    // Game functions
    function startGame() {
        mainMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        if(window.innerWidth <= 768) mobileControls.classList.remove('hidden');
        resetGame();
        const gameSpeed = window.innerWidth <= 768 ? 150 : 100; // 150ms untuk mobile
        gameLoop = setInterval(update, gameSpeed);
    }

    function resetGame() {
        snake = [
            { x: Math.floor(tileCount/2) * gridSize, y: Math.floor(tileCount/2) * gridSize },
            { x: (Math.floor(tileCount/2) - 1) * gridSize, y: Math.floor(tileCount/2) * gridSize },
            { x: (Math.floor(tileCount/2) - 2) * gridSize, y: Math.floor(tileCount/2) * gridSize }
        ];
        spawnFood();
        score = 0;
        currentDirection = 'right';
        nextDirection = 'right';
        dx = gridSize;
        dy = 0;
        scoreDisplay.textContent = `Score: ${score}`;
    }

    function spawnFood() {
        food = {
            x: Math.floor(Math.random() * tileCount) * gridSize,
            y: Math.floor(Math.random() * tileCount) * gridSize
        };
        while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
            food = {
                x: Math.floor(Math.random() * tileCount) * gridSize,
                y: Math.floor(Math.random() * tileCount) * gridSize
            };
        }
    }

    function update() {
        currentDirection = nextDirection;
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height ||
            snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            gameOver();
            return;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreDisplay.textContent = `Score: ${score}`;
            if (score > highestScore) {
                highestScore = score;
                localStorage.setItem('snakeHighScore', highestScore);
                highestScoreDisplay.textContent = `Highest Score: ${highestScore}`;
            }
            spawnFood();
        } else {
            snake.pop();
        }

        draw();
    }

    function draw() {
        ctx.fillStyle = '#2d2d2d';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? currentTheme.snakeHead : currentTheme.snakeBody;
            ctx.fillRect(segment.x, segment.y, gridSize - 2, gridSize - 2);
        });

        ctx.fillStyle = currentTheme.food;
        ctx.fillRect(food.x, food.y, gridSize - 2, gridSize - 2);
    }

    function changeDirection(e) {
        const key = e.key || e;
        const directions = {
            ArrowUp: 'up',
            ArrowDown: 'down',
            ArrowLeft: 'left',
            ArrowRight: 'right',
            w: 'up',
            s: 'down',
            a: 'left',
            d: 'right'
        };

        const newDirection = directions[key];
        if (!newDirection) return;

        if (
            (currentDirection === 'up' && newDirection === 'down') ||
            (currentDirection === 'down' && newDirection === 'up') ||
            (currentDirection === 'left' && newDirection === 'right') ||
            (currentDirection === 'right' && newDirection === 'left')
        ) return;

        nextDirection = newDirection;

        switch (newDirection) {
            case 'up': dx = 0; dy = -gridSize; break;
            case 'down': dx = 0; dy = gridSize; break;
            case 'left': dx = -gridSize; dy = 0; break;
            case 'right': dx = gridSize; dy = 0; break;
        }
    }

    function handleMobileControl(direction) {
        const keyMap = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
        changeDirection(keyMap[direction]);
    }

    function gameOver() {
        clearInterval(gameLoop);
        finalScoreDisplay.textContent = `Your Score: ${score}`;
        gameOverModal.classList.remove('hidden');
    }

    function restartGame() {
        gameOverModal.classList.add('hidden');
        resetGame();
        
        // Atur kecepatan berbeda untuk mobile
        const gameSpeed = window.innerWidth <= 768 ? 150 : 100;
        gameLoop = setInterval(update, gameSpeed);
    }

    function returnToMainMenu() {
        gameOverModal.classList.add('hidden');
        highestScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        highestScoreDisplay.textContent = `Highest Score: ${highestScore}`;
        mainMenu.classList.remove('hidden');
        gameContainer.classList.add('hidden');
        clearInterval(gameLoop);
        resetGame();
    }
});