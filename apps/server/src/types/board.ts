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