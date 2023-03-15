import * as fs from 'fs';
export class DictionnaryService {
    words!: Set<String>
    letterPoints!: Map<String, number>

    constructor() {
        this.fetchWords()
        console.log(this.words)
        console.log(this.letterPoints)
    }

    private fetchWords(){
        let list: String[] = JSON.parse(fs.readFileSync("./dictionnary.json").toString())
        this.words = new Set(list)
    }
    private fetchLetterPoints(){
        this.letterPoints = JSON.parse(fs.readFileSync("./letterPoints.json").toString())
    }

    /**
     * Check if the word is in the word list
     * @param word
     */
    wordExist(word: String): boolean {
        return this.words.has(word.toLowerCase())
    }

    randomWord(){
        let value = Math.random() * this.words.size
        return Array.from(this.words)[Math.floor(value)]
    }
    randomSentence(n: number){
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
    getPointsOfWord(word: String, multipliers?: number[]): number {
        word = word.toLowerCase()

        if(multipliers && multipliers.length != word.length)
            throw "Multiplier should have the same length as the word"

        let points = 0
        for(let i=0; i<word.length; i++){
            let pointForChar = this.letterPoints.get(word[i])
            if(pointForChar == null)
                throw "Letter not found"
            let pointWithMultiplier = (multipliers) ? multipliers[i] : 1
            points += pointForChar*pointWithMultiplier
        }
        return points
    }

}