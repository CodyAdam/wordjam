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

    /**
     * Calculate the points of the word
     * @param word the word
     * @param multipliers an optional list of the multiplier of each letter
     */
    static getPointsOfWord(word: String, multipliers?: number[]): number {
        word = word.toLowerCase()

        if(multipliers && multipliers.length != word.length)
            throw "Multiplier should have the same length as the word"

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

}