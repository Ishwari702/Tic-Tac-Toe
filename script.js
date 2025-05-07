const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const playerScoreEl = document.getElementById('playerScore');
const aiScoreEl = document.getElementById('aiScore');
const modeSelect = document.getElementById('modeSelect');
const themeToggle = document.getElementById('themeToggle');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let playerScore = 0;
let aiScore = 0;
let gameMode = modeSelect.value;

// Sound Effects
const clickSound = new Audio('sounds/click.mp3');
const winSound = new Audio('sounds/win.mp3');
const drawSound = new Audio('sounds/draw.mp3');

cells.forEach(cell => cell.addEventListener('click', handlePlayerMove));

modeSelect.addEventListener('change', () => {
  gameMode = modeSelect.value;
  resetGame();
});

themeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark');
});

function handlePlayerMove(e) {
  const index = e.target.dataset.index;
  if (board[index] || !gameActive) return;

  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  clickSound.play();

  if (checkGameEnd(currentPlayer)) return;

  if (gameMode === 'ai' && currentPlayer === 'X') {
    currentPlayer = 'O';
    statusText.textContent = "AI's Turn (O)";
    setTimeout(() => {
      const bestMove = getBestMove();
      if (bestMove !== -1) {
        board[bestMove] = 'O';
        cells[bestMove].textContent = 'O';
        clickSound.play();
        if (!checkGameEnd('O')) {
          currentPlayer = 'X';
          statusText.textContent = "Your Turn (X)";
        }
      }
    }, 500);
  } else if (gameMode === 'friend') {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusText.textContent = `Player ${currentPlayer}'s Turn`;
  }
}

function checkGameEnd(player) {
  if (checkWinner(player)) {
    statusText.textContent = `${player === 'X' ? 'Player X' : (gameMode === 'ai' ? 'AI' : 'Player O')} Wins!`;
    winSound.play();
    if (player === 'X') playerScore++;
    else aiScore++;
    playerScoreEl.textContent = playerScore;
    aiScoreEl.textContent = aiScore;
    gameActive = false;
    return true;
  } else if (board.every(cell => cell !== '')) {
    statusText.textContent = "It's a Draw!";
    drawSound.play();
    gameActive = false;
    return true;
  }
  return false;
}

function checkWinner(player) {
  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  return winPatterns.some(pattern =>
    pattern.every(index => board[index] === player)
  );
}

function getBestMove() {
  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      let score = minimax(board, 0, false);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(newBoard, depth, isMaximizing) {
  if (checkWinner('O')) return 10 - depth;
  if (checkWinner('X')) return depth - 10;
  if (newBoard.every(cell => cell !== '')) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!newBoard[i]) {
        newBoard[i] = 'O';
        best = Math.max(best, minimax(newBoard, depth + 1, false));
        newBoard[i] = '';
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!newBoard[i]) {
        newBoard[i] = 'X';
        best = Math.min(best, minimax(newBoard, depth + 1, true));
        newBoard[i] = '';
      }
    }
    return best;
  }
}

function resetGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  cells.forEach(cell => cell.textContent = '');
  currentPlayer = 'X';
  gameActive = true;
  statusText.textContent = gameMode === 'ai' ? "Your Turn (X)" : "Player X's Turn";
}
