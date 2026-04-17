// Variables to store player names and scores
let player1 = { name: "", symbol: "X", score: 0 };
let player2 = { name: "", symbol: "O", score: 0 };
let currentPlayer = player1;
let board = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;
let rounds = 1;

// Function to initialize the game
function initGame() {
  console.log("Initializing game...");
  document.getElementById("start-game").addEventListener("click", startGame);
  document.getElementById("end-game").addEventListener("click", endGame);
  document.getElementById("play-again").addEventListener("click", () => {
    window.location.reload(true);
  });
  document
    .querySelectorAll(".cell")
    .forEach((cell) => cell.addEventListener("click", handleCellClick));
  fetchScores();
}

// Function to fetch scores from the server
function fetchScores() {
  fetch("http://localhost:3000/scores")
    .then((response) => response.json())
    .then((data) => {
      console.log("Fetched scores:", data);
      if (data.data.length > 0) {
        data.data.forEach((player) => {
          if (player.symbol === "X") {
            player1.name = player.name;
            player1.score = player.score;
          } else if (player.symbol === "O") {
            player2.name = player.name;
            player2.score = player.score;
          }
        });
        updateScoreboard();
        updateCurrentTurn();
      }
    })
    .catch((error) => console.error("Error fetching scores:", error));
}

// Function to start the game
function startGame() {
  console.log("Start Game button clicked.");
  player1.name = document.getElementById("player1-name").value || "Player 1";
  player2.name = document.getElementById("player2-name").value || "Player 2";

  console.log("Player 1:", player1.name);
  console.log("Player 2:", player2.name);

  document.getElementById("playerXdisplay").innerText =
    `${player1.name} [X]` || "X";
  document.getElementById("playerOdisplay").innerText =
    `${player2.name} [O]` || "O";

  document.getElementById("player-modal").style.display = "none";
  updateScoreboard();
  updateCurrentTurn();
}

// Function to handle cell click
function handleCellClick(event) {
  const index = event.target.getAttribute("data-index");
  if (board[index] !== "" || !gameActive) return;

  board[index] = currentPlayer.symbol;
  event.target.textContent = currentPlayer.symbol;

  if (checkWin()) {
    handleWin();
  } else if (board.every((cell) => cell !== "")) {
    handleDraw();
  } else {
    switchPlayer();
  }
}

// Function to switch player
function switchPlayer() {
  currentPlayer = currentPlayer === player1 ? player2 : player1;
  updateCurrentTurn();
}

// Function to update the scoreboard
function updateScoreboard() {
  document.getElementById(
    "player1-score"
  ).textContent = `${player1.name} [X]: ${player1.score}`;
  document.getElementById(
    "player2-score"
  ).textContent = `${player2.name} [O]: ${player2.score}`;
  updateScoreColors();
}

// Function to update current turn display
function updateCurrentTurn() {
  document.getElementById(
    "current-turn"
  ).textContent = `Current Turn: ${currentPlayer.name} [${currentPlayer.symbol}]`;
}

// Function to handle win
function handleWin() {
  currentPlayer.score++;
  updateScoreboard();
  updateScoresOnServer(currentPlayer);
  showConfetti();
  gameActive = false;
  document.querySelectorAll(".cell").forEach((cell) => {
    if (cell.textContent === currentPlayer.symbol) {
      cell.classList.add("winner");
    } else if (cell.textContent !== "") {
      cell.classList.add("loser");
    }
  });
  updateRounds();
}

// Function to handle draw
function handleDraw() {
  gameActive = false;
  showConfetti();
  updateRounds();
}

// Function to check win
function checkWin() {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];

  return winPatterns.some((pattern) => {
    return pattern.every((index) => board[index] === currentPlayer.symbol);
  });
}

// Function to handle end game
function endGame() {
  gameActive = false;
  displayFinalScores();
  if (player1.score !== player2.score) showConfetti();

  document.querySelectorAll(".cell").forEach((cell) => {
    if (cell.textContent === currentPlayer.symbol) {
      cell.classList.add("winner");
    } else if (cell.textContent !== "") {
      cell.classList.add("loser");
    }
  });
}

// Function to display final scores and winner
function displayFinalScores() {
  const draw = player1.score === player2.score ? "draw" : "win";

  if (draw === "win") {
    let winner = player1.score > player2.score ? player1 : player2;

    const Winner = (document.getElementById("board").innerHTML = `
        <div class="player player-1 ${
          player1.name === winner.name ? "winner_color" : "losser_color"
        }">
        ${player1.name}: ${player1.score}
        </div>

        <div class="player player-2 ${
          player2.name === winner.name ? "winner_color" : "losser_color"
        }">
        ${player2.name}: ${player2.score}
        </div>
        <div class="winner-board winner">WINNER ${winner.name}</div>
    `);
  } else {
    const Draw = (document.getElementById("board").innerHTML = `
        <div class="player player-1">
        ${player1.name}: ${player1.score}
        </div>

        <div class="player player-2">
        ${player2.name}: ${player2.score}
        </div>
        <div class="winner-board">Match Draw</div>
    `);
  }
  document.querySelector(".scoreboard").remove();
  document.getElementById("play-again").style.display = "block";
}

// Function to show confetti
function showConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}

// Function to update scores on the server
function updateScoresOnServer(player) {
  fetch("http://localhost:3000/scores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: player.name,
      symbol: player.symbol,
      score: player.score,
    }),
  })
    .then((response) => response.json())
    .then((data) => console.log("Score updated:", data))
    .catch((error) => console.error("Error updating score:", error));
}

// Function to update score colors
function updateScoreColors() {
  let player1ScoreEl = document.getElementById("player1-score");
  let player2ScoreEl = document.getElementById("player2-score");
  let playerXdisplay = document.getElementById("playerXdisplay");
  let playerOdisplay = document.getElementById("playerOdisplay");

  const green = "#5fa55f";
  const red = "#e54872";

  if (player1.score > player2.score) {
    player1ScoreEl.style.color = green;
    player2ScoreEl.style.color = red;
    playerXdisplay.style.color = green;
    playerOdisplay.style.color = red;
  } else if (player2.score > player1.score) {
    player1ScoreEl.style.color = red;
    player2ScoreEl.style.color = green;
    playerXdisplay.style.color = red;
    playerOdisplay.style.color = green;
  } else {
    player1ScoreEl.style.color = "white";
    player2ScoreEl.style.color = "white";
    playerXdisplay.style.color = "white";
    playerOdisplay.style.color = "white";
  }
}

// Function to update round number
function updateRounds() {
  rounds++;
  document.getElementById("round-number").textContent = `Round: ${rounds}`;
  if (rounds <= 3) {
    resetBoard();
  } else {
    endGame();
  }
}

// Function to reset the board
function resetBoard() {
  board = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("winner", "loser");
  });
  currentPlayer = player1;
  updateCurrentTurn();
}

// Initialize the game on window load
window.onload = initGame;
