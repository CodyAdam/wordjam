import {Draft} from "./Draft";

export type Player = {
    username: string,
    token: string
    letters: string[]
    score: number
    cooldownTarget: Date
    draft?: Draft,
    connected: boolean
}