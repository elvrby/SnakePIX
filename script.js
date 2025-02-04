document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('start-game');
    const restartButton = document.getElementById('restart-game');
    const scoreDisplay = document.getElementById('score-display');
    const highestScoreDisplay = document.getElementById('highest-score');
    const finalScoreDisplay = document.getElementById('final-score');
    const gameContainer = document.getElementById('game-container');
    const mainMenu = document.getElementById('main-menu');
    const gameOverModal = document.getElementById('game-over-modal');

    // Game settings
    const gridSize = 20;
    const tileCount = 30;
    canvas.width = gridSize * tileCount;
    canvas.height = gridSize * tileCount;

    let snake = [];
    let food = {};
    let dx = gridSize;
    let dy = 0;
    let score = 0;
    let highestScore = localStorage.getItem('snakeHighScore') || 0;
    let gameLoop;
    let currentDirection = 'right';
    let nextDirection = 'right';

    highestScoreDisplay.textContent = `Highest Score: ${highestScore}`;

    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);

    document.addEventListener('keydown', changeDirection);

    function startGame() {
        mainMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        resetGame();
        gameLoop = setInterval(update, 100);
    }

    function resetGame() {
        snake = [
            { x: 5 * gridSize, y: 5 * gridSize },
            { x: 4 * gridSize, y: 5 * gridSize },
            { x: 3 * gridSize, y: 5 * gridSize }
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
        // Prevent food from spawning on snake
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

        // Check collision with walls
        if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
            gameOver();
            return;
        }

        // Check collision with self
        if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            gameOver();
            return;
        }

        snake.unshift(head);

        // Check if food is eaten
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
        // Clear canvas
        ctx.fillStyle = '#2d2d2d';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw snake
        ctx.fillStyle = '#4CAF50';
        snake.forEach((segment, index) => {
            ctx.fillRect(segment.x, segment.y, gridSize - 2, gridSize - 2);
            if (index === 0) {
                ctx.fillStyle = '#45a049'; // Darker head color
            }
        });

        // Draw food
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(food.x, food.y, gridSize - 2, gridSize - 2);
    }

    function changeDirection(e) {
        const key = e.key;
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

        // Prevent reverse direction
        if (
            (currentDirection === 'up' && newDirection === 'down') ||
            (currentDirection === 'down' && newDirection === 'up') ||
            (currentDirection === 'left' && newDirection === 'right') ||
            (currentDirection === 'right' && newDirection === 'left')
        ) {
            return;
        }

        nextDirection = newDirection;

        switch (newDirection) {
            case 'up':
                dx = 0;
                dy = -gridSize;
                break;
            case 'down':
                dx = 0;
                dy = gridSize;
                break;
            case 'left':
                dx = -gridSize;
                dy = 0;
                break;
            case 'right':
                dx = gridSize;
                dy = 0;
                break;
        }
    }

    function gameOver() {
        clearInterval(gameLoop);
        finalScoreDisplay.textContent = `Your Score: ${score}`;
        gameOverModal.classList.remove('hidden');
    }

    function restartGame() {
        gameOverModal.classList.add('hidden');
        resetGame();
        gameLoop = setInterval(update, 100);
    }

    // Kustomisasi
    // Tambahkan variabel untuk tema warna
let currentTheme = {
    snakeHead: '#45a049',
    snakeBody: '#4CAF50',
    food: '#ff4444'
};

// Daftar tema warna
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

// Tambahkan event listener untuk pemilihan warna
document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', function() {
        // Hapus class selected dari semua option
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Tambahkan class selected ke option yang dipilih
        this.classList.add('selected');
        
        // Update tema yang dipilih
        const theme = this.dataset.theme;
        currentTheme = colorThemes[theme];
        
        // Simpan preferensi ke localStorage
        localStorage.setItem('snakeColorTheme', theme);
    });
});

// Load tema yang disimpan
window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('snakeColorTheme') || 'default';
    const themeButton = document.querySelector(`[data-theme="${savedTheme}"]`);
    themeButton.click();
});

// Modifikasi fungsi draw
function draw() {
    // Clear canvas
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((segment, index) => {
        if(index === 0) {
            ctx.fillStyle = currentTheme.snakeHead;
        } else {
            ctx.fillStyle = currentTheme.snakeBody;
        }
        ctx.fillRect(segment.x, segment.y, gridSize - 2, gridSize - 2);
    });

    // Draw food
    ctx.fillStyle = currentTheme.food;
    ctx.fillRect(food.x, food.y, gridSize - 2, gridSize - 2);
}


});