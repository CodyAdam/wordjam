export type Position = {
  x: number;
  y: number;
};

export type BoardLetters = Map<PositionKey, BoardLetter>;
export type PositionKey = number;

export type BoardLetter = {
  placedBy: string;
  timestamp: number;
  letter: string;
  position: Position;
};

export type InventoryLetter = {
  letter: string;
  position?: Position;
};

export type BoardClient = {
  position: Position;
  letter: BoardLetter | undefined;
};

export type Pan = {
  offset: Position;
  scale: number;
  origin: Position;
};
