import { ContextMenu } from "./context-menu.js";

export class SatisfactoryCanvas {
  #canvas;
  #zoomFactor = 1.1;
  #panning = {
    isPanning: false,
    last: {
      x: undefined,
      y: undefined,
    },
  };

  #ctx;
  #offset = { x: 0, y: 0 };
  #scale = 1;
  #components = [];
  #contextMenu;

  constructor(canvasElement) {
    this.#canvas = canvasElement;
    this.#canvas.width = window.innerWidth;
    this.#canvas.height = window.innerHeight;
    this.#ctx = this.#canvas.getContext("2d");

    this.#addZoomingBehavior();
    this.#addPanningBehavior();
    this.#addDoubleClickBehavior();
    this.#contextMenu = new ContextMenu();
  }

  redraw() {
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    this.#ctx.save();
    this.#ctx.translate(this.#offset.x, this.#offset.y);
    this.#ctx.scale(this.#scale, this.#scale);

    this.drawGrid();

    // Draw all components
    for (const component of this.#components) {
      component.draw(this.#ctx);
    }

    this.#ctx.restore();
  }

  #getWorldCoordinates(screenX, screenY) {
    return {
      x: (screenX - this.#offset.x) / this.#scale,
      y: (screenY - this.#offset.y) / this.#scale,
    };
  }

  #addComponentAtWorld(ComponentClass, worldX, worldY) {
    const component = new ComponentClass(worldX, worldY);
    this.#components.push(component);
    this.redraw();
  }

  #getContextMenuOptions() {
    return [
      {
        label: "Input",
        action: (worldX, worldY) =>
          this.#createComponent("Input", worldX, worldY),
      },
      {
        label: "Output",
        action: (worldX, worldY) =>
          this.#createComponent("Output", worldX, worldY),
      },
      {
        label: "Merger",
        action: (worldX, worldY) =>
          this.#createComponent("Merger", worldX, worldY),
      },
      {
        label: "Splitter",
        action: (worldX, worldY) =>
          this.#createComponent("Splitter", worldX, worldY),
      },
      {
        label: "Helper Input",
        action: (worldX, worldY) =>
          this.#createComponent("HelperInput", worldX, worldY),
      },
    ];
  }

  drawGrid() {
    const gridSize = 20;
    const minX = -this.#offset.x / this.#scale;
    const maxX = (this.#canvas.width - this.#offset.x) / this.#scale;
    const minY = -this.#offset.y / this.#scale;
    const maxY = (this.#canvas.height - this.#offset.y) / this.#scale;
    const startX = Math.floor(minX / gridSize) * gridSize;
    const endX = Math.ceil(maxX / gridSize) * gridSize;
    const startY = Math.floor(minY / gridSize) * gridSize;
    const endY = Math.ceil(maxY / gridSize) * gridSize;
    for (let x = startX; x < endX; x += gridSize) {
      for (let y = startY; y < endY; y += gridSize) {
        const isEven =
          (Math.floor(x / gridSize) + Math.floor(y / gridSize)) % 2 === 0;
        this.#ctx.fillStyle = isEven ? "#f0f0f0" : "#ffffff";
        this.#ctx.fillRect(x, y, gridSize, gridSize);
      }
    }
  }

  #addZoomingBehavior() {
    this.#canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const mouseX = e.clientX - this.#canvas.offsetLeft;
      const mouseY = e.clientY - this.#canvas.offsetTop;
      const worldX = (mouseX - this.#offset.x) / this.#scale;
      const worldY = (mouseY - this.#offset.y) / this.#scale;

      this.#scale =
        e.deltaY < 0
          ? (this.#scale *= this.#zoomFactor)
          : (this.#scale /= this.#zoomFactor);

      this.#offset = {
        x: mouseX - worldX * this.#scale,
        y: mouseY - worldY * this.#scale,
      };

      this.redraw();
    });
  }

  #addPanningBehavior() {
    this.#canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0 && e.detail === 1) {
        // Left click for pan (detail === 1 excludes double-click)
        this.#panning.isPanning = true;
        this.#panning.last.x = e.clientX;
        this.#panning.last.y = e.clientY;
      }
    });

    this.#canvas.addEventListener("mousemove", (e) => {
      if (this.#panning.isPanning) {
        const dx = e.clientX - this.#panning.last.x;
        const dy = e.clientY - this.#panning.last.y;
        this.#offset.x += dx;
        this.#offset.y += dy;
        this.#panning.last = {
          x: e.clientX,
          y: e.clientY,
        };
        this.redraw();
      }
    });

    this.#canvas.addEventListener("mouseup", () => {
      this.#panning.isPanning = false;
    });
  }

  #addDoubleClickBehavior() {
    this.#canvas.addEventListener("dblclick", (e) => {
      const screenX = e.clientX - this.#canvas.offsetLeft;
      const screenY = e.clientY - this.#canvas.offsetTop;
      const { x: worldX, y: worldY } = this.#getWorldCoordinates(
        screenX,
        screenY,
      );

      this.#contextMenu.show(
        e.clientX,
        e.clientY,
        worldX,
        worldY,
        this.#getContextMenuOptions(),
      );
    });

    // Close context menu on canvas click
    this.#canvas.addEventListener("click", () => {
      this.#contextMenu.close();
    });
  }

  #createComponent(type, worldX, worldY) {
    // Import dynamically to avoid circular dependency
    import("./components.js").then((module) => {
      const ComponentClass = module[type];
      if (ComponentClass) {
        this.#addComponentAtWorld(ComponentClass, worldX, worldY);
      }
    });
  }
}
