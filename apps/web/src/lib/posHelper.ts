import { Pan, Position } from '../types/board';

export function screenToWorld(pos: Position, pan: Pan) {
  return {
    x: (pos.x - pan.offset.x) / pan.scale,
    y: (pos.y - pan.offset.y) / pan.scale,
  };
}


export function posFloor(pos: Position) {
  return {
    x: Math.floor(pos.x),
    y: Math.floor(pos.y),
  };
}

export function posCeil(pos: Position) {
  return {
    x: Math.ceil(pos.x),
    y: Math.ceil(pos.y),
  };
}


export function posCentered(pos: Position) {
  return {
    x: pos.x + 0.5,
    y: pos.y + 0.5,
  };
}

export function worldToScreen(pos: Position, pan: Pan) {
  return {
    x: pos.x * pan.scale + pan.offset.x,
    y: pos.y * pan.scale + pan.offset.y,
  };
}