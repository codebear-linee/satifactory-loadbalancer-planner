import { ComponentManager } from './component-manager';
import { ConnectionManager } from './connection-manager';
import { InputPort, OutputPort } from './logical-elements';
import {
  ComponentDraggingData,
  ComponentType,
  IDrawableComponent,
  PanningData,
  Port,
  PortByPositionInfo,
  Position,
  ZoomingData,
} from './models';
import { ContextMenu, HelperInput } from './visual-elements';

type ConnectionDraggingData = {
  isDragging: boolean;
  startPort: Port | null;
  startPosition: Position;
  currentMousePosition: Position;
};

export class SatisfactoryCanvas {
  private readonly ctx: CanvasRenderingContext2D;

  private readonly componentManager = new ComponentManager();
  private readonly connectionManager = new ConnectionManager();

  private panning: PanningData = {
    isPanning: false,
    lastPosition: { x: 0, y: 0 },
  };

  private componentDragging: ComponentDraggingData = {
    isDragging: false,
    componentId: '',
    offset: { x: 0, y: 0 },
  };

  private connectionDragging: ConnectionDraggingData = {
    isDragging: false,
    startPort: null,
    startPosition: {
      x: 0,
      y: 0,
    },
    currentMousePosition: {
      x: 0,
      y: 0,
    },
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
    this.handleMouseDownEvent();
    this.handleMouseMoveEvent();
    this.handleMouseUpEvent();
    this.addZoomingBehavior();
    this.addContextInteraction();

    this.redraw();
  }

  public getImage(): string {
    return this.canvasElement.toDataURL('image/png');
  }

  private isValidConnectionTarget(
    elementInfo: {
      component: IDrawableComponent | null;
      portInfo: PortByPositionInfo | null;
    },
    fromPort: Port,
  ): boolean {
    if (elementInfo.component !== null) {
      return elementInfo.component instanceof HelperInput;
    }

    const portsAreDifferentTypes =
      (fromPort instanceof InputPort &&
        elementInfo.portInfo?.port instanceof OutputPort) ||
      (fromPort instanceof OutputPort &&
        elementInfo.portInfo?.port instanceof InputPort);

    return (
      elementInfo &&
      elementInfo.portInfo !== null &&
      elementInfo.portInfo.port.parentId !== fromPort.parentId &&
      portsAreDifferentTypes &&
      !this.connectionManager.hasConnection(elementInfo.portInfo.port)
    );
  }

  private redraw() {
    this.resetCanvas();

    this.drawGrid();

    this.componentManager.drawableComponent.forEach((component) => {
      component.draw(this.ctx);
    });

    this.drawConnections();

    this.drawDraggingConnection();
  }

  private drawConnections() {
    const connections = this.connectionManager.getConnections();

    for (let index = 0; index < connections.length; index++) {
      const connection = connections[index];

      const from = this.componentManager.getPortPosition(connection.sourcePort);
      const to = this.componentManager.getPortPosition(connection.targetPort);

      this.drawLine(from, to);
    }
  }

  private drawDraggingConnection() {
    if (this.connectionDragging.isDragging) {
      this.drawLine(
        this.connectionDragging.startPosition,
        this.connectionDragging.currentMousePosition,
      );
    }
  }

