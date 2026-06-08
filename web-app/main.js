import AnimalStack from "./AnimalStack.js";

let game = AnimalStack.new_game();
let gameOver = false;

const { Engine, Render, Runner, Bodies, Body, World, Events } = Matter;

// Grab screens and play button 
const screen1 = document.getElementById("screen1");
const screen2 = document.getElementById("screen2");
const screen3 = document.getElementById("screen3");
const btnPlay = document.getElementById("btn-play");

// Grab the name inputs from Screen 1
const input1 = document.getElementById("input-player1");
const input2 = document.getElementById("input-player2");

// Grab the name displays in Screen 2
const player1Name = document.getElementById("player1-name");
const player2Name = document.getElementById("player2-name");

// Highlight around name panel
const player1Panel = document.getElementById("player1-panel");
const player2Panel = document.getElementById("player2-panel");

const previewImage = document.getElementById("next-animal-img");

function updateActivePlayer() {
    if (AnimalStack.current_player(game) === 1) {
        player1Panel.classList.add("active-player");
        player2Panel.classList.remove("active-player");
    } else {
        player2Panel.classList.add("active-player");
        player1Panel.classList.remove("active-player");
    }
}

// Grab the timer
const timerDisplay = document.getElementById("timer");
let timerInterval;
let timeLeft = 15;
let settledFrames = 0;

// Matter.js
let engine, render, runner;
let platform;

//Animals control
let animal;
let checkingAnimal = false;
let currentAnimal;
let nextAnimal;
// Animals that will be used in the game
const animals = [
    { name: "cat", texture: "cat.svg", width: 5, height: 5 },
    //{ name: "dog", texture: "dog.svg", width: 70, height: 60 },
    { name: "pig", texture: "pig.svg", width: 4, height: 4 },
    //{ name: "panda", texture: "panda.svg", width: 65, height: 65 },
];


function pickRandomAnimal() {
    const randomIndex = Math.floor(Math.random() * animals.length);
    return animals[randomIndex];
}


function startTimer() {
    clearInterval(timerInterval);

    timeLeft = 15;
    timerDisplay.textContent = timeLeft;

    timerInterval = setInterval(function() {
        timeLeft = timeLeft - 1;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);

            if (animal && animal.isStatic) {
                dropAnimal();
            }
        }
    }, 1000);
}
//Call switch player function when drop button is clicked
function switchPlayer() {
    game = AnimalStack.next_turn(game);
    updateActivePlayer();
    startTimer();
}

// Update the preview of the next animal
function updatePreview() {
    console.log("preview update", nextAnimal);
    previewImage.src = nextAnimal.texture;
}
function spawnAnimal() {
    console.log("nextAnimal=", nextAnimal);
    currentAnimal = nextAnimal;
    nextAnimal = pickRandomAnimal();
    console.log("currentAnimal=", currentAnimal);
    console.log("texture =", currentAnimal.texture);
    updatePreview();
    animal= Bodies.circle(200, 60, 30, {
        isStatic: true,
        friction: 1,
        frictionStatic: 1,
        restitution: 0.1,
        render: {
            sprite: {
                texture: currentAnimal.texture,
                xScale: 0.1,
                yScale: 0.1
            }
        }
    });

    World.add(engine.world, animal);
}

function startPhysics() {
    engine = Engine.create();

    render = Render.create({
        element: document.getElementById("game-area"),
        engine: engine,
        options: {
            width: 400,
            height: 500,
            background: "transparent",
            wireframes: false
        }
    });

    runner = Runner.create();

    Render.run(render);
    Runner.run(runner, engine);

    platform = Bodies.rectangle(
        200,
        370,
        300,
        20,
        {isStatic: true,
            friction: 1,
            frictionStatic: 1,
            restitution: 0.1,
        render: {
                fillStyle: "#8B5E3C"
            }
        }
    );

    World.add(engine.world, platform);
    spawnAnimal();

    Events.on(engine, "afterUpdate", function() {
        if(gameOver) return;
        if (!animal || animal.isStatic) return;
        // Check if animal fell off the canvas
        if (animal.position.y > 500) {
            checkingAnimal = false;
            settledFrames = 0;
            endTurn();
            return;
        }

        // Check if animal has settled on the platform
        if (!checkingAnimal) return;

        if (animal.speed < 0.02 && animal.angularSpeed < 0.02) {
            settledFrames += 1;
        } else {
            settledFrames = 0;
        }

        if (settledFrames >= 30) {
            settledFrames = 0;
            checkingAnimal = false;
            endTurn();
        }
    });
}

function dropAnimal() {
    if (!animal) return;
    if(!animal.isStatic) return; // prevent dropping multiple times
    clearInterval(timerInterval);
    Body.setVelocity(animal, { x: 0, y: 0 });
    Body.setAngularVelocity(animal, 0);
    Body.setStatic(animal, false);  // unfreeze the animal so gravity takes over
    checkingAnimal = true;
}
function moveLeft() {
    if (!animal || !animal.isStatic) return;
    const newX = Math.max(70, animal.position.x - 10);
    Body.setPosition(animal, { x: newX, y: animal.position.y });
}

