import {Config} from "./config";
import {DictionaryService} from "./Dictionary";

export function getDatePlusCooldown() {
    return new Date(new Date().getTime() + Config.LETTER_COOLDOWN * 1000);
}

export function generateToken(len: number): string {
    let text = '';
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < len; i++) text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text;
}

export function generateLetters(number: number) {
    let letters = [];
    for (let i = 0; i < number; i++) letters.push(DictionaryService.getRandomLetter());
    return letters;
}