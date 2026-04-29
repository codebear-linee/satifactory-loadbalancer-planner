import { InputPort, OutputPort } from './logical-elements';
import { ComponentType, IDrawableComponent, Port } from './models';
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
    let ports: Array<Port>;
    switch (componentType) {
      case 'Splitter':
        component = new Splitter();
        ports = [
          new InputPort(component.id),
          new OutputPort(component.id),
          new OutputPort(component.id),
          new OutputPort(component.id),
        ];
        break;
      case 'Merger':
        component = new Merger();
        ports = [
          new InputPort(component.id),
          new InputPort(component.id),
          new OutputPort(component.id),
          new InputPort(component.id),
        ];
        break;
      case 'Input':
        component = new Input();
        ports = [new OutputPort(component.id)];
        break;
      case 'Helper Input':
        component = new HelperInput();
        ports = [new OutputPort(component.id)];
        break;
      case 'Output':
        component = new Output();
        ports = [new InputPort(component.id)];
        break;
      default:
        throw new Error(`'${componentType}' not implemented`);
    }

    component.setPorts(ports);

    this.drawableComponent.set(component.id, component);

    return component;
  }
}
