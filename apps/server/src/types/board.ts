export type Position = {
    x: number,
    y: number
}

export type BoardLetter = {
    placedBy: string,
    timestamp: number,
    letter: string,
    position: Position
}

export type BoardClient = {
    position: Position,
    letter: BoardLetter|undefined
}

export type PlaceWord = {
    letters: string[]
    startPos: Position
    direction: Direction
}

export enum Direction {
    DOWN,
    RIGHT
}

export enum PlacedResponse {
    OK,
    PLAYER_DONT_HAVE_LETTERS,
    INVALID_POSITION,
    WORD_NOT_EXIST,
    NOT_CONNECTED
}