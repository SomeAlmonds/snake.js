const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.className = "canvas";
const canvasDiv = document.getElementById("canvas-div");
canvasDiv.appendChild(canvas);

const height = (canvas.height = 500);
const width = (canvas.width = 500);

const context = canvas.getContext("2d");
context.fillStyle = "white";
context.strokeStyle = "white";
context.lineWidth = 2;

let snake = {
  sections: [
    {
      x: height / 2,
      y: width / 2,
    },
    {
      x: height / 2,
      y: width / 2 + 20,
    },
    {
      x: height / 2,
      y: width / 2 + 40,
    },
    {
      x: height / 2,
      y: width / 2 + 60,
    },
  ],
  step: height / 20,
  rotation: 0,
  lastRotation: 0,
  pressedKeys: {
    up: false,
    down: false,
    left: false,
    right: false,
    space: false,
  },
};

let foodGrid = Array.from({ length: 20 }, (_, i) => i * snake.step);
function newPossition(c) {
  let p = foodGrid[Math.floor(Math.random() * 20)];

  snake.sections.forEach((section) => {
    if (Array.from({ length: 30 }, (_, i) => i - 10 + section[c]).includes(p)) {
      newPossition(c);
    }
  });
  return p;
}
let food = {
  possition: {
    x: newPossition("x"),
    y: newPossition("y"),
  },
};

let keyMap = {
  87: "up",
  83: "down",
  65: "left",
  68: "right",
  19: "space",
};

function keyDown(e) {
  let key = keyMap[e.keyCode];
  snake.pressedKeys[key] = true;
}

function keyUp(e) {
  let key = keyMap[e.keyCode];
  snake.pressedKeys[key] = false;
}

window.addEventListener("keydown", keyDown);
window.addEventListener("keyup", keyUp);

function updateRotation() {
  snake.lastRotation = snake.rotation;
  if (snake.pressedKeys.up) {
    if (snake.lastRotation !== 180) snake.rotation = 0;
  }
  if (snake.pressedKeys.right) {
    if (snake.lastRotation !== 270) snake.rotation = 90;
    console.log(snake.rotation);
  }
  if (snake.pressedKeys.down) {
    if (snake.lastRotation !== 0) snake.rotation = 180;
  }
  if (snake.pressedKeys.left) {
    if (snake.lastRotation !== 90) snake.rotation = 270;
    console.log(snake.rotation);
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

  if (snake.sections[0].x > width) {
    snake.sections[0].x -= width;
  } else if (snake.sections[0].x < 0) {
    snake.sections[0].x += width;
  }
  if (snake.sections[0].y > height) {
    snake.sections[0].y -= height;
  } else if (snake.sections[0].y < 0) {
    snake.sections[0].y += height;
  }
}

function collision() {
  console.log(food.possition.x);

  if (
    Array.from({ length: 20 }, (_, i) => i + snake.sections[0].x).includes(
      food.possition.x + 5
    ) &&
    Array.from({ length: 20 }, (_, i) => i + snake.sections[0].y).includes(
      food.possition.y + 5
    )
  ) {
    food.possition.x = newPossition("x");
    food.possition.x = newPossition("y");
    snake.sections.unshift({
      x: snake.sections[0].x,
      y: snake.sections[0].y,
    });
    console.log("hit");
  }
}

function draw() {
  context.clearRect(0, 0, width, height);
  context.save();

  snake.sections.forEach((section) => {
    context.fillRect(section.x, section.y, 20, 20);
  });

  context.fillRect(food.possition.x, food.possition.y, 10, 10);

  context.restore();
}

let breakLoop = true;
let lastRender = 0;
let fpsInt = 1000 / 3;
function loop() {
  let progress = performance.now() - lastRender;

  updateRotation(progress);
  if (progress >= fpsInt) {
    updatePossition(progress);
    collision();
    draw();
    lastRender = performance.now();
  }
  if (!breakLoop) window.requestAnimationFrame(loop);
  else {
    context.clearRect(0, 0, width, height);
    return;
  }
}

document.getElementById("start-btn").addEventListener("click", () => {
  breakLoop = !breakLoop;
  document.getElementById("start-btn").innerText = breakLoop ? "START" : "STOP";
  loop();
});
