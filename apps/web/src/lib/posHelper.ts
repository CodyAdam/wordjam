import { Position } from '../types/board';

export function screenToWorld(pos: Position, offsetX: number, offsetY: number, scale: number) {
  return {
    x: (pos.x - offsetX) / scale,
    y: (pos.y - offsetY) / scale,
  };
}
