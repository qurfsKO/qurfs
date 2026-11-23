
const buttons = document.querySelectorAll(".play-button");
const toast = document.querySelector("#toast");

document.querySelector("#year").textContent =
    new Date().getFullYear();

// Reaction Test elements
const gameScreen = document.querySelector("#reaction-screen");
const gameArea = document.querySelector("#reaction-area");
const gameInstruction = document.querySelector("#reaction-instruction");
const gameTitle = document.querySelector("#reaction-title");
const gameMessage = document.querySelector("#reaction-message");
const gameStart = document.querySelector("#reaction-start");
const gameResult = document.querySelector("#reaction-result");
const closeGame = document.querySelector("#close-game");

let gameState = "idle";
let startTime = 0;
let waitTimeout;
let bestScore = null;

// Open games
buttons.forEach(function (button) {
    button.addEventListener("click", function () {
        const gameName = button.dataset.game;

        if (gameName === "Reaction Test") {
            gameScreen.classList.remove("memory-mode", "tile-mode");
            gameScreen.classList.add("active");
            resetGame();

        } else if (gameName === "Memory Match") {
            gameScreen.classList.remove("tile-mode");
            gameScreen.classList.add("active", "memory-mode");
            startMemoryGame();

        } else if (gameName === "2048") {
            gameScreen.classList.remove("memory-mode");
            gameScreen.classList.add("active", "tile-mode");

        } else {
            showToast(gameName + " is coming soon!");
        }
    });
});


// Start the reaction game
gameStart.addEventListener("click", function () {
    startGame();
});

function startGame() {
    clearTimeout(waitTimeout);

    gameState = "waiting";

    gameArea.className = "reaction-area waiting";
    gameInstruction.textContent = "Wait for green...";
    gameMessage.textContent = "Don't click too early!";
    gameResult.textContent = "";
    gameStart.textContent = "Wait...";
    gameStart.disabled = true;

    const randomDelay = Math.random() * 3000 + 1500;

    waitTimeout = setTimeout(function () {
        gameState = "ready";

        gameArea.className = "reaction-area ready";
        gameInstruction.textContent = "CLICK NOW!";
        gameMessage.textContent = "Quick! Quick! Quick!";

        startTime = performance.now();
    }, randomDelay);
}

// Player clicks the game area
gameArea.addEventListener("click", function () {
    if (gameState === "waiting") {
        clearTimeout(waitTimeout);

        gameState = "idle";

        gameArea.className = "reaction-area finished";
        gameInstruction.textContent = "Too early!";
        gameMessage.textContent = "You clicked before it turned green.";
        gameStart.textContent = "Try again →";
        gameStart.disabled = false;

        return;
    }

    if (gameState === "ready") {
        const reactionTime = Math.round(
            performance.now() - startTime
        );

        gameState = "finished";

        gameArea.className = "reaction-area finished";
        gameInstruction.textContent = reactionTime + " ms";
        gameMessage.textContent = "Your reaction time";

        if (bestScore === null || reactionTime < bestScore) {
            bestScore = reactionTime;
            gameResult.textContent =
                "New personal best: " + bestScore + " ms!";
        } else {
            gameResult.textContent =
                "Your best: " + bestScore + " ms";
        }

        gameStart.textContent = "Play again →";
        gameStart.disabled = false;
    }
});

// Reset the game
function resetGame() {
    clearTimeout(waitTimeout);

    gameState = "idle";

    gameTitle.textContent = "Reaction Test";
    gameMessage.textContent = "Test how fast you can react.";
    gameArea.className = "reaction-area";
    gameInstruction.textContent = "Press start to begin";
    gameResult.textContent = "";
    gameStart.textContent = "Start game →";
    gameStart.disabled = false;
}

// Close game
closeGame.addEventListener("click", function () {
    clearTimeout(waitTimeout);
    gameState = "idle";
    gameScreen.classList.remove("active");
});

// Toast messages for games coming soon
let toastTimeout;

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(function () {
        toast.classList.remove("show");
    }, 2500);
}

// MEMORY MATCH GAME

const memoryGrid = document.querySelector("#memory-grid");
const memoryMovesDisplay = document.querySelector("#memory-moves");
const memoryPairsDisplay = document.querySelector("#memory-pairs");
const memoryResult = document.querySelector("#memory-result");
const memoryRestart = document.querySelector("#memory-restart");
const closeMemory = document.querySelector("#close-memory");

let memoryMoves = 0;
let memoryPairs = 0;
let firstMemoryCard = null;
let memoryLocked = false;

