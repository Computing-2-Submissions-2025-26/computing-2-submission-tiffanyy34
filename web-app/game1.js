// ============================================================
// game.js — Animal Stack
// STEP 1: Physics setup — animal falls and lands on platform
// ============================================================

// ── Pull out the parts of Matter.js we need ──
const { Engine, Render, Runner, Bodies, Body, World, Events } = Matter;


// ============================================================
// SCREEN SWITCHING
// ============================================================
const screenNameEntry = document.getElementById('screen-name-entry');
const screenGame      = document.getElementById('screen-game');
const screenWin       = document.getElementById('screen-win');

const inputPlayer1  = document.getElementById('input-player1');
const inputPlayer2  = document.getElementById('input-player2');
const btnPlay       = document.getElementById('btn-play');
const btnRestart    = document.getElementById('btn-restart');
const player1Name   = document.getElementById('player1-name');
const player2Name   = document.getElementById('player2-name');
const winTitle      = document.getElementById('win-title');

function showScreen(screenToShow) {
  screenNameEntry.classList.add('hidden');
  screenGame.classList.add('hidden');
  screenWin.classList.add('hidden');
  screenGame.classList.remove('faded');
  screenToShow.classList.remove('hidden');
}

// Play button → go to game screen and start physics
btnPlay.addEventListener('click', function () {
  const name1 = inputPlayer1.value.trim() || 'Player 1';
  const name2 = inputPlayer2.value.trim() || 'Player 2';
  player1Name.textContent = name1;
  player2Name.textContent = name2;
  showScreen(screenGame);
  startPhysics();   // ← kicks off Matter.js
});

// Win screen
function showWinScreen(winnerName) {
  winTitle.textContent = winnerName + ' Wins!';
  screenGame.classList.add('faded');
  screenWin.classList.remove('hidden');
  screenWin.classList.add('active');
}

// Restart → back to name entry and reset physics
btnRestart.addEventListener('click', function () {
  inputPlayer1.value = '';
  inputPlayer2.value = '';
  screenWin.classList.remove('active');
  stopPhysics();    // ← clears the physics world
  showScreen(screenNameEntry);
});

// Temporary test key
document.addEventListener('keydown', function (e) {
  if (e.key === 'w' || e.key === 'W') {
    showWinScreen(player1Name.textContent);
  }
});


// ============================================================
// MATTER.JS PHYSICS
// ============================================================

// These are declared outside so stopPhysics() can reach them
let engine, render, runner;

// ── Canvas size — matches #game-area in CSS ──
const CANVAS_WIDTH  = 520;
const CANVAS_HEIGHT = 380;

// ── Platform settings ──
const PLATFORM_WIDTH  = 220;
const PLATFORM_HEIGHT = 20;
const PLATFORM_Y      = CANVAS_HEIGHT - 30; // near the bottom

// ── Animal list (emoji + rough size) ──
const ANIMALS = [
  { emoji: '🐘', size: 40 },
  { emoji: '🦒', size: 36 },
  { emoji: '🐶', size: 30 },
  { emoji: '🐱', size: 28 },
  { emoji: '🐷', size: 26 },
  { emoji: '🐼', size: 32 },
  { emoji: '🐭', size: 20 },
  { emoji: '🐢', size: 24 },
];

// ── Track the animal waiting to be dropped ──
let pendingAnimal = null;   // the Matter.js body
let pendingEmoji  = '';     // which emoji it is
let pendingSize   = 0;      // its radius
let isDropped     = false;  // has the player dropped it yet?


