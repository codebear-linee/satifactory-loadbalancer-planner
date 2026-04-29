import { ComponentType, IDrawableComponent } from './models';
import {
  HelperInput,
  Input,
  Merger,
  Output,
  Splitter,
} from './visual-elements';

export class ComponentManager {
  public readonly drawableComponent: Map<string, IDrawableComponent> =
    new Map();

  public createComponent(componentType: ComponentType): IDrawableComponent {
    let component: IDrawableComponent;
    switch (componentType) {
      case 'Splitter':
        component = new Splitter();
        break;
      case 'Merger':
        component = new Merger();
        break;
      case 'Input':
        component = new Input();
        break;
      case 'Helper Input':
        component = new HelperInput();
        break;
      case 'Output':
        component = new Output();
        break;
      default:
        throw new Error(`${componentType} not implemented`);
    }

    this.drawableComponent.set(component.id, component);

    return component;
  }
}
