import { Belt, HelperInput, PortOut } from './components.js';
import { ContextMenu } from './context-menu.js';

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

  #dragging = {
    isDragging: false,
    component: null,
    offset: {
      x: 0,
      y: 0,
    },
  };

  #beltPulling = {
    isPulling: false,
    port: null,
    offset: {
      x: 0,
      y: 0,
    },
    lineTo: {
      x: null,
      y: null,
    },
  };
  #belts = [];

  #ctx;
  #offset = { x: 0, y: 0 };
  #scale = 1;
  #components = [];
  #contextMenu;

  constructor(canvasElement) {
    this.#canvas = canvasElement;
    this.#canvas.width = window.innerWidth;
    this.#canvas.height = window.innerHeight;
    this.#ctx = this.#canvas.getContext('2d');

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

    if (this.#beltPulling.isPulling) {
      this.#ctx.strokeStyle = '#000';
      this.#ctx.lineWidth = 2;
      this.#ctx.beginPath();
      this.#ctx.moveTo(this.#beltPulling.port.x, this.#beltPulling.port.y);
      this.#ctx.lineTo(this.#beltPulling.lineTo.x, this.#beltPulling.lineTo.y);
      this.#ctx.stroke();
    }

    for (const component of this.#components) {
      component.draw(this.#ctx);
    }

    for (const belt of this.#belts) {
      belt.draw(this.#ctx);
    }

    this.#ctx.restore();
  }

  #getScreenCoordinatesFromMouseEvent(e) {
    return {
      x: e.clientX - this.#canvas.offsetLeft,
      y: e.clientY - this.#canvas.offsetTop,
    };
  }

  #getWorldCoordinatesFromMouseEvent(e) {
    const { x: screenX, y: screenY } =
      this.#getScreenCoordinatesFromMouseEvent(e);
    return this.#getWorldCoordinatesFromScreen(screenX, screenY);
  }

  #getWorldCoordinatesFromScreen(screenX, screenY) {
    return {
      x: (screenX - this.#offset.x) / this.#scale,
      y: (screenY - this.#offset.y) / this.#scale,
    };
  }

  #addComponentAtWorld(ComponentClass, worldX, worldY) {
    const component = new ComponentClass(worldX, worldY);
    component.updatePorts();
    this.#components.push(component);
    this.redraw();
  }

  #getContextMenuOptions() {
    return [
      {
        label: 'Input',
        action: (worldX, worldY) =>
          this.#createComponent('Input', worldX, worldY),
      },
      {
        label: 'Output',
        action: (worldX, worldY) =>
          this.#createComponent('Output', worldX, worldY),
      },
      {
        label: 'Merger',
        action: (worldX, worldY) =>
          this.#createComponent('Merger', worldX, worldY),
      },
      {
        label: 'Splitter',
        action: (worldX, worldY) =>
          this.#createComponent('Splitter', worldX, worldY),
      },
      {
        label: 'Helper Input',
        action: (worldX, worldY) =>
          this.#createComponent('HelperInput', worldX, worldY),
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
        this.#ctx.fillStyle = isEven ? '#f0f0f0' : '#ffffff';
        this.#ctx.fillRect(x, y, gridSize, gridSize);
      }
    }
  }

  #addZoomingBehavior() {
    this.#canvas.addEventListener('wheel', (e) => {
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
    this.#canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0 && e.detail === 1) {
        // Left click (detail === 1 excludes double-click)
        const { x: worldX, y: worldY } =
          this.#getWorldCoordinatesFromMouseEvent(e);

        const clickedPort = this.#getPortByCoordinates(worldX, worldY);

        const clickedComponent = this.#getComponentByCoordinates(
          worldX,
          worldY,
        );

        if (clickedPort) {
          const beltInfo = this.#getBeltForPort(clickedPort);
          if (beltInfo !== null) {
            this.#beltPulling = {
              isPulling: true,
              port: beltInfo.otherPort,
              offset: {
                x: worldX - clickedPort.x,
                y: worldY - clickedPort.y,
              },
            };
            this.#removeBelt(beltInfo.belt);
          } else {
            this.#beltPulling = {
              isPulling: true,
              port: clickedPort,
              offset: {
                x: worldX - clickedPort.x,
                y: worldY - clickedPort.y,
              },
            };
          }
        } else if (clickedComponent) {
          // Start dragging component
          this.#dragging.isDragging = true;
          this.#dragging.component = clickedComponent;
          this.#dragging.offset.x = worldX - clickedComponent.x;
          this.#dragging.offset.y = worldY - clickedComponent.y;
        } else {
          // Start panning
          this.#panning.isPanning = true;
          this.#panning.last.x = e.clientX;
          this.#panning.last.y = e.clientY;
        }
      }
    });

    this.#canvas.addEventListener('mousemove', (e) => {
      if (this.#beltPulling.isPulling && this.#beltPulling.port) {
        const { x: screenX, y: screenY } =
          this.#getScreenCoordinatesFromMouseEvent(e);
        this.#beltPulling.lineTo = { x: screenX, y: screenY };
        this.redraw();
      } else if (this.#dragging.isDragging && this.#dragging.component) {
        const { x: worldX, y: worldY } =
          this.#getWorldCoordinatesFromMouseEvent(e);

        this.#dragging.component.x = worldX - this.#dragging.offset.x;
        this.#dragging.component.y = worldY - this.#dragging.offset.y;
        this.#dragging.component.updatePorts();
        this.redraw();
      } else if (this.#panning.isPanning) {
        // Pan canvas
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

    this.#canvas.addEventListener('mouseup', (e) => {
      this.#dragging.isDragging = false;
      this.#dragging.component = null;
      this.#panning.isPanning = false;

      if (this.#beltPulling.isPulling) {
        const { x: worldX, y: worldY } =
          this.#getWorldCoordinatesFromMouseEvent(e);
        const clickedComponent = this.#getComponentByCoordinates(
          worldX,
          worldY,
        );
        let clickedPort = this.#getPortByCoordinates(worldX, worldY);

        if (
          clickedPort === null &&
          clickedComponent !== null &&
          clickedComponent instanceof HelperInput
        ) {
          const beltInfo = this.#getBeltForPort(clickedComponent.ports[0]);
          if (beltInfo !== null) {
            clickedPort = beltInfo.belt.targetPort;
            this.#removeBelt(beltInfo.belt);
            this.#removeComponent(clickedComponent);
          }
        }

        if (clickedPort !== null) {
          if (this.#isValidConnection(clickedPort)) {
            const sourcePort =
              clickedPort instanceof PortOut
                ? clickedPort
                : this.#beltPulling.port;
            const targetPort =
              sourcePort === clickedPort ? this.#beltPulling.port : clickedPort;

            this.#createBelt(sourcePort, targetPort);
          }
        }

        this.#beltPulling = {
          isPulling: false,
          port: null,
          offset: {
            x: 0,
            y: 0,
          },
          lineTo: {
            x: null,
            y: null,
          },
        };
      }

      this.redraw();
    });
  }

  #createBelt(sourcePort, targetPort) {
    this.#belts.push(new Belt(sourcePort, targetPort));
  }

  #removeBelt(belt) {
    this.#belts.splice(
      this.#belts.findIndex((_belt) => _belt === belt),
      1,
    );
  }

  #getComponentByCoordinates(worldX, worldY) {
    for (const component of this.#components) {
      if (component.contains(worldX, worldY)) {
        return component;
      }
    }
    return null;
  }

  #getPortByCoordinates(worldX, worldY) {
    for (const component of this.#components) {
      for (const port of component.ports) {
        if (port.contains(worldX, worldY)) {
          return port;
        }
      }
    }
    return null;
  }

  #isValidConnection(port) {
    if (this.#beltPulling.port.type === port.type) {
      return false;
    }

    for (const belt of this.#belts) {
      if (belt.sourcePort === port || belt.targetPort === port) {
        return false;
      }
    }

    return true;
  }

  #getBeltForPort(port) {
    for (const belt of this.#belts) {
      if (belt.sourcePort === port) {
        return {
          belt,
          otherPort: belt.targetPort,
        };
      }

      if (belt.targetPort === port) {
        return {
          belt,
          otherPort: belt.sourcePort,
        };
      }
    }

    return null;
  }

  #addDoubleClickBehavior() {
    this.#canvas.addEventListener('dblclick', (e) => {
      const { x: worldX, y: worldY } =
        this.#getWorldCoordinatesFromMouseEvent(e);

      this.#contextMenu.show(
        e.clientX,
        e.clientY,
        worldX,
        worldY,
        this.#getContextMenuOptions(),
      );
    });

    // Close context menu on canvas click
    this.#canvas.addEventListener('click', () => {
      this.#contextMenu.close();
    });
  }

  #createComponent(type, worldX, worldY) {
    // Import dynamically to avoid circular dependency
    import('./components.js').then((module) => {
      const ComponentClass = module[type];
      if (ComponentClass) {
        this.#addComponentAtWorld(ComponentClass, worldX, worldY);
      }
    });
  }

  #removeComponent(component) {
    this.#components.splice(
      this.#components.findIndex((_component) => _component === component),
      1,
    );
  }
}
