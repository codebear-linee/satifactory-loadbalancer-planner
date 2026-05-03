import { fireEvent, getByText, queryByText } from '@testing-library/dom';
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  Mock,
  vi,
} from 'vitest';
import { SatisfactoryCanvas } from './satisfactory-canvas-2';

describe('Satisfactory Canvas', () => {
  let satisfactoryCanvas: SatisfactoryCanvas;
  let mockCanvasElement: HTMLCanvasElement;

  const windowInnerWidthSpy: Mock<() => number> = vi
    .spyOn(window, 'innerWidth', 'get')
    .mockImplementation(() => 400);
  const windowInnerHeightSpy: Mock<() => number> = vi
    .spyOn(window, 'innerHeight', 'get')
    .mockImplementation(() => 400);

  beforeEach(() => {
    mockCanvasElement = document.createElement('canvas');
    document.body.appendChild(mockCanvasElement);
    satisfactoryCanvas = new SatisfactoryCanvas(mockCanvasElement);
  });

  afterEach(() => {
    mockCanvasElement.remove();
  });

  afterAll(() => {
    windowInnerWidthSpy.mockClear();
    windowInnerHeightSpy.mockClear();
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

      it('pans when a component is present, but background was clicked', () => {
        const elPos = { x: 100, y: 100 };
        fireEvent.doubleClick(mockCanvasElement, {
          clientX: elPos.x,
          clientY: elPos.y,
        });
        const optionToClick = getByText(document.body, 'Splitter');

        fireEvent.click(optionToClick);

        fireEvent.mouseDown(mockCanvasElement, {
          clientX: elPos.x + 100,
          clientY: elPos.y + 100,
        });
        fireEvent.mouseMove(mockCanvasElement, {
          clientX: 213,
          clientY: 317,
        });
        fireEvent.mouseUp(mockCanvasElement, {
          clientX: 213,
          clientY: 317,
        });

        expect(satisfactoryCanvas.getImage()).toMatchSnapshot();
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

    describe('moving components', () => {
      it('moves component, when dragging it', () => {
        const elPos = { x: 100, y: 100 };
        fireEvent.doubleClick(mockCanvasElement, {
          clientX: elPos.x,
          clientY: elPos.y,
        });
        const optionToClick = getByText(document.body, 'Splitter');

        fireEvent.click(optionToClick);

        fireEvent.mouseDown(mockCanvasElement, {
          clientX: elPos.x + 5,
          clientY: elPos.y + 5,
        });
        fireEvent.mouseMove(mockCanvasElement, {
          clientX: 317,
          clientY: 317,
        });
        fireEvent.mouseUp(mockCanvasElement, {
          clientX: 317,
          clientY: 317,
        });

        expect(satisfactoryCanvas.getImage()).toMatchSnapshot();
      });
    });

    describe('connecting components', () => {
      const drawMerger = (x: number, y: number) => {
        const size = 60;
        const pos = { x, y };
        const inPort1 = {
          x: pos.x,
          y: pos.y + size / 2,
        };
        const inPort2 = {
          x: pos.x + size / 2,
          y: pos.y,
        };

        fireEvent.doubleClick(mockCanvasElement, {
          clientX: pos.x,
          clientY: pos.y,
        });
        const mergerOption = getByText(document.body, 'Merger');

        fireEvent.click(mergerOption);

        return {
          size,
          pos,
          inPort1,
          inPort2,
        };
      };

      const drawSplitter = (x: number, y: number) => {
        const size = 60;
        const pos = { x, y };
        const outPort2 = {
          x: pos.x + size,
          y: pos.y + size / 2,
        };
        const inPort = {
          x: pos.x,
          y: pos.y + size / 2,
        };

        fireEvent.doubleClick(mockCanvasElement, {
          clientX: pos.x,
          clientY: pos.y,
        });
        const splitterOption = getByText(document.body, 'Splitter');

        fireEvent.click(splitterOption);

        return {
          size,
          pos,
          outPort2,
          inPort,
        };
      };

      const drawHelperInput = (x: number, y: number) => {
        const size = 40;
        const pos = { x, y };
        const outPort = {
          x: pos.x + size,
          y: pos.y + size / 2,
        };

        fireEvent.doubleClick(mockCanvasElement, {
          clientX: pos.x,
          clientY: pos.y,
        });
        const splitterOption = getByText(document.body, 'Helper Input');

        fireEvent.click(splitterOption);

        return {
          size,
          pos,
          outPort,
        };
      };

      const drawInput = (x: number, y: number) => {
        const size = 40;
        const pos = { x, y };
        const outPort = {
          x: pos.x + size,
          y: pos.y + size / 2,
        };

        fireEvent.doubleClick(mockCanvasElement, {
          clientX: pos.x,
          clientY: pos.y,
        });
        const splitterOption = getByText(document.body, 'Input');

        fireEvent.click(splitterOption);

        return {
          size,
          pos,
          outPort,
        };
      };

      it('drags line from clicked port to current mouse position', () => {
        const splitterInfo = drawSplitter(100, 100);

        fireEvent.mouseDown(mockCanvasElement, {
          clientX: splitterInfo.outPort2.x,
          clientY: splitterInfo.outPort2.y,
        });
        fireEvent.mouseMove(mockCanvasElement, {
          clientX: splitterInfo.outPort2.x + 40,
          clientY: splitterInfo.outPort2.y + 20,
        });

        expect(satisfactoryCanvas.getImage()).toMatchSnapshot();
      });
      it('connects two ports with a line when connected', () => {
        const splitterInfo = drawSplitter(100, 100);
        const mergerInfo = drawMerger(200, 200);

        fireEvent.mouseDown(mockCanvasElement, {
          clientX: splitterInfo.outPort2.x,
          clientY: splitterInfo.outPort2.y,
        });
        fireEvent.mouseUp(mockCanvasElement, {
          clientX: mergerInfo.inPort1.x,
          clientY: mergerInfo.inPort1.y,
        });

        fireEvent.mouseDown(mockCanvasElement, {
          clientX: mergerInfo.pos.x + 5,
          clientY: mergerInfo.pos.y + 5,
        });
        fireEvent.mouseUp(mockCanvasElement, {
          clientX: mergerInfo.pos.x + mergerInfo.size + 50,
          clientY: mergerInfo.pos.y + mergerInfo.size - 70,
        });

        expect(satisfactoryCanvas.getImage()).toMatchSnapshot();
      });

      it('replaces helper input connection with direct connection, when belt is released on a helper input', () => {
        const splitterInfo = drawSplitter(100, 100);
        const mergerInfo = drawMerger(200, 200);
        const helperInputInfo = drawHelperInput(150, 10);

        fireEvent.mouseDown(mockCanvasElement, {
          clientX: helperInputInfo.outPort.x,
          clientY: helperInputInfo.outPort.y,
        });
        fireEvent.mouseUp(mockCanvasElement, {
          clientX: mergerInfo.inPort1.x,
          clientY: mergerInfo.inPort1.y,
        });

        fireEvent.mouseDown(mockCanvasElement, {
          clientX: splitterInfo.outPort2.x,
          clientY: splitterInfo.outPort2.y,
        });
        fireEvent.mouseUp(mockCanvasElement, {
          clientX: helperInputInfo.pos.x + 5,
          clientY: helperInputInfo.pos.y + 5,
        });

        expect(satisfactoryCanvas.getImage()).toMatchSnapshot();
      });

      it('detaches connection, when clicking an already connected port', () => {
        const splitterInfo = drawSplitter(100, 100);
        const mergerInfo = drawMerger(200, 200);

        fireEvent.mouseDown(mockCanvasElement, {
          clientX: splitterInfo.outPort2.x,
          clientY: splitterInfo.outPort2.y,
        });
        fireEvent.mouseUp(mockCanvasElement, {
          clientX: mergerInfo.inPort1.x,
          clientY: mergerInfo.inPort1.y,
        });

        fireEvent.mouseDown(mockCanvasElement, {
          clientX: mergerInfo.inPort1.x,
          clientY: mergerInfo.inPort1.y,
        });
        fireEvent.mouseMove(mockCanvasElement, {
          clientX: splitterInfo.outPort2.x + 40,
          clientY: splitterInfo.outPort2.y + 20,
        });

        expect(satisfactoryCanvas.getImage()).toMatchSnapshot();
      });

      it('connects to a new port, when releasing on a valid port type', () => {
        const splitterInfo = drawSplitter(100, 100);
        const mergerInfo = drawMerger(200, 200);

        fireEvent.mouseDown(mockCanvasElement, {
          clientX: splitterInfo.outPort2.x,
          clientY: splitterInfo.outPort2.y,
        });
        fireEvent.mouseUp(mockCanvasElement, {
          clientX: mergerInfo.inPort1.x,
          clientY: mergerInfo.inPort1.y,
        });

        fireEvent.mouseDown(mockCanvasElement, {
          clientX: mergerInfo.inPort1.x,
          clientY: mergerInfo.inPort1.y,
        });
        fireEvent.mouseUp(mockCanvasElement, {
          clientX: mergerInfo.inPort2.x,
          clientY: mergerInfo.inPort2.y,
        });

        expect(satisfactoryCanvas.getImage()).toMatchSnapshot();
      });

      it('does not connect to a new port, when releasing on an invalid port type', () => {
        const splitterInfo = drawSplitter(100, 100);
        const mergerInfo = drawMerger(200, 200);

        fireEvent.mouseDown(mockCanvasElement, {
          clientX: splitterInfo.outPort2.x,
          clientY: splitterInfo.outPort2.y,
        });
        fireEvent.mouseUp(mockCanvasElement, {
          clientX: mergerInfo.inPort1.x,
          clientY: mergerInfo.inPort1.y,
        });

        fireEvent.mouseDown(mockCanvasElement, {
          clientX: splitterInfo.outPort2.x,
          clientY: splitterInfo.outPort2.y,
        });
        fireEvent.mouseUp(mockCanvasElement, {
          clientX: splitterInfo.inPort.x,
          clientY: splitterInfo.inPort.y,
        });

        expect(satisfactoryCanvas.getImage()).toMatchSnapshot();
      });

      it('does not connect to a new port, when releasing on a port that is already connected', () => {
        const splitterInfo = drawSplitter(100, 100);
        const mergerInfo = drawMerger(200, 200);
        const inputInfo = drawInput(150, 10);

        fireEvent.mouseDown(mockCanvasElement, {
          clientX: inputInfo.outPort.x,
          clientY: inputInfo.outPort.y,
        });
        fireEvent.mouseUp(mockCanvasElement, {
          clientX: mergerInfo.inPort1.x,
          clientY: mergerInfo.inPort1.y,
        });

        fireEvent.mouseDown(mockCanvasElement, {
          clientX: splitterInfo.outPort2.x,
          clientY: splitterInfo.outPort2.y,
        });
        fireEvent.mouseUp(mockCanvasElement, {
          clientX: mergerInfo.inPort1.x,
          clientY: mergerInfo.inPort1.y,
        });

        expect(satisfactoryCanvas.getImage()).toMatchSnapshot();
      });

      it('does not connect to a port, that belongs to the same component', () => {
        const splitterInfo = drawSplitter(100, 100);

        fireEvent.mouseDown(mockCanvasElement, {
          clientX: splitterInfo.outPort2.x,
          clientY: splitterInfo.outPort2.y,
        });
        fireEvent.mouseUp(mockCanvasElement, {
          clientX: splitterInfo.inPort.x,
          clientY: splitterInfo.inPort.y,
        });

        expect(satisfactoryCanvas.getImage()).toMatchSnapshot();
      });
    });
  });
});
