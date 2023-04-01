export type Player = {
	username: string
	score: number
	letterCount: number
	lastPlaced: number // date.getTime()
}

export enum LoginResponseType {
  SUCCESS = 'SUCCESS',
  WRONG_TOKEN = 'WRONG_TOKEN',
  ALREADY_EXIST = 'ALREADY_EXIST',
}

export type BoardLetter = {
  placedBy: string; // player.username
  timestamp: number; // date.getTime()
  letter: string;
  position: Position;
};

export type Position = {
  x: number;
  y: number;
};

export type PlaceWord = {
    letters: string[]
    startPos: Position
    direction: Direction
}

export enum Direction {
    DOWN,
    RIGHT
}