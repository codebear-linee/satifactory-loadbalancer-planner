import { createHash } from 'crypto';

export const uniqueId = () => {
  const dateString = Date.now().toString(36);
  const randomness = Math.random().toString(36).substr(2);
  return dateString + randomness;
};

export const getCanvasImageHash = (canvas: HTMLCanvasElement): string => {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const hash = createHash('sha256');
  hash.update(imageData);
  return hash.digest('hex');
};
