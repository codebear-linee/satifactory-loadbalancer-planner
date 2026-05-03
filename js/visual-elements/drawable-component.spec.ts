import { beforeEach, describe, expect, it } from 'vitest';
import { InputPort, OutputPort } from '../logical-elements';
import { Port } from '../models';
import { DrawableComponent } from './drawable-component';

class TestComponent extends DrawableComponent {
  public draw(): void {
    // no need to implement
  }
}

describe('DrawableComponent', () => {
  let testComponent: DrawableComponent;
  let ports: Array<Port> = [];

  beforeEach(() => {
    testComponent = new TestComponent();
    ports = [new InputPort(testComponent.id), new OutputPort(testComponent.id)];
    testComponent.setPorts(ports);
  });

  it('throws error, when trying to get a port position, for a port that is not part of the component', () => {
    expect(() =>
      testComponent.getPortPosition({
        id: 'port-id-not-part-of-component',
        parentId: 'not-the-correct-parent',
      }),
    ).toThrow(
      `Port 'port-id-not-part-of-component' is not part of this component. Possible ports are ${ports[0].id}, ${ports[1].id}`,
    );
  });
});
