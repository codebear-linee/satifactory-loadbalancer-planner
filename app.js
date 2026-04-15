const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Basic zoom/pan variables
let scale = 1;
let offsetX = 0;
let offsetY = 0;

// Event listeners for zoom/pan
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const zoomFactor = 1.1;
  const mouseX = e.clientX - canvas.offsetLeft;
  const mouseY = e.clientY - canvas.offsetTop;
  const worldX = (mouseX - offsetX) / scale;
  const worldY = (mouseY - offsetY) / scale;
  if (e.deltaY < 0) {
    scale *= zoomFactor;
  } else {
    scale /= zoomFactor;
  }
  offsetX = mouseX - worldX * scale;
  offsetY = mouseY - worldY * scale;
  redraw();
});

let isPanning = false;
let lastX, lastY;

canvas.addEventListener("mousedown", (e) => {
  if (e.button === 0) {
    // Left click for pan
    isPanning = true;
    lastX = e.clientX;
    lastY = e.clientY;
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isPanning) {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    offsetX += dx;
    offsetY += dy;
    lastX = e.clientX;
    lastY = e.clientY;
    redraw();
  }
});

canvas.addEventListener("mouseup", () => {
  isPanning = false;
});

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  // Draw checkered background
  const gridSize = 20;
  const minX = -offsetX / scale;
  const maxX = (canvas.width - offsetX) / scale;
  const minY = -offsetY / scale;
  const maxY = (canvas.height - offsetY) / scale;
  const startX = Math.floor(minX / gridSize) * gridSize;
  const endX = Math.ceil(maxX / gridSize) * gridSize;
  const startY = Math.floor(minY / gridSize) * gridSize;
  const endY = Math.ceil(maxY / gridSize) * gridSize;
  for (let x = startX; x < endX; x += gridSize) {
    for (let y = startY; y < endY; y += gridSize) {
      const isEven =
        (Math.floor(x / gridSize) + Math.floor(y / gridSize)) % 2 === 0;
      ctx.fillStyle = isEven ? "#f0f0f0" : "#ffffff";
      ctx.fillRect(x, y, gridSize, gridSize);
    }
  }
  ctx.restore();
}

redraw();
