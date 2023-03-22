import { Pan, Position } from '../types/board';

export function screenToWorld(pos: Position, pan: Pan) {
  return {
    x: (pos.x - pan.offset.x) / pan.scale,
    y: (pos.y - pan.offset.y) / pan.scale,
  };
}


export function posToInt(pos: Position) {
  return {
    x: Math.floor(pos.x),
    y: Math.floor(pos.y),
  };
}