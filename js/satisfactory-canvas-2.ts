import { ComponentManager } from './component-manager';
import {
  ComponentDraggingData,
  ComponentType,
  PanningData,
  Position,
  ZoomingData,
} from './models';
import { ContextMenu } from './visual-elements';

export class SatisfactoryCanvas {
  private readonly ctx: CanvasRenderingContext2D;

  private readonly componentManager = new ComponentManager();

  private panning: PanningData = {
    isPanning: false,
    lastPosition: { x: 0, y: 0 },
  };

  private componentDragging: ComponentDraggingData = {
    isDragging: false,
    componentId: '',
    offset: { x: 0, y: 0 },
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
    this.addContextInteraction();
    this.addComponentDragBehavior();

    this.redraw();
  }

  public getImage(): string {
    return this.canvasElement.toDataURL('image/png');
  }

  private redraw() {
    this.resetCanvas();

    this.drawGrid();

    this.componentManager.drawableComponent.forEach((component) => {
      component.draw(this.ctx);
    });
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

  private addContextInteraction() {
    const contextMenu = new ContextMenu();

    this.canvasElement.addEventListener('dblclick', (e) => {
      const screenPosition = this.getScreenCoordinatesFromMouseEvent(e);

      const worldPosition =
        this.getWorldCoordinatesFromScreenPosition(screenPosition);

      contextMenu.show(screenPosition, [
        {
          label: 'Splitter',
          callbackData: { worldPosition },
          action: (params) =>
            this.createComponent('Splitter', params.worldPosition),
        },
        {
          label: 'Merger',
          callbackData: { worldPosition },
          action: (params) =>
            this.createComponent('Merger', params.worldPosition),
        },
        {
          label: 'Input',
          callbackData: { worldPosition },
          action: (params) =>
            this.createComponent('Input', params.worldPosition),
        },
        {
          label: 'Helper Input',
          callbackData: { worldPosition },
          action: (params) =>
            this.createComponent('Helper Input', params.worldPosition),
        },
        {
          label: 'Output',
          callbackData: { worldPosition },
          action: (params) =>
            this.createComponent('Output', params.worldPosition),
        },
      ]);
    });

    this.canvasElement.addEventListener('click', () => {
      contextMenu.close();
    });
  }

  private createComponent(type: ComponentType, worldPosition: Position) {
    const component = this.componentManager.createComponent(type);
    component.moveTo(worldPosition);
    this.redraw();
  }

  private getScreenCoordinatesFromMouseEvent(e: MouseEvent) {
    return this.subtractPosition(this.getMousePositionFromEvent(e), {
      x: this.canvasElement.offsetLeft,
      y: this.canvasElement.offsetTop,
    });
  }

  private getMousePositionFromEvent(e: MouseEvent): Position {
    return { x: e.clientX, y: e.clientY };
  }

  private addZoomingBehavior() {
    this.canvasElement.addEventListener('wheel', (e) => {
      e.preventDefault();

      const screenPosition: Position =
        this.getScreenCoordinatesFromMouseEvent(e);
      const { x: worldX, y: worldY } =
        this.getWorldCoordinatesFromScreenPosition(screenPosition);

      this.scale =
        e.deltaY < 0
          ? (this.scale *= this.zooming.zoomFactor)
          : (this.scale /= this.zooming.zoomFactor);

      this.offset = {
        x: screenPosition.x - worldX * this.scale,
        y: screenPosition.y - worldY * this.scale,
      };

      this.redraw();
    });
  }

  private getWorldCoordinatesFromScreenPosition(pos: Position): Position {
    return {
      x: (pos.x - this.offset.x) / this.scale,
      y: (pos.y - this.offset.y) / this.scale,
    };
  }

  private getWorldCoordinatesFromMouseEvent(e: MouseEvent) {
    const screenPosition = this.getScreenCoordinatesFromMouseEvent(e);
    return this.getWorldCoordinatesFromScreenPosition(screenPosition);
  }

  private handleMouseDownEvent(e: MouseEvent) {
    e.preventDefault();

    const worldPosition = this.getWorldCoordinatesFromMouseEvent(e);

    const component =
      this.componentManager.getComponentByPosition(worldPosition);

    if (component === null) {
      this.panning = {
        isPanning: true,
        lastPosition: this.getMousePositionFromEvent(e),
      };
    } else {
      const offset = this.subtractPosition(worldPosition, component.position);

      this.componentDragging = {
        isDragging: true,
        componentId: component.id,
        offset,
      };
    }
  }

  private subtractPosition(pos1: Position, pos2: Position): Position {
    return {
      x: pos1.x - pos2.x,
      y: pos1.y - pos2.y,
    };
  }

  private addComponentDragBehavior() {
    this.canvasElement.addEventListener(
      'mousedown',
      this.handleMouseDownEvent.bind(this),
    );

    this.canvasElement.addEventListener('mousemove', (e) => {
      e.preventDefault();

      if (this.componentDragging.isDragging) {
        const worldPosition = this.getWorldCoordinatesFromMouseEvent(e);

        this.componentManager.drawableComponent
          .get(this.componentDragging.componentId)
          ?.moveTo(
            this.subtractPosition(worldPosition, this.componentDragging.offset),
          );
        this.redraw();
      }
    });

    this.canvasElement.addEventListener('mouseup', (e) => {
      e.preventDefault();

      if (this.componentDragging.isDragging) {
        const worldPosition = this.getWorldCoordinatesFromMouseEvent(e);

        this.componentManager.drawableComponent
          .get(this.componentDragging.componentId)
          ?.moveTo(
            this.subtractPosition(worldPosition, this.componentDragging.offset),
          );
        this.redraw();
      }

      this.componentDragging = {
        isDragging: false,
        componentId: '',
        offset: { x: 0, y: 0 },
      };
    });
  }

  private addPanningBehavior() {
    this.canvasElement.addEventListener(
      'mousedown',
      this.handleMouseDownEvent.bind(this),
    );

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
    const mousePosition = this.getMousePositionFromEvent(e);
    const delta = this.subtractPosition(
      mousePosition,
      this.panning.lastPosition,
    );

    this.offset = {
      x: this.offset.x + delta.x,
      y: this.offset.y + delta.y,
    };

    this.panning.lastPosition = mousePosition;
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
