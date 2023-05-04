import { Position } from '../types/api';
import { Pan } from '../types/canvas';

export function screenToWorld(pos: Position, pan: Pan) {
  return {
    x: (pos.x - pan.offset.x) / pan.scale,
    y: -(pos.y - pan.offset.y) / pan.scale,
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

export function distance(pos1: Position, pos2: Position) {
  return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
}

export function worldToScreen(pos: Position, pan: Pan) {
  return {
    x: pos.x * pan.scale + pan.offset.x,
    y: -pos.y * pan.scale + pan.offset.y,
  };
}

const MAX_16BIT_SIGNED = 32767;

export function keyFromPos({ x, y }: Position) {
  if (x > MAX_16BIT_SIGNED || y > MAX_16BIT_SIGNED) throw 'Invalid X or Y value.';
  x += MAX_16BIT_SIGNED;
  y += MAX_16BIT_SIGNED;
  return (x << 16) | y;
}

export function getKeyX(key: number) {
  return (key >> 16) - MAX_16BIT_SIGNED;
}

export function getKeyY(key: number) {
  return (key & 0xffff) - MAX_16BIT_SIGNED;
}

export function posFromKey(key: number) {
  return { x: getKeyX(key), y: getKeyY(key) };
}

export function isInBound(pos: Position, pan: Pan, width: number, height: number) {
  const minBottomLeft = posFloor(screenToWorld({ x: -1, y: height + 1 }, pan));
  const maxTopRight = posCeil(screenToWorld({ x: width + 1, y: -1 }, pan));
  return pos.x >= minBottomLeft.x && pos.x <= maxTopRight.x && pos.y >= minBottomLeft.y && pos.y <= maxTopRight.y;
}
