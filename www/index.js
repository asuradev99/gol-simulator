import { Universe, Cell } from "wasm-game-of-life";
import { memory } from "wasm-game-of-life/wasm_game_of_life_bg";

const CELL_SIZE = 4; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";
const RENDER_MODE = 1;
// Construct the universe, and get its width and height.
const universe = Universe.new(500, 500);
const width = universe.width();
const height = universe.height();

// Give the canvas room for all of our cells and a 1px border
// around each of them.
const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const ctx = canvas.getContext('2d');


let animationId = null;

const renderLoop = () => {
  //ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCells();
  drawGrid();
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

const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  // Horizontal lines.
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0,                           j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
};

const getIndex = (row, column) => {
  return row * width + column;
};

const drawCells = () => {
  const cellsPtr = universe.cells();
  const updatesPtr = universe.updates();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);
  const updates = new Uint32Array(memory.buffer, updatesPtr, width * height / 5);

  ctx.beginPath();

  if (RENDER_MODE === 1) {
    // // Alive cells.
  ctx.fillStyle = ALIVE_COLOR;
  for (let i = 0; i < updates.length; i++) {
    if (updates[i] === 0 && i > 0) {
      console.log(updates.length)
      break;
    }
    let idx = updates[i];
    if (cells[idx] !== Cell.Alive) {
      continue;
    }
    let row = Math.floor(idx / width);
    let col = idx % width;
    ctx.fillRect(
      col * (CELL_SIZE + 1) + 1,
      row * (CELL_SIZE + 1) + 1,
      CELL_SIZE,
      CELL_SIZE
    );
  }

  ctx.fillStyle = "#FFCFFF";
  for (let i = 0; i < updates.length; i++) {
    if (updates[i] === 0 && i > 0) {
      break;
    }
    let idx = updates[i];
    if (cells[idx] !== Cell.Dead) {
      continue;
    }
    let row = Math.floor(idx / width);
    let col = idx % width;
    ctx.fillRect(
      col * (CELL_SIZE + 1) + 1,
      row * (CELL_SIZE + 1) + 1,
      CELL_SIZE,
      CELL_SIZE,
    ); 
  }
  } else {
    ctx.fillStyle = ALIVE_COLOR;
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(row, col);
        if (cells[idx] !== Cell.Alive) {
          continue;
        }
  
        ctx.fillRect(
          col * (CELL_SIZE + 1) + 1,
          row * (CELL_SIZE + 1) + 1,
          CELL_SIZE,
          CELL_SIZE
        );
      }
    }
  
    // Dead cells.
    ctx.fillStyle = DEAD_COLOR;
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(row, col);
        if (cells[idx] !== Cell.Dead) {
          continue;
        }
  
        ctx.fillRect(
          col * (CELL_SIZE + 1) + 1,
          row * (CELL_SIZE + 1) + 1,
          CELL_SIZE,
          CELL_SIZE
        );
      }
    }
  }
  
  ctx.stroke();
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

  drawCells();
  drawGrid();
});

play();
