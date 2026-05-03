import { InputPort } from '../logical-elements';
import { IDrawableComponent, Port, PortIndex, Position } from '../models';
import { uniqueId } from '../util';

export abstract class DrawableComponent implements IDrawableComponent {
  public readonly id = uniqueId();
  public get position() {
    return this._position;
  }
  protected _position: Position = { x: 0, y: 0 };
  protected size = 60;
  protected portSize = 6;
  protected ports: Array<Port> = [];
  protected portPositionStartIndex: PortIndex = PortIndex.LEFT;

  public setPorts(ports: Array<Port>) {
    this.ports = ports;
  }

  public moveTo(position: Position) {
    this._position = position;
  }

  public abstract draw(context: CanvasRenderingContext2D): void;

  public contains({ x, y }: Position) {
    return (
      x >= this._position.x - this.size &&
      x <= this._position.x + this.size &&
      y >= this._position.y - this.size &&
      y <= this._position.y + this.size
    );
  }

  protected getTopMiddle() {
    return {
      x: this._position.x + this.size / 2,
      y: this._position.y,
    };
  }

  protected getLeftMiddle() {
    return {
      x: this._position.x,
      y: this._position.y + this.size / 2,
    };
  }

  protected getRightMiddle() {
    return {
      x: this._position.x + this.size,
      y: this._position.y + this.size / 2,
    };
  }

  protected getBottomMiddle() {
    return {
      x: this._position.x + this.size / 2,
      y: this._position.y + this.size,
    };
  }

  private getPortPositionByIndex(portIndex: number): Position {
    const positionOfInterestIndex = portIndex + this.portPositionStartIndex;
    return positionOfInterestIndex === 0
      ? this.getLeftMiddle()
      : positionOfInterestIndex === 1
        ? this.getTopMiddle()
        : positionOfInterestIndex === 2
          ? this.getRightMiddle()
          : this.getBottomMiddle();
  }

  public getPortByPosition(position: Position) {
    for (let portIndex = 0; portIndex < this.ports.length; portIndex++) {
      const portPosition = this.getPortPositionByIndex(portIndex);
      if (this.isInPortArea(position, portPosition)) {
        return { port: this.ports[portIndex], position: portPosition };
      }
    }
    return null;
  }

  private isInPortArea({ x, y }: Position, portPosition: Position): boolean {
    return (
      x >= portPosition.x - this.portSize &&
      x <= portPosition.x + this.portSize &&
      y >= portPosition.y - this.portSize &&
      y <= portPosition.y + this.portSize
    );
  }

  protected drawPort(
    context: CanvasRenderingContext2D,
    port: Port,
    portIndex: number,
  ) {
    const portPosition = this.getPortPositionByIndex(portIndex);

    const rotationDegrees =
      (portIndex + this.portPositionStartIndex) * 90 +
      (port instanceof InputPort ? 0 : 180);

    const angle = (rotationDegrees * Math.PI) / 180; // Convert to radians

    context.save(); // Save current state
    context.translate(portPosition.x, portPosition.y); // Move origin to triangle center
    context.rotate(angle); // Rotate around the new origin

    context.fillStyle = '#333';
    context.beginPath();
    // Draw triangle relative to (0,0) now
    context.moveTo(-this.portSize, -this.portSize);
    context.lineTo(-this.portSize, this.portSize);
    context.lineTo(this.portSize / 2, 0);
    context.closePath();
    context.fill();

    context.restore(); // Restore original state
  }

  public getPortPosition(port: Port): Position {
    for (let index = 0; index < this.ports.length; index++) {
      const componentPort = this.ports[index];
      if (componentPort.id === port.id) {
        return this.getPortPositionByIndex(index);
      }
    }
    throw new Error(
      `Port '${port.id}' is not part of this component. Possible ports are ${this.ports.map((port) => port.id).join(', ')}`,
    );
  }

  public getPortByIndex(index: number): Port {
    return this.ports[index];
  }
}
