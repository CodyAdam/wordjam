import {Position} from "./Position";
import {Direction} from "tty";

export type CursorDraft = {
    position: Position
    direction: Direction
}
export type LetterDraft = Position
export type Draft = {
    cursors: CursorDraft[],
    letters: LetterDraft[]
}