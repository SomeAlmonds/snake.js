///////////////////////////// CANVAS SETUP /////////////////////////////

const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.className = "canvas";
const canvasDiv = document.getElementById("canvas-div");
canvasDiv.appendChild(canvas);

const height = (canvas.height = 400);
const width = (canvas.width = 400);

const context = canvas.getContext("2d");
context.fillStyle = "white";
context.strokeStyle = "white";
context.lineWidth = 2;

if (window.localStorage.getItem("snake-score-list")) {
  let list = document.getElementsByClassName("score-item");
  for (let i = 0; i < list.length; i++) {
    list[i].innerText =
      window.localStorage.getItem("snake-score-list").split(",")[i] || 0;
  }
}

///////////////////////////// SNAKE AND TARGET SETUP /////////////////////////////

class SNAKE {
  constructor() {
    this.sections = [
      {
        x: height / 2,
        y: width / 2,
      },
      {
        x: height / 2,
        y: width / 2 + 20,
      },
    ];
    this.step = height / 20;
    this.rotation = 0;
    this.lastRotation = 0;
  }
}
let snake = new SNAKE();

class FOOD {
  constructor() {
    this.foodGrid = Array.from({ length: 20 }, (_, i) => 5 + i * snake.step);
    this.possition = { x: this.newPossition("x"), y: this.newPossition("y") };
  }
  newPossition(axis) {
    let p = this.foodGrid[Math.floor(Math.random() * 20)];

    if (axis === "y") {
      snake.sections.forEach((section) => {
        if (
          Array.from({ length: 20 }, (_, i) => i + section.y).includes(p) &&
          Array.from({ length: 20 }, (_, i) => i + section.x).includes(
            this.possition.x
          )
        ) {
          this.possition.x = this.foodGrid[Math.floor(Math.random() * 20)];
          this.newPossition(axis);
        }
      });
    }
    return p;
  }
}

let food = new FOOD();

///////////////////////////// INPUT HANDLING /////////////////////////////

window.addEventListener("keydown", (e) => updateRotation(e.key));

///////////////////////////// SNAKE POSITION HANDLING /////////////////////////////

function updateRotation(direction) {
  snake.lastRotation = snake.rotation;

  switch (direction) {
    case "w" || "W":
      if (snake.lastRotation !== 180) snake.rotation = 0;
      break;
    case "d" || "D":
      if (snake.lastRotation !== 270) snake.rotation = 90;
      break;
    case "s" || "S":
      if (snake.lastRotation !== 0) snake.rotation = 180;
      break;
    case "a" || "A":
      if (snake.lastRotation !== 90) snake.rotation = 270;
      break;
    default:
      break;
  }
}

function updatePossition() {
  let sectionslen = snake.sections.length;

  for (let i = 0; i <= sectionslen - 2; i++) {
    snake.sections[sectionslen - 1 - i].x =
      snake.sections[sectionslen - 2 - i].x;
    snake.sections[sectionslen - 1 - i].y =
      snake.sections[sectionslen - 2 - i].y;
  }

  switch (snake.rotation) {
    case 0:
      snake.sections[0].y -= snake.step;
      break;
    case 90:
      snake.sections[0].x += snake.step;
      break;
    case 180:
      snake.sections[0].y += snake.step;
      break;
    case 270:
      snake.sections[0].x -= snake.step;
      break;
    default:
      break;
  }

  if (!hardMode) {
    if (snake.sections[0].x >= width) {
      snake.sections[0].x = 0;
    } else if (snake.sections[0].x < 0) {
      snake.sections[0].x += width;
    }
    if (snake.sections[0].y >= height) {
      snake.sections[0].y = 0;
    } else if (snake.sections[0].y < 0) {
      snake.sections[0].y += height;
    }
  }
}

///////////////////////////// COLLISION DETECTION /////////////////////////////

function collision() {
  // FOOD COLLISION
  if (
    Array.from({ length: 20 }, (_, i) => i + snake.sections[0].x).includes(
      food.possition.x + 5
    ) &&
    Array.from({ length: 20 }, (_, i) => i + snake.sections[0].y).includes(
      food.possition.y + 5
    )
  ) {
    // new target
    food.possition.x = food.newPossition("x");
    food.possition.y = food.newPossition("y");

    // increase snake length
    snake.sections.push({
      x: snake.sections[snake.sections.length - 1].x,
      y: snake.sections[snake.sections.length - 1].y,
    });

    // update score
    score += 10;
    document.getElementById("score-counter").innerText = `SCORE: ${score}`;
  }

  // SELF COLLISION
  snake.sections.slice(1).forEach((section) => {
    if (
      section.x === snake.sections[0].x &&
      section.y === snake.sections[0].y
    ) {
      gameOver = 1;
    }
  });

  // WALL COLLISION
  if (hardMode) {
    if (snake.sections[0].x >= width || snake.sections[0].x < 0) {
      gameOver = 1;
    }
    if (snake.sections[0].y >= height || snake.sections[0].y < 0) {
      gameOver = 1;
    }
  }
}

///////////////////////////// SCREEN UPDATE /////////////////////////////

function draw() {
  context.clearRect(0, 0, width, height);
  context.save();

  snake.sections.forEach((section) => {
    context.fillRect(section.x, section.y, 20, 20);
  });

  context.fillRect(food.possition.x, food.possition.y, 10, 10);

  context.restore();
}

///////////////////////////// HANDLE GAME OVER /////////////////////////////

function handleGameOver() {
  scoreList.push(score);
  scoreList.sort((a, b) => b - a);

  let list = document.getElementsByClassName("score-item");
  for (let i = 0; i < list.length; i++) {
    list[i].innerText = scoreList[i] || 0;
  }
  window.localStorage.setItem("snake-score-list", [...scoreList]);
  console.log(window.localStorage.getItem("snake-score-list"));

  score = 0;

  snake = new SNAKE();
  food = new FOOD();
  pauseLoop = true;
  document.getElementById("start-btn").innerText = "START";
}

///////////////////////////// MAIN LOOP /////////////////////////////

let pauseLoop = true;
let lastRender = 0;
let fpsInt = 1000 / 4;
let score = 0;
let scoreList =
  window.localStorage.getItem("snake-score-list").split(",") || [];
let hardMode = 0;
let gameOver = 0;

function loop() {
  let progress = performance.now() - lastRender;

  if (progress >= fpsInt) {
    if (gameOver) {
      // update score list and reset
      handleGameOver();
      return;
    }
    updatePossition();
    collision();
    draw();
    lastRender = performance.now();
  }
  if (!pauseLoop) window.requestAnimationFrame(loop);
  else {
    return;
  }
}

document.getElementById("start-btn").addEventListener("click", () => {
  // reset score element when starting a new game
  if (gameOver) {
    document.getElementById("score-counter").innerText = `SCORE: ${score}`;
    gameOver = 0;
  }
  // if game is paused: resume else: pause
  pauseLoop = !pauseLoop;
  document.getElementById("start-btn").innerText = pauseLoop
    ? "START"
    : "PAUSE";
  if (!pauseLoop) loop();
});

document.getElementById("mode-btn").addEventListener("click", () => {
  // toggle difficulty mode
  hardMode = !hardMode;
  document.getElementById("mode-btn").innerText = hardMode
    ? "MODE: HARD"
    : "MODE: EASY";
});
