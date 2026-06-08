// ============================================================
// game.js — Animal Stack
// Phase 1: Screen switching only. Game logic comes later.
// ============================================================
// ── Pull out the parts of Matter.js we need ──
const { Engine, Render, Runner, Bodies, Body, World, Events } = Matter;

// ── Grab all 3 screens ──
const screenNameEntry = document.getElementById('screen-name-entry');
const screenGame      = document.getElementById('screen-game');
const screenWin       = document.getElementById('screen-win');

// ── Grab key elements ──
const inputPlayer1  = document.getElementById('input-player1');
const inputPlayer2  = document.getElementById('input-player2');
const btnPlay       = document.getElementById('btn-play');
const btnRestart    = document.getElementById('btn-restart');
const player1Name   = document.getElementById('player1-name');
const player2Name   = document.getElementById('player2-name');
const winTitle      = document.getElementById('win-title');

// ── Helper: switch screens ──
function showScreen(screenToShow) {
  // Hide all screens first
  screenNameEntry.classList.add('hidden');
  screenGame.classList.add('hidden');
  screenWin.classList.add('hidden');

  // Remove faded effect from game screen
  screenGame.classList.remove('faded');

  // Show the requested screen
  screenToShow.classList.remove('hidden');
}

// ── SCREEN 1 → SCREEN 2: Play button ──
btnPlay.addEventListener('click', function () {

  // Read player names (use defaults if left blank)
  const name1 = inputPlayer1.value.trim() || 'Player 1';
  const name2 = inputPlayer2.value.trim() || 'Player 2';

  // Display names in the game screen panels
  player1Name.textContent = name1;
  player2Name.textContent = name2;

  // Switch to game screen
  showScreen(screenGame);

});

// ── SCREEN 2 → SCREEN 3: Show win screen (called later by game logic) ──
function showWinScreen(winnerName) {
  winTitle.textContent = winnerName + ' Wins!';

  // Fade the game screen behind the overlay
  screenGame.classList.add('faded');

  // Show win screen on top
  screenWin.classList.remove('hidden');
  screenWin.classList.add('active');
}

// ── SCREEN 3 → SCREEN 1: Restart button ──
btnRestart.addEventListener('click', function () {

  // Clear name inputs
  inputPlayer1.value = '';
  inputPlayer2.value = '';

  // Remove win screen active state
  screenWin.classList.remove('active');

  // Go back to name entry
  showScreen(screenNameEntry);

});

// ── Temporary test: press W to trigger win screen (remove later) ──
document.addEventListener('keydown', function (e) {
  if (e.key === 'w' || e.key === 'W') {
    showWinScreen(player1Name.textContent);
  }
});
