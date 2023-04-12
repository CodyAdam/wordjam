import {LetterHighlight} from "./LetterHighlight";

export type CheckLetterResponse = {
    placement: string,
    score: number,
    highlight: LetterHighlight
}