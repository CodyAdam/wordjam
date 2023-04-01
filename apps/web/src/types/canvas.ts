import { Position } from './api';

export type Pan = {
  offset: Position;
  scale: number;
  origin: Position;
};
