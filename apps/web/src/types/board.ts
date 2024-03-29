import { BoardLetter, Position } from './api';

export type BoardLetters = Map<PositionKey, BoardLetter>;
export type PositionKey = number;


export type InventoryLetter = {
  letter: string;
  position?: Position;
};
export type InventoryLetterPlaced = {
  letter: string;
  position: Position;
};

export type BoardClient = {
  position: Position;
  letter: BoardLetter | undefined;
};

export type Highlight = null | {
  positions: Position[];
  color: string;
}