  private drawLine(from: Position, to: Position) {
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.stroke();
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

  private handleMouseDownEvent() {
    this.canvasElement.addEventListener('mousedown', (e) => {
      e.preventDefault();

      const worldPosition = this.getWorldCoordinatesFromMouseEvent(e);

      const { component, portInfo } =
        this.componentManager.getElementByPosition(worldPosition);

      if (portInfo !== null) {
        this.runConnectionDragMouseDownRoutine(worldPosition, portInfo);
      } else if (component !== null) {
        this.runComponentDragMouseDownRoutine(worldPosition, component);
      } else {
        this.runPanningMouseDownRoutine(e);
      }
    });
  }

  private handleMouseMoveEvent() {
    this.canvasElement.addEventListener('mousemove', (e) => {
      e.preventDefault();

      if (this.panning.isPanning) {
        this.runPanningMouseMoveRoutine(e);
      }
      if (this.componentDragging.isDragging) {
        this.runComponentDragMouseMoveRoutine(e);
      }
      if (this.connectionDragging.isDragging) {
        this.runConnectionDragMouseMoveRoutine(e);
      }
    });
  }

  private handleMouseUpEvent() {
    this.canvasElement.addEventListener('mouseup', (e) => {
      e.preventDefault();

      if (this.panning.isPanning) {
        this.runPanningMouseUpRoutine(e);
      }
      if (this.componentDragging.isDragging) {
        this.runComponentDragMouseUpRoutine(e);
      }
      if (this.connectionDragging.isDragging) {
        this.runConnectionDragMouseUpRoutine(e);
      }
    });
  }

  /**
   * CONNECTION DRAG
   */
  private runConnectionDragMouseDownRoutine(
    worldPosition: Position,
    portInfo: PortByPositionInfo,
  ) {
    const connectedPort = this.connectionManager.getConnectedPort(
      portInfo.port,
    );

    if (connectedPort === null) {
      this.connectionDragging = {
        isDragging: true,
        startPort: portInfo.port,
        startPosition: portInfo.position,
        currentMousePosition: worldPosition,
      };
    } else {
      const sourcePort =
        portInfo.port instanceof OutputPort ? portInfo.port : connectedPort;
      const targetPort =
        portInfo.port instanceof InputPort ? portInfo.port : connectedPort;

      const startPosition =
        this.componentManager.getPortPosition(connectedPort);
      this.connectionManager.removeConnection(sourcePort, targetPort);
      this.connectionDragging = {
        isDragging: true,
        startPort: connectedPort,
        startPosition,
        currentMousePosition: worldPosition,
      };
    }
  }

  private runConnectionDragMouseMoveRoutine(e: MouseEvent) {
    const currentMousePosition = this.getMousePositionFromEvent(e);
    this.connectionDragging = {
      ...this.connectionDragging,
      currentMousePosition,
    };
    this.redraw();
  }

  private runConnectionDragMouseUpRoutine(e: MouseEvent) {
    const worldPosition = this.getWorldCoordinatesFromMouseEvent(e);

    const elementInfo =
      this.componentManager.getElementByPosition(worldPosition);

    if (
      this.isValidConnectionTarget(
        elementInfo,
        this.connectionDragging.startPort!,
      )
    ) {
      if (elementInfo.portInfo !== null) {
        const sourcePort =
          this.connectionDragging.startPort instanceof OutputPort
            ? this.connectionDragging.startPort
            : elementInfo.portInfo.port;
        const targetPort =
          this.connectionDragging.startPort instanceof InputPort
            ? this.connectionDragging.startPort
            : elementInfo.portInfo.port;
        this.connectionManager.addConnection(sourcePort, targetPort);
      } else {
        // target was helper input
        const helperInputPort = elementInfo.component!.getPortByIndex(0);
        const helperInputTargetPort =
          this.connectionManager.getConnectedPort(helperInputPort);

        if (helperInputTargetPort) {
          this.connectionManager.removeConnection(
            helperInputPort,
            helperInputTargetPort,
          );

          this.connectionManager.addConnection(
            this.connectionDragging.startPort!,
            helperInputTargetPort,
          );

          this.componentManager.removeComponent(elementInfo.component!);
        }
      }
    }
    this.connectionDragging = {
      isDragging: false,
      startPort: null,
      startPosition: { x: 0, y: 0 },
      currentMousePosition: { x: 0, y: 0 },
    };

    this.redraw();
  }

  /**
   * PANNING
   */
  private runPanningMouseDownRoutine(e: MouseEvent) {
    this.panning = {
      isPanning: true,
      lastPosition: this.getMousePositionFromEvent(e),
    };
  }

  private runPanningMouseMoveRoutine(e: MouseEvent) {
    this.updateOffsetForPanning(e);
    this.redraw();
  }

  private runPanningMouseUpRoutine(e: MouseEvent) {
    this.updateOffsetForPanning(e);
    this.redraw();
    this.panning = {
      isPanning: false,
      lastPosition: {
        x: 0,
        y: 0,
      },
    };
  }

  /**
   * COMPONENT DRAGGING
   */
  private runComponentDragMouseDownRoutine(
    worldPosition: Position,
    component: IDrawableComponent,
  ) {
    const offset = this.subtractPosition(worldPosition, component.position);

    this.componentDragging = {
      isDragging: true,
      componentId: component.id,
      offset,
    };
  }

  private runComponentDragMouseMoveRoutine(e: MouseEvent) {
    const worldPosition = this.getWorldCoordinatesFromMouseEvent(e);

    this.componentManager.drawableComponent
      .get(this.componentDragging.componentId)
      ?.moveTo(
        this.subtractPosition(worldPosition, this.componentDragging.offset),
      );
    this.redraw();
  }

  private runComponentDragMouseUpRoutine(e: MouseEvent) {
    const worldPosition = this.getWorldCoordinatesFromMouseEvent(e);

    this.componentManager.drawableComponent
      .get(this.componentDragging.componentId)
      ?.moveTo(
        this.subtractPosition(worldPosition, this.componentDragging.offset),
      );
    this.redraw();

    this.componentDragging = {
      isDragging: false,
      componentId: '',
      offset: { x: 0, y: 0 },
    };
  }

  private subtractPosition(pos1: Position, pos2: Position): Position {
    return {
      x: pos1.x - pos2.x,
      y: pos1.y - pos2.y,
    };
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
