import {Direction} from "tty";
import {Position} from "./api"

export type CursorDraft = {
    position: Position
    direction: Direction
}
export type LetterDraft = Position
export type Draft = {
    cursors: CursorDraft[],
    letters: LetterDraft[]
}