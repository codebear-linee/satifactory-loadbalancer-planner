import { DrawableComponent } from './drawable-component';

export class HelperInput extends DrawableComponent {
  size = 40;

  public draw(context: CanvasRenderingContext2D) {
    context.fillStyle = '#9C27B0';
    context.fillRect(this.position.x, this.position.y, this.size, this.size);
    context.fillStyle = '#000';
    context.font = '12px Arial';
    context.textAlign = 'center';
    context.fillText(
      'H',
      this.position.x + this.size / 2,
      this.position.y + this.size / 2 + 4,
    );
  }
}
