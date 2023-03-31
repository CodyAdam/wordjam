import {Position} from "./Position";

export type BoardLetter = {
    placedBy: string,
    timestamp: number,
    letter: string,
    position: Position
}