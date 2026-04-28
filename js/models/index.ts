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
