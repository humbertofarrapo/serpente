// Obtendo o elemento canvas e seu contexto
const cvs = document.getElementById("snake");
const ctx = cvs.getContext("2d");
const boxSize = 32; // Tamanho de cada célula na grade do jogo

// Função para carregar uma imagem
function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

// Função para carregar um áudio
function loadAudio(src) {
    const audio = new Audio();
    audio.src = src;
    return audio;
}

// Pré-carregando imagens e áudio
const images = {
    ground: loadImage("assets/image/background.jpg"),
    food: loadImage("assets/image/food.png"),
    snakeHead: loadImage("assets/image/snakeHead.jpg"),
    snakeBody: loadImage("assets/image/snakeBody.jpg")
};

const sounds = {
    eat: loadAudio("assets/audio/eat.mp3")
};

// Inicialização de variáveis do jogo
let snake = [{ x: 9 * boxSize, y: 10 * boxSize }];
let food = generateFoodPosition();
let score = 0;
let highScore = 0;
let level = getLevel();
let d;

// Adicionando evento de teclado para controlar a direção da cobra
document.addEventListener("keydown", direction);

// Função para lidar com o evento de teclado
function direction(event) {
    event.preventDefault(); // Evita que o movimento da tela seja alterado pelas teclas
    const keyMap = { 37: "LEFT", 38: "UP", 39: "RIGHT", 40: "DOWN" };
    const newDirection = keyMap[event.keyCode];
    if (newDirection && d !== oppositeDirection(newDirection)) {
        d = newDirection;
    }
}

// Função auxiliar para obter a direção oposta para evitar que a cobra volte sobre si mesma
function oppositeDirection(dir) {
    const oppositeMap = { LEFT: "RIGHT", UP: "DOWN", RIGHT: "LEFT", DOWN: "UP" };
    return oppositeMap[dir];
}

// Função para verificar colisões com a própria cobra
function collision(head, array) {
    return array.some(segment => head.x === segment.x && head.y === segment.y);
}

// Função para gerar uma posição aleatória para a comida
function generateFoodPosition() {
    return {
        x: Math.floor(Math.random() * 17 + 1) * boxSize,
        y: Math.floor(Math.random() * 15 + 3) * boxSize
    };
}

// Função para obter o nível de dificuldade do jogo
function getLevel() {
    const levels = { easy: 150, medium: 100, hard: 70 };
    const storedLevel = JSON.parse(localStorage.getItem("snakeLevel"));
    return levels[storedLevel] || levels.easy;
}

// Função para atualizar a pontuação e verificar se há um novo recorde
function updateScore() {
    score++;
    sounds.eat.play();
    if (score > highScore) {
        localStorage.setItem("snakeHighScore", JSON.stringify(score));
    }
    const levelKey = `snakeHighScore${level}`;
    if (!localStorage.getItem(levelKey) || score > localStorage.getItem(levelKey)) {
        localStorage.setItem(levelKey, JSON.stringify(score));
    }
}

// Função para resetar a pontuação mais alta
function resetHighScore() {
    localStorage.setItem("snakeHighScore", JSON.stringify(0));
    Object.keys(levels).forEach(level => localStorage.setItem(`snakeHighScore${levels[level]}`, JSON.stringify(0)));
}

// Função principal para desenhar o jogo
function draw() {
    ctx.drawImage(images.ground, 0, 0);
    ctx.fillStyle = "#2d572c";
    ctx.fillRect(0, 0, 19 * boxSize, 3 * boxSize);
    ctx.fillRect(0, 0, boxSize, 19 * boxSize);
    ctx.fillRect(18 * boxSize, 0, boxSize, 19 * boxSize);
    ctx.fillRect(0, 18 * boxSize, 19 * boxSize, boxSize);

    snake.forEach((segment, index) => {
        const img = index === 0 ? images.snakeHead : images.snakeBody;
        ctx.drawImage(img, segment.x, segment.y, boxSize, boxSize);
    });

    ctx.drawImage(images.food, food.x, food.y, boxSize, boxSize);

    const snakeX = snake[0].x + (d === "LEFT" ? -boxSize : d === "RIGHT" ? boxSize : 0);
    const snakeY = snake[0].y + (d === "UP" ? -boxSize : d === "DOWN" ? boxSize : 0);

    if (snakeX === food.x && snakeY === food.y) {
        updateScore();
        food = generateFoodPosition();
    } else {
        snake.pop();
    }

    const newHead = { x: snakeX, y: snakeY };

    if (snakeX < boxSize || snakeX > 17 * boxSize || snakeY < 3 * boxSize || snakeY > 17 * boxSize || collision(newHead, snake)) {
        clearInterval(game);
        location.assign("index.html");
    }

    snake.unshift(newHead);

    ctx.fillStyle = "white";
    ctx.font = "30px helvetica";
    ctx.fillText(score, 2 * boxSize, 2 * boxSize);
    ctx.fillText("Alimente a cobra", 6 * boxSize, 2 * boxSize);
}

// Inicia o loop do jogo com base no nível de dificuldade
const game = setInterval(draw, level);
