import {PlacedResponse} from "./responses/PlacedResponse";

export type CheckLetterResponse = {
    placement: PlacedResponse,
    score: number
}