function moveRight() {
    if (!animal || !animal.isStatic) return;
    const newX = Math.min(320, animal.position.x + 10);
    Body.setPosition(animal, { x: newX, y: animal.position.y });
}

function rotateLeft() {
    if (!animal || !animal.isStatic) return;
    Body.setAngle(animal, animal.angle - 0.15);
}

function rotateRight() {
    if (!animal || !animal.isStatic) return;
    Body.setAngle(animal, animal.angle + 0.15);
}

document.addEventListener("keydown", function(e) {
    if (!animal) return;
    if (e.key === "ArrowLeft")  moveLeft();
    if (e.key === "ArrowRight") moveRight();
    if (e.key === "a" || e.key === "A") rotateLeft();
    if (e.key === "d" || e.key === "D") rotateRight();
    if (e.key === " ") dropAnimal();
});

document.getElementById("btn-left").addEventListener("click", moveLeft);
document.getElementById("btn-right").addEventListener("click", moveRight);
document.getElementById("btn-rotate-left").addEventListener("click", rotateLeft);
document.getElementById("btn-rotate-right").addEventListener("click", rotateRight);
document.getElementById("btn-drop").addEventListener("click", dropAnimal);

// document.addEventListener("keydown", function(e) {
//     if (!animal) return;

//     if (e.key === "ArrowLeft" && animal.isStatic) {
//         const newX = Math.max(70, animal.position.x - 10);
//         Body.setPosition(animal, {
//             x: newX,
//             y: animal.position.y
//         });
//     }
//     if (e.key === "ArrowRight" && animal.isStatic) {
//         const newX = Math.min(320, animal.position.x + 10);
//         Body.setPosition(animal, {
//             x: newX,
//             y: animal.position.y
//         });
//     }
//     if (e.key === "a" || e.key === "A"&& animal.isStatic) {
//         Body.setAngle(animal, animal.angle - 0.15);
//     }
//     if (e.key === "d" || e.key === "D"&& animal.isStatic) {
//         Body.setAngle(animal, animal.angle + 0.15);
//     }
//     if (e.key === " ") {
//         dropAnimal();
//     }
// });

function animalFellOff() {

    const platformLeft = platform.position.x - 150;
    const platformRight = platform.position.x + 150;

    return (
        // animal.position.x < platformLeft ||
        // animal.position.x > platformRight ||
        animal.position.y > 500
    );
}
function endTurn() {
    if (animalFellOff()) {
        console.log("LOSE CONDITION TRIGGERED");
        const losingPlayer = AnimalStack.current_player(game);
        game = AnimalStack.end_game(losingPlayer, game);
        const winningPlayer = AnimalStack.winner(game);
        const winnerName = winningPlayer === 1
            ? player1Name.textContent
            : player2Name.textContent;

        // game = AnimalStack.end_game(
        //     losingPlayer,
        //     game
        // );
        // const winner =
        //     AnimalStack.winner(game);
        // const winnerName =
        //     winner === 1
        //     ? player1Name.textContent
        //     : player2Name.textContent;
        showWinScreen(winnerName);
        // let winnerName;
        // if (AnimalStack.current_player(game) === 1) {
        //     winnerName = player2Name.textContent;
        // } else {
        //     winnerName = player1Name.textContent;
        // }
        // showWinScreen(winnerName);
        console.log("Player loses"); //Placeholder for now

    } else {
        Body.setStatic(animal, true);

        switchPlayer();
        spawnAnimal();

    }

}
function stopPhysics() {
    if (runner) Runner.stop(runner);
    if (render) {
        Render.stop(render);
        render.canvas.remove();
    }
    if (engine) Engine.clear(engine);
    animal = null;
    gameOver = false;
}


btnPlay.addEventListener("click", function() {

    nextAnimal = pickRandomAnimal();
    player1Name.textContent = input1.value;
    player2Name.textContent = input2.value;
    updateActivePlayer();
    startTimer();
    startPhysics();
    screen1.style.display = "none";
    screen2.style.display = "flex";
});
//Play Again
const btnPlayAgain = document.getElementById("btn-playagain");
btnPlayAgain.addEventListener("click", function() {
    stopPhysics();
    clearInterval(timerInterval);
    screen3.style.display = "none";
    screen2.style.display = "none";
    screen1.style.display = "flex";
});
function showWinScreen(winnerName) {
    gameOver = true;
    const winTitle = document.getElementById("win-title");
    winTitle.textContent = winnerName + ' Wins!';
    screen3.style.display = "flex";  // just show screen3, don't hide screen2
}


// document.addEventListener("keydown", function(e) {
//     if (e.key === "t") {
//         showWinScreen(player1Name.textContent);
//     }
// });

























