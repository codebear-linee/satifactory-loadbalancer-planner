import { describe, expect, it } from 'vitest';
import { ComponentManager } from './component-manager';
import { ComponentType } from './models';

describe('ComponentManager', () => {
  describe('uncovered edge cases', () => {
    it('throws an error, when trying to create an undefined component', () => {
      const componentManager = new ComponentManager();

      const undefinedComponentType =
        'undefined component type' as ComponentType;

      expect(() =>
        componentManager.createComponent(undefinedComponentType),
      ).toThrow(`'${undefinedComponentType}' not implemented`);
    });
  });
});
