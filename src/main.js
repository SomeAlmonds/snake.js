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

let state = {
  sections: [
    {
      x: height / 2,
      y: width / 2,
    },
    {
      x: height / 2,
      y:( width / 2) + 20,
    },
    {
      x: height / 2,
      y: (width / 2) + 40,
    },
    {
      x: height / 2,
      y: (width / 2) + 60,
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

let keyMap = {
  87: "up",
  83: "down",
  65: "left",
  68: "right",
  19: "space",
};

function keyDown(e) {
  let key = keyMap[e.keyCode];
  state.pressedKeys[key] = true;
}

function keyUp(e) {
  let key = keyMap[e.keyCode];
  state.pressedKeys[key] = false;
}

window.addEventListener("keydown", keyDown);
window.addEventListener("keyup", keyUp);

function updateRotation() {
  state.lastRotation = state.rotation;
  if (state.pressedKeys.up) {
    if (state.lastRotation !== 180) state.rotation = 0;
  }
  if (state.pressedKeys.right) {
    if (state.lastRotation !== 270) state.rotation = 90;
    console.log(state.rotation);
  }
  if (state.pressedKeys.down) {
    if (state.lastRotation !== 0) state.rotation = 180;
  }
  if (state.pressedKeys.left) {
    if (state.lastRotation !== 90) state.rotation = 270;
    console.log(state.rotation);
  }
}

function updatePossition() {
  let sectionslen = state.sections.length;

  for (let i = 0; i <= sectionslen - 2; i++) {
    state.sections[sectionslen - 1 - i].x =
      state.sections[sectionslen - 2 - i].x;
    state.sections[sectionslen - 1 - i].y =
      state.sections[sectionslen - 2 - i].y;
  }

  switch (state.rotation) {
    case 0:
      state.sections[0].y -= state.step;
      break;
    case 90:
      state.sections[0].x += state.step;
      break;
    case 180:
      state.sections[0].y += state.step;
      break;
    case 270:
      state.sections[0].x -= state.step;
      break;
    default:
      break;
  }

  if (state.sections[0].x > width) {
    state.sections[0].x -= width;
  } else if (state.sections[0].x < 0) {
    state.sections[0].x += width;
  }
  if (state.sections[0].y > height) {
    state.sections[0].y -= height;
  } else if (state.sections[0].y < 0) {
    state.sections[0].y += height;
  }
}

function draw() {
  context.clearRect(0, 0, width, height);
  context.save();

  state.sections.forEach((section) => {
    context.fillRect(section.x, section.y, 20, 20)
  })

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
