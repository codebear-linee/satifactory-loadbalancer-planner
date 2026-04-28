import { PanningData, Position, ZoomingData } from './models';

export class SatisfactoryCanvas {
  private readonly ctx: CanvasRenderingContext2D;

  private panning: PanningData = {
    isPanning: false,
    lastPosition: { x: 0, y: 0 },
  };
  private zooming: ZoomingData = {
    zoomFactor: 1.1,
  };

  private offset: Position = { x: 0, y: 0 };
  private scale: number = 1;

  constructor(private readonly canvasElement: HTMLCanvasElement) {
    this.canvasElement.width = window.innerWidth;
    this.canvasElement.height = window.innerHeight;

    this.ctx = this.canvasElement.getContext('2d')!;
    this.addPanningBehavior();
    this.addZoomingBehavior();

    // this.#addDoubleClickBehavior();
    // this.#contextMenu = new ContextMenu();

    this.redraw();
  }

  public getImage(): string {
    return this.canvasElement.toDataURL('image/png');
  }

  private redraw() {
    this.resetCanvas();

    this.drawGrid();
  }

  private resetCanvas() {
    this.ctx.restore();
    this.ctx.clearRect(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height,
    );
    this.ctx.save();
    this.ctx.translate(this.offset.x, this.offset.y);
    this.ctx.scale(this.scale, this.scale);
  }

  private addZoomingBehavior() {
    this.canvasElement.addEventListener('wheel', (e) => {
      e.preventDefault();

      const mousePosition: Position = {
        x: e.clientX - this.canvasElement.offsetLeft,
        y: e.clientY - this.canvasElement.offsetTop,
      };
      const { x: worldX, y: worldY } =
        this.getWorldCoordinatesFromScreenPosition(mousePosition);

      this.scale =
        e.deltaY < 0
          ? (this.scale *= this.zooming.zoomFactor)
          : (this.scale /= this.zooming.zoomFactor);

      this.offset = {
        x: mousePosition.x - worldX * this.scale,
        y: mousePosition.y - worldY * this.scale,
      };

      this.redraw();
    });
  }

  private getWorldCoordinatesFromMouseEvent(e: MouseEvent): Position {
    const screenPos = this.getScreenCoordinatesFromMouseEvent(e);
    return this.getWorldCoordinatesFromScreenPosition(screenPos);
  }

  private getScreenCoordinatesFromMouseEvent(e: MouseEvent): Position {
    return {
      x: e.clientX - this.canvasElement.offsetLeft,
      y: e.clientY - this.canvasElement.offsetTop,
    };
  }

  private getWorldCoordinatesFromScreenPosition(pos: Position): Position {
    return {
      x: (pos.x - this.offset.x) / this.scale,
      y: (pos.y - this.offset.y) / this.scale,
    };
  }

  private addPanningBehavior() {
    this.canvasElement.addEventListener('mousedown', (e) => {
      e.preventDefault();

      this.panning = {
        isPanning: true,
        lastPosition: {
          x: e.clientX,
          y: e.clientY,
        },
      };
    });

    this.canvasElement.addEventListener('mousemove', (e) => {
      e.preventDefault();

      if (this.panning.isPanning) {
        this.updateOffsetForPanning(e);
        this.redraw();
      }
    });

    this.canvasElement.addEventListener('mouseup', (e) => {
      e.preventDefault();

      if (this.panning.isPanning) {
        this.updateOffsetForPanning(e);
        this.redraw();
      }
      this.panning = {
        isPanning: false,
        lastPosition: {
          x: 0,
          y: 0,
        },
      };
    });
  }

  private updateOffsetForPanning(e: MouseEvent) {
    const dx = e.clientX - this.panning.lastPosition.x;
    const dy = e.clientY - this.panning.lastPosition.y;

    this.offset = {
      x: this.offset.x + dx,
      y: this.offset.y + dy,
    };

    this.panning.lastPosition = {
      x: e.clientX,
      y: e.clientY,
    };
  }

  private drawGrid() {
    const gridSize = 20;
    // Calculate visible bounds in world coordinates
    const minX = -this.offset.x / this.scale;
    const maxX = (this.canvasElement.width - this.offset.x) / this.scale;
    const minY = -this.offset.y / this.scale;
    const maxY = (this.canvasElement.height - this.offset.y) / this.scale;

    // Align to grid with epsilon to account for floating-point precision
    const startX = Math.floor(minX / gridSize - Number.EPSILON) * gridSize;
    const endX = Math.ceil(maxX / gridSize + Number.EPSILON) * gridSize;
    const startY = Math.floor(minY / gridSize - Number.EPSILON) * gridSize;
    const endY = Math.ceil(maxY / gridSize + Number.EPSILON) * gridSize;

    // Draw grid cells
    for (let x = startX; x <= endX; x += gridSize) {
      for (let y = startY; y <= endY; y += gridSize) {
        // Determine checkerboard pattern based on grid index
        const gridIndexX = Math.floor(x / gridSize);
        const gridIndexY = Math.floor(y / gridSize);
        const isEven = (gridIndexX + gridIndexY) % 2 === 0;

        this.ctx.fillStyle = isEven ? '#f0f0f0' : '#ffffff';
        this.ctx.fillRect(x, y, gridSize, gridSize);
      }
    }
  }
}
