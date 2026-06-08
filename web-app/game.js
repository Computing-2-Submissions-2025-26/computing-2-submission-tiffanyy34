
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


function updateActivePlayer() {
    if (currentPlayer === 1) {
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

// Matter.js
let engine, render, runner;

//Animals control
let animal;

// Animals that will be used in the game
const animals = [
    { name: "cat", texture: "cat.svg", width: 5, height: 5 },
    //{ name: "dog", texture: "dog.svg", width: 70, height: 60 },
    //{ name: "pig", texture: "pig.svg", width: 60, height: 50 },
    //{ name: "panda", texture: "panda.svg", width: 65, height: 65 },
];
let currentAnimal;

function pickRandomAnimal() {
    const randomIndex = Math.floor(Math.random() * animals.length);
    return animals[randomIndex];
}

// Game state
let currentPlayer = 1;

function startTimer() {
    timeLeft = 15;
    timerDisplay.textContent = timeLeft;

    timerInterval = setInterval(function() {
        timeLeft = timeLeft - 1;
        timerDisplay.textContent = timeLeft;

        if (timeLeft === 0) {
            clearInterval(timerInterval);
        }
    }, 1000);
}
//Call switch player function when drop button is clicked
function switchPlayer() {
    if (currentPlayer === 1) {
        currentPlayer = 2;
    } else {
        currentPlayer = 1;
    }
    updateActivePlayer();
    setTimeout(function() {
        startTimer();  // wait 2 seconds before starting the timer
    }, 2000);
}

function startPhysics() {
    engine = Engine.create();

    render = Render.create({
        element: document.getElementById("game-area"),
        engine: engine,
        options: {
            width: 400,
            height: 500,
            background: "#ffb4b4",
            wireframes: false
        }
    });

    runner = Runner.create();

    Render.run(render);
    Runner.run(runner, engine);

    const platform = Bodies.rectangle(
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

    animal= Bodies.circle(200, 60, 30, {
    isStatic: true,
    friction: 0.8,
    frictionStatic: 1,
    restitution: 0.1,
    render: {
        sprite: {
            texture: "cat.svg",
            xScale: 0.1,
            yScale: 0.1
        }
    }
});
    World.add(engine.world, [platform,animal]);
}

function dropAnimal() {
    if (!animal) return;
    Body.setStatic(animal, false);  // unfreeze the animal so gravity takes over
}

document.addEventListener("keydown", function(e) {
    if (!animal) return;

    if (e.key === "ArrowLeft") {
        Body.setPosition(animal, { x: animal.position.x - 10, y: animal.position.y });
    }
    if (e.key === "ArrowRight") {
        Body.setPosition(animal, { x: animal.position.x + 10, y: animal.position.y });
    }
    if (e.key === "a" || e.key === "A") {
        Body.setAngle(animal, animal.angle - 0.15);
    }
    if (e.key === "d" || e.key === "D") {
        Body.setAngle(animal, animal.angle + 0.15);
    }
    if (e.key === " ") {
        dropAnimal();
        switchPlayer();
    }
});





btnPlay.addEventListener("click", function() {
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
    screen3.style.display = "none";
    screen1.style.display = "flex";
});
function showWinScreen(winnerName) {
    const winTitle = document.getElementById("win-title");
    winTitle.textContent = winnerName + ' Wins!';
    screen3.style.display = "flex";  // just show screen3, don't hide screen2
}


document.addEventListener("keydown", function(e) {
    if (e.key === "t") {
        showWinScreen(player1Name.textContent);
    }
});

























