import { DrawableComponent } from './drawable-component';

export class Splitter extends DrawableComponent {
  public draw(context: CanvasRenderingContext2D) {
    context.fillStyle = '#FF9800';
    context.fillRect(this.position.x, this.position.y, this.size, this.size);
    context.fillStyle = '#000';
    context.font = '12px Arial';
    context.textAlign = 'center';
    context.fillText(
      'S',
      this.position.x + this.size / 2,
      this.position.y + this.size / 2 + 4,
    );

    this.ports.forEach((port, index) => {
      this.drawPort(context, port, index);
    });
  }
}
