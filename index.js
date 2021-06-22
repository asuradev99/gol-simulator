import { Universe, Cell } from "./pkg/wasm_game_of_life"; //wasm-game-of-life
import { memory } from "./pkg/wasm_game_of_life_bg";

const CELL_SIZE = 1; // px
const ALIVE_COLOR = "#000000";
const DEAD_COLOR = "#FFFFFF";
//const GRID_COLOR = DEAD_COLOR;

const RENDER_MODE = 1;
// Construct the universe, and get its width and height.
const universe = Universe.new(1000, 1000);
const width = universe.width();
const height = universe.height();

// Give the canvas room for all of our cells and a 1px border
// around each of them.
const canvas = document.getElementById("game-of-life-canvas");
const b_canvas = document.createElement("canvas");

canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

b_canvas.height = canvas.height; 
b_canvas.width = canvas.width;


const ctx = canvas.getContext('2d', {alpha: false});
const bctx = b_canvas.getContext('2d', {alpha: false});

const fps = new class {
  constructor() {
    this.fps = document.getElementById("fps");
    this.frames = [];
    this.lastFrameTimeStamp = performance.now();
  }

  render() {
    // Convert the delta time since the last frame render into a measure
    // of frames per second.
    const now = performance.now();
    const delta = now - this.lastFrameTimeStamp;
    this.lastFrameTimeStamp = now;
    const fps = 1 / delta * 1000;

    // Save only the latest 100 timings.
    this.frames.push(fps);
    if (this.frames.length > 100) {
      this.frames.shift();
    }

    // Find the max, min, and mean of our 100 latest timings.
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    for (let i = 0; i < this.frames.length; i++) {
      sum += this.frames[i];
      min = Math.min(this.frames[i], min);
      max = Math.max(this.frames[i], max);
    }
    let mean = sum / this.frames.length;

    // Render the statistics.
    this.fps.style.fontSize = "x-large"
    this.fps.textContent = `
Frames per Second:
         latest = ${Math.round(fps)}
avg of last 100 = ${Math.round(mean)}
min of last 100 = ${Math.round(min)}
max of last 100 = ${Math.round(max)}
`.trim();
  }
};

let animationId = null;

const renderLoop = () => {
  //ctx.clearRect(0, 0, canvas.width, canvas.height);
  fps.render();
  drawCells();
  //drawGrid();
  universe.tick();
  animationId = requestAnimationFrame(renderLoop);
};

const isPaused = () => {
  return animationId === null;
};

const playPauseButton = document.getElementById("play-pause");
playPauseButton.style.width = '200px';
playPauseButton.style.height = '200px';
const play = () => {
  playPauseButton.textContent = "⏸";
  renderLoop();
};

const pause = () => {
  playPauseButton.textContent = "▶";
  cancelAnimationFrame(animationId);
  animationId = null;
};

playPauseButton.addEventListener("click", event => {
  if (isPaused()) {
    play();
  } else {
    pause();
  }
});

const stepButton = document.getElementById("step");
stepButton.style.width = '200px';
stepButton.style.height = '200px';

stepButton.addEventListener("click", event => {
  if (isPaused()) {
    drawCells();
    //drawGrid();
    universe.tick();
  }
});
// const drawGrid = () => {
//   ctx.beginPath();
//   ctx.strokeStyle = GRID_COLOR;

//   // Vertical lines.
//   for (let i = 0; i <= width; i++) {
//     ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
//     ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
//   }

//   // Horizontal lines.
//   for (let j = 0; j <= height; j++) {
//     ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
//     ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
//   }

//   ctx.stroke();
// };

const getIndex = (row, column) => {
  return row * width + column;
};

const drawCells = () => {
  const cellsPtr = universe.cells();
  const updatesPtr = universe.updates();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);
  const updates = new Uint32Array(memory.buffer, updatesPtr, width * height);


  bctx.beginPath();

    // // Alive cells.
    bctx.fillStyle = ALIVE_COLOR;
    for (let i = 0; i < updates.length; i++) {
      if (updates[i] < updates[i - 1]) {
        console.log("exited at ", i, ", ", updates[i - 1])
        break;
      }
      let idx = updates[i];
      if (cells[idx] !== Cell.Alive) {
        continue;
      }
      let row = Math.floor(idx / width);
      let col = idx % width;
      bctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }

    bctx.fillStyle = DEAD_COLOR;
    for (let i = 0; i < updates.length; i++) {
      if (updates[i] < updates[i - 1]) {
        console.log("exited at ", i, ", ", updates[i - 1])
        break;
      }
      let idx = updates[i];
      if (cells[idx] !== Cell.Dead) {
        continue;
      }
      let row = Math.floor(idx / width);
      let col = idx % width;
      bctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE,
      );
    }

  bctx.stroke();
  ctx.drawImage(b_canvas, 0, 0)
};

canvas.addEventListener("click", event => {
  const boundingRect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;

  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  const canvasTop = (event.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
  const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

  universe.toggle_cell(row, col);
  console.log(row, col)
  drawCells();
  //drawGrid();
});

drawCells();
//drawGrid();
universe.tick();
pause();
