import * as fs from 'fs';
class Dictionnary {
    words!: Set<String>

    constructor() {
        this.fetchWords()
    }

    private fetchWords(){
        let list: String[] = JSON.parse(fs.readFileSync("./dictionnary.json").toString())
        this.words = new Set(list)
    }

    wordExist(word: String): boolean {
        return this.words.has(word)
    }

}