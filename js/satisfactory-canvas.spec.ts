import { fireEvent, getByText, queryByText } from '@testing-library/dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SatisfactoryCanvas } from './satisfactory-canvas-2';

describe('Satisfactory Canvas', () => {
  let satisfactoryCanvas: SatisfactoryCanvas;
  let mockCanvasElement: HTMLCanvasElement;

  beforeEach(() => {
    mockCanvasElement = document.createElement('canvas');
    document.body.appendChild(mockCanvasElement);
    satisfactoryCanvas = new SatisfactoryCanvas(mockCanvasElement);
  });

  afterEach(() => {
    mockCanvasElement.remove();
  });

  it('has the size of the window', () => {
    expect(mockCanvasElement.width).toBe(window.innerWidth);
    expect(mockCanvasElement.height).toBe(window.innerHeight);
  });

  it('has a background pattern', () => {
    expect(satisfactoryCanvas.getImage()).toMatchSnapshot();
  });

  describe('navigating', () => {
    describe('panning', () => {
      it.each([
        {
          start: { x: 100, y: 100 },
          end: { x: 113, y: 100 },
          panDirection: 'left',
          dragDirection: 'right',
        },
        {
          start: { x: 100, y: 100 },
          end: { x: 87, y: 100 },
          panDirection: 'right',
          dragDirection: 'left',
        },
        {
          start: { x: 100, y: 100 },
          end: { x: 100, y: 113 },
          panDirection: 'top',
          dragDirection: 'bottom',
        },
        {
          start: { x: 100, y: 100 },
          end: { x: 100, y: 87 },
          panDirection: 'bottom',
          dragDirection: 'top',
        },
      ])(
        'pans to the $panDirection, when mouse is clicked and dragged to the $dragDirection',
        ({ start, end }) => {
          fireEvent.mouseDown(mockCanvasElement, {
            clientX: start.x,
            clientY: start.y,
          });
          fireEvent.mouseMove(mockCanvasElement, {
            clientX: end.x,
            clientY: end.y,
          });
          fireEvent.mouseUp(mockCanvasElement, {
            clientX: end.x,
            clientY: end.y,
          });

          expect(satisfactoryCanvas.getImage()).toMatchSnapshot();
        },
      );

      it('does not pan when not clicking the canvas first', () => {
        const initialPanningImage = satisfactoryCanvas.getImage();

        fireEvent.mouseMove(mockCanvasElement, {
          clientX: 100,
          clientY: 100,
        });
        fireEvent.mouseUp(mockCanvasElement, {
          clientX: 100,
          clientY: 100,
        });

        expect(satisfactoryCanvas.getImage()).toStrictEqual(
          initialPanningImage,
        );
      });
    });

    describe('zooming', () => {
      const zoomInEvent = {
        deltaY: -100,
      };
      const zoomOutEvent = {
        deltaY: 100,
      };
      it('zooms in by one tick', () => {
        fireEvent.wheel(mockCanvasElement, zoomInEvent);

        expect(satisfactoryCanvas.getImage()).toMatchSnapshot();
      });
      it('zooms in by multiple ticks', () => {
        fireEvent.wheel(mockCanvasElement, zoomInEvent);
        fireEvent.wheel(mockCanvasElement, zoomInEvent);
        fireEvent.wheel(mockCanvasElement, zoomInEvent);

        expect(satisfactoryCanvas.getImage()).toMatchSnapshot();
      });
      it('zooms out by one tick', () => {
        fireEvent.wheel(mockCanvasElement, zoomOutEvent);

        expect(satisfactoryCanvas.getImage()).toMatchSnapshot();
      });
      it('zooms out by multiple ticks', () => {
        fireEvent.wheel(mockCanvasElement, zoomOutEvent);
        fireEvent.wheel(mockCanvasElement, zoomOutEvent);
        fireEvent.wheel(mockCanvasElement, zoomOutEvent);

        expect(satisfactoryCanvas.getImage()).toMatchSnapshot();
      });
      it('zoom-in and zoom-out intervals are equal', () => {
        const initialZoomImage = satisfactoryCanvas.getImage();

        fireEvent.wheel(mockCanvasElement, zoomInEvent);
        fireEvent.wheel(mockCanvasElement, zoomOutEvent);

        expect(satisfactoryCanvas.getImage()).toStrictEqual(initialZoomImage);
      });
    });
  });

  describe('interacting', () => {
    describe('context menu display', () => {
      afterEach(() => {
        document.querySelectorAll('.context-menu').forEach((el) => el.remove());
      });
      it('shows a context menu with all options', () => {
        fireEvent.doubleClick(mockCanvasElement, {
          clientX: 100,
          clientY: 100,
        });

        expect(getByText(document.body, 'Splitter')).toBeDefined();
        expect(getByText(document.body, 'Merger')).toBeDefined();
        expect(getByText(document.body, 'Input')).toBeDefined();
        expect(getByText(document.body, 'Helper Input')).toBeDefined();
        expect(getByText(document.body, 'Output')).toBeDefined();
      });

      it('hides the context menu when clicking again somewhere outside the context menu', () => {
        fireEvent.doubleClick(mockCanvasElement, {
          clientX: 100,
          clientY: 100,
        });
        expect(getByText(document.body, 'Splitter')).toBeDefined();

        fireEvent.click(mockCanvasElement, {
          clientX: 75,
          clientY: 75,
        });

        expect(queryByText(document.body, 'Splitter')).toBeNull();
      });

      it('hides the context menu when clicking one of the options', () => {
        fireEvent.doubleClick(mockCanvasElement, {
          clientX: 100,
          clientY: 100,
        });
        const optionToClick = getByText(document.body, 'Splitter');

        fireEvent.click(optionToClick);

        expect(queryByText(document.body, 'Splitter')).toBeNull();
      });

      describe('context menu options', () => {
        it.each([
          { component: 'Splitter' },
          { component: 'Merger' },
          { component: 'Input' },
          { component: 'Helper Input' },
          { component: 'Output' },
        ])('creates a $component', ({ component }) => {
          fireEvent.doubleClick(mockCanvasElement, {
            clientX: 100,
            clientY: 100,
          });
          const optionToClick = getByText(document.body, component);

          fireEvent.click(optionToClick);

          expect(satisfactoryCanvas.getImage()).toMatchSnapshot();
        });
      });
    });
  });
});
