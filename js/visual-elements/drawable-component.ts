import { IDrawableComponent, Position } from '../models';
import { uniqueId } from '../util';

export abstract class DrawableComponent implements IDrawableComponent {
  public readonly id = uniqueId();
  protected position: Position = { x: 0, y: 0 };
  protected size = 60;

  public moveTo(position: Position) {
    this.position = position;
  }

  public abstract draw(context: CanvasRenderingContext2D): void;
}
