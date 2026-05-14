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

export type PortByPositionInfo = {
  port: Port;
  position: Position;
};

export type IDrawableComponent = {
  id: string;
  position: Position;
  draw(context: CanvasRenderingContext2D): void;
  moveTo(position: Position): void;
  setPorts(ports: Array<Port>): void;
  contains(position: Position): boolean;
  getPortByPosition(position: Position): PortByPositionInfo | null;
  getPortPosition(port: Port): Position;
  getPortByIndex(index: number): Port;
};

export type ComponentType =
  | 'Splitter'
  | 'Merger'
  | 'Input'
  | 'Helper Input'
  | 'Output';

export type Port = {
  id: string;
  parentId: string;
};

export type ComponentDraggingData = {
  isDragging: boolean;
  componentId: string;
  offset: Position;
};

export enum PortIndex {
  LEFT = 0,
  UP = 1,
  RIGHT = 2,
  DOWN = 3,
}