// ── START: build the physics world ──
function startPhysics() {

  // 1. Create the engine (handles all physics calculations)
  engine = Engine.create();

  // 2. Create the renderer (draws everything onto a canvas)
  render = Render.create({
    element: document.getElementById('canvas-container'),  // inject canvas here
    engine:  engine,
    options: {
      width:           CANVAS_WIDTH,
      height:          CANVAS_HEIGHT,
      background:      'transparent',   // see through to CSS background
      wireframes:      false,           // show solid shapes not outlines
    }
  });

  // 3. Create the runner (keeps the physics loop ticking)
  runner = Runner.create();

  // 4. Build the platform — a static rectangle (doesn't fall)
  const platform = Bodies.rectangle(
    CANVAS_WIDTH / 2,   // x = centre of canvas
    PLATFORM_Y,         // y = near the bottom
    PLATFORM_WIDTH,     // width
    PLATFORM_HEIGHT,    // height
    {
      isStatic: true,   // won't move or fall
      label: 'platform',
      render: { fillStyle: '#8B5E3C' }  // brown colour
    }
  );

  // 5. Build invisible walls so animals don't fall through the sides
  const wallLeft = Bodies.rectangle(
    CANVAS_WIDTH - 20, CANVAS_HEIGHT / 2,   // just off the left edge
    50, CANVAS_HEIGHT,
    { isStatic: true, label: 'wall', render: { visible: true } }
  );

  const wallRight = Bodies.rectangle(
    CANVAS_WIDTH/2 + 20, CANVAS_HEIGHT / 2,   // just off the right edge
    50, CANVAS_HEIGHT,
    { isStatic: true, label: 'wall', render: { visible: true } }
  );

  // 6. Add platform and walls to the world
  World.add(engine.world, [platform, wallLeft, wallRight]);

  // 7. Spawn the first animal at the top
  spawnAnimal();

  // 8. Start the renderer and runner
  Render.run(render);
  Runner.run(runner, engine);
}


// ── STOP: tear down the physics world (used on restart) ──
function stopPhysics() {
  if (runner) Runner.stop(runner);
  if (render) {
    Render.stop(render);
    render.canvas.remove();   // remove the canvas from the DOM
  }
  if (engine) Engine.clear(engine);
  pendingAnimal = null;
  isDropped = false;
}


// ── SPAWN: create a new animal hovering at the top ──
function spawnAnimal() {
  // Pick a random animal
  const pick = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  pendingEmoji = pick.emoji;
  pendingSize  = pick.size;

  // Create a circle body for the animal
  pendingAnimal = Bodies.circle(
    CANVAS_WIDTH / 2,   // start at the centre horizontally
    60,                 // near the top
    pendingSize,        // radius
    {
      isStatic: true,   // frozen until player presses DROP
      label: 'animal',
      restitution: 0.3, // slight bounce on landing
      friction: 0.8,    // grip so animals don't slide too easily
      render: {
        sprite: {
          // Render the emoji as a texture on the circle
          texture: emojiToTexture(pendingEmoji, pendingSize * 2),
        }
      }
    }
  );

  World.add(engine.world, pendingAnimal);
  isDropped = false;
}


// ── EMOJI TEXTURE: draw emoji onto a small canvas, return as image URL ──
// Matter.js can't display emoji directly, so we paint it onto a canvas first
function emojiToTexture(emoji, size) {
  const canvas  = document.createElement('canvas');
  canvas.width  = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.font    = `${size * 0.8}px serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size / 2, size / 2);
  return canvas.toDataURL();
}


// ============================================================
// KEYBOARD CONTROLS
// ============================================================
document.addEventListener('keydown', function (e) {

  // Don't do anything if there's no pending animal or it's already dropped
  if (!pendingAnimal || isDropped) return;

  if (e.key === 'ArrowLeft') {
    // Move left — but don't go off the left edge
    const newX = pendingAnimal.position.x - 10;
    if (newX - pendingSize > 140) {
      Body.setPosition(pendingAnimal, { x: newX, y: pendingAnimal.position.y });
    }
  }

  if (e.key === 'ArrowRight') {
    // Move right — but don't go off the right edge
    const newX = pendingAnimal.position.x + 10;
    if (newX + pendingSize < CANVAS_WIDTH-120) {
      Body.setPosition(pendingAnimal, { x: newX, y: pendingAnimal.position.y });
    }
  }

  if (e.key === 'z' || e.key === 'Z') {
    // Rotate anticlockwise
    Body.setAngle(pendingAnimal, pendingAnimal.angle - 0.15);
  }

  if (e.key === 'x' || e.key === 'X') {
    // Rotate clockwise
    Body.setAngle(pendingAnimal, pendingAnimal.angle + 0.15);
  }

  if (e.key === ' ') {
    // DROP — unfreeze the animal so gravity takes over
    e.preventDefault();   // stop spacebar from scrolling the page
    Body.setStatic(pendingAnimal, false);
    isDropped = true;

    // After a short delay, spawn the next animal
    setTimeout(function () {
      spawnAnimal();
    }, 2000);  // 2 seconds — enough time for the animal to land
  }

  // Temporary test key
  if (e.key === 'w' || e.key === 'W') {
    showWinScreen(player1Name.textContent);
  }

});
