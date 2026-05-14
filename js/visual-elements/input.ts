import { PortIndex } from '../models';
import { DrawableComponent } from './drawable-component';

export class Input extends DrawableComponent {
  portPositionStartIndex = PortIndex.RIGHT;
  size = 40;

  public draw(context: CanvasRenderingContext2D) {
    context.fillStyle = '#4CAF50';
    context.fillRect(this._position.x, this._position.y, this.size, this.size);
    context.fillStyle = '#000';
    context.font = '12px Arial';
    context.textAlign = 'center';
    context.fillText(
      'IN',
      this._position.x + this.size / 2,
      this._position.y + this.size / 2 + 4,
    );

    this.ports.forEach((port, index) => {
      this.drawPort(context, port, index);
    });
  }
}
