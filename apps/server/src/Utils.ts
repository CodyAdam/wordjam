import {Config} from "./Config";
import {DictionaryService} from "./Dictionary";
import {Position} from "./types/Position";

/**
 * get a date that represent the date from now when the cooldown will be over
 * @returns the date when the cooldown will be over
 */
export function getDatePlusCooldown() {
    return new Date(new Date().getTime() + Config.LETTER_COOLDOWN * 1000);
}

/**
 * generate a random token of a given length with letters and numbers
 * @param len the length of the token
 * @returns the generated token
 */
export function generateToken(len: number): string {
    let text : string = '';
    const charset : string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i : number = 0; i < len; i++) text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text;
}

/**
 * generate an array with given length of random letters
 * @param len the length of the array
 * @returns the array of random letters
 */
export function generateLetters(len: number) {
    let letters = [];
    for (let i = 0; i < len; i++) letters.push(DictionaryService.getRandomLetter());
    return letters;
}


/**
 * Check if two positions are equals
 * @param pos1 the first position
 * @param pos2 the second position
 */
export function posEquals(pos1: Position, pos2: Position) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}