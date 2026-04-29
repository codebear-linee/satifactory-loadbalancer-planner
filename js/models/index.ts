export type Position = {
  x: number;
  y: number;
};

export type PanningData = {
  isPanning: boolean;
  lastPosition: Position;
};

export type ZoomingData = {
  zoomFactor: number;
};

export type OptionCallbackParams = { worldPosition: Position };

export type ContextMenuSelectOption = {
  label: string;
  callbackData: OptionCallbackParams;
  action: (params: OptionCallbackParams) => void;
};

export type IDrawableComponent = {
  id: string;
  moveTo(position: Position): void;
  draw(context: CanvasRenderingContext2D): void;
};

export type ComponentType =
  | 'Splitter'
  | 'Merger'
  | 'Input'
  | 'Helper Input'
  | 'Output';
