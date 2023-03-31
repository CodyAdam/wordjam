import * as fs from 'fs';

import wordfile from '../dictionary.json'
import letterPointsFile from '../letterPoints.json'

let words = new Set<String>(wordfile)
let letterPoints: number[] = (letterPointsFile)

let chars = "abcdefghijklmnopqrstuvwxyz"

export class DictionaryService {
    /**
     * Check if the word is in the word list
     * @param word
     */
    static wordExist(word: String): boolean {
        return words.has(word.toLowerCase())
    }

    static randomWord(){
        let value = Math.random() * words.size
        return Array.from(words)[Math.floor(value)]
    }
    static randomSentence(n: number){
        let words = []
        for(let i=0; i<n; i++)
            words.push(this.randomWord())
        return words.join('-')
    }

    static addCustomWord(word: string){
        words.add(word.toLowerCase());
    }

    /**
     * Calculate the points of the word
     * @param word the word
     * @param multipliers an optional list of the multiplier of each letter
     */
    static getPointsOfWord(word: String, multipliers?: number[]): number {
        word = word.toLowerCase()

        if(multipliers && multipliers.length != word.length)
            throw `Multiplier should have the same length as the word : ${word.length} != ${multipliers.length}`

        let points = 0
        for(let i=0; i<word.length; i++){
            let pos = chars.indexOf(word[i])
            let pointForChar = letterPoints[pos]
            if(pointForChar == null)
                throw "Letter not found"
            let pointWithMultiplier = (multipliers) ? multipliers[i] : 1
            points += pointForChar*pointWithMultiplier
        }
        return points
    }

    static getRandomLetter(): string {
        const letters = [
            ['a', 8.167],
            ['b', 1.492],
            ['c', 2.782],
            ['d', 4.253],
            ['e', 12.702],
            ['f', 2.228],
            ['g', 2.015],
            ['h', 6.094],
            ['i', 6.966],
            ['j', 0.153],
            ['k', 0.772],
            ['l', 4.025],
            ['m', 2.406],
            ['n', 6.749],
            ['o', 7.507],
            ['p', 1.929],
            ['q', 0.095],
            ['r', 5.987],
            ['s', 6.327],
            ['t', 9.056],
            ['u', 2.758],
            ['v', 0.978],
            ['w', 2.361],
            ['x', 0.150],
            ['y', 1.974],
            ['z', 0.074]
        ];

        // Calculate the total frequency of all letters
        const totalFrequency = letters.reduce((acc, [_, freq]) => acc + +freq, 0);

        // Generate a random number between 0 and the total frequency
        const randomNumber = Math.random() * totalFrequency;

        // Iterate over the letters and their frequencies until we find the letter that corresponds to the random number
        let sum = 0;
        for (const [letter, freq] of letters) {
            sum += +freq;
            if (randomNumber <= sum) {
                return letter.toString();
            }
        }

        // This should never happen, but just in case
        return 'a';
    }

}