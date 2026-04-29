import { DrawableComponent } from './drawable-component';

export class Merger extends DrawableComponent {
  public draw(context: CanvasRenderingContext2D) {
    context.fillStyle = '#2196F3';
    context.fillRect(this.position.x, this.position.y, this.size, this.size);
    context.fillStyle = '#000';
    context.font = '12px Arial';
    context.textAlign = 'center';
    context.fillText(
      'M',
      this.position.x + this.size / 2,
      this.position.y + this.size / 2 + 4,
    );
  }
}