function startMemoryGame() {
    memoryMoves = 0;
    memoryPairs = 0;
    firstMemoryCard = null;
    memoryLocked = false;

    memoryMovesDisplay.textContent = "0";
    memoryPairsDisplay.textContent = "0 / 8";
    memoryResult.textContent = "";
    memoryGrid.innerHTML = "";

    const symbols = ["🍎", "🚀", "🎮", "⭐", "🐸", "🎯", "🌙", "💎"];
    const cards = [...symbols, ...symbols];

    cards.sort(() => Math.random() - 0.5);

    cards.forEach(function (symbol) {
        const card = document.createElement("button");

        card.type = "button";
        card.className = "memory-card";
        card.textContent = "?";
        card.dataset.symbol = symbol;

        card.addEventListener("click", function () {
            if (
                memoryLocked ||
                card.classList.contains("matched") ||
                card === firstMemoryCard
            ) {
                return;
            }

            card.classList.add("flipped");
            card.textContent = symbol;

            if (firstMemoryCard === null) {
                firstMemoryCard = card;
                return;
            }

            memoryMoves++;
            memoryMovesDisplay.textContent = memoryMoves;

            if (firstMemoryCard.dataset.symbol === symbol) {
                firstMemoryCard.classList.add("matched");
                card.classList.add("matched");

                memoryPairs++;
                memoryPairsDisplay.textContent = memoryPairs + " / 8";

                firstMemoryCard = null;

                if (memoryPairs === 8) {
                    memoryResult.textContent =
                        "You found all pairs in " + memoryMoves + " moves!";
                }
            } else {
                memoryLocked = true;

                const previousCard = firstMemoryCard;
                firstMemoryCard = null;

                setTimeout(function () {
                    previousCard.classList.remove("flipped");
                    card.classList.remove("flipped");

                    previousCard.textContent = "?";
                    card.textContent = "?";

                    memoryLocked = false;
                }, 800);
            }
        });

        memoryGrid.appendChild(card);
    });
}

// Restart button
memoryRestart.addEventListener("click", startMemoryGame);

// Close button
closeMemory.addEventListener("click", function () {
    gameScreen.classList.remove("active");
    gameScreen.classList.remove("memory-mode");
});

/* 2048 GAME */

const tileGrid = document.querySelector("#tile-grid");
const tileScoreDisplay = document.querySelector("#tile-score");
const tileRestart = document.querySelector("#tile-restart");
const tileMessage = document.querySelector("#tile-message");
const closeTile = document.querySelector("#close-tile");

let tileBoard = [];
let tileScore = 0;

function startTileGame() {
    tileBoard = Array(16).fill(0);
    tileScore = 0;
    tileScoreDisplay.textContent = "0";
    tileMessage.textContent = "Use your arrow keys to move the tiles.";

    addTile();
    addTile();
    drawTileBoard();
}

function addTile() {
    const empty = tileBoard
        .map((value, index) => value === 0 ? index : -1)
        .filter(index => index !== -1);

    if (empty.length === 0) return;

    const position = empty[Math.floor(Math.random() * empty.length)];
    tileBoard[position] = Math.random() < 0.9 ? 2 : 4;
}

function drawTileBoard() {
    tileGrid.innerHTML = "";

    tileBoard.forEach(value => {
        const cell = document.createElement("div");
        cell.className = "tile-cell";

        if (value !== 0) {
            cell.textContent = value;
            cell.classList.add("tile-" + value);
        }

        tileGrid.appendChild(cell);
    });

    tileScoreDisplay.textContent = tileScore;
}

function moveTiles(direction) {
    const oldBoard = [...tileBoard];

    for (let line = 0; line < 4; line++) {
        let indexes = [];

        for (let i = 0; i < 4; i++) {
            if (direction === "left") indexes.push(line * 4 + i);
            if (direction === "right") indexes.push(line * 4 + (3 - i));
            if (direction === "up") indexes.push(i * 4 + line);
            if (direction === "down") indexes.push((3 - i) * 4 + line);
        }

        let values = indexes
            .map(index => tileBoard[index])
            .filter(value => value !== 0);

        for (let i = 0; i < values.length - 1; i++) {
            if (values[i] === values[i + 1]) {
                values[i] *= 2;
                tileScore += values[i];
                values.splice(i + 1, 1);
            }
        }

        while (values.length < 4) values.push(0);

        indexes.forEach((index, i) => {
            tileBoard[index] = values[i];
        });
    }

    if (tileBoard.some((value, i) => value !== oldBoard[i])) {
        addTile();
        drawTileBoard();
        checkTileGame();
    }
}

function checkTileGame() {
    if (tileBoard.includes(2048)) {
        tileMessage.textContent = "You reached 2048! You win!";
        return;
    }

    const canMove = tileBoard.some((value, i) => {
        if (value === 0) return true;

        const row = Math.floor(i / 4);
        const col = i % 4;

        return (
            (col < 3 && value === tileBoard[i + 1]) ||
            (row < 3 && value === tileBoard[i + 4])
        );
    });

    if (!canMove) {
        tileMessage.textContent = "Game over! Try again.";
    }
}

document.addEventListener("keydown", function (event) {
    if (!gameScreen.classList.contains("tile-mode")) return;

    const directions = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down"
    };

    if (directions[event.key]) {
        event.preventDefault();
        moveTiles(directions[event.key]);
    }
});

tileRestart.addEventListener("click", startTileGame);
closeTile.addEventListener("click", function () {
    gameScreen.classList.remove("active");
    gameScreen.classList.remove("tile-mode");
});

startTileGame();

