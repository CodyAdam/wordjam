import {DictionaryService} from "../src/Dictionary";
import {describe} from "node:test";

import wordfile from '../dictionary.json'

describe("Dictionnary", ()=>{
    test("word exist", ()=>{
        expect(DictionaryService.wordExist("hello")).toBeTruthy()
        expect(DictionaryService.wordExist("Hello")).toBeTruthy()
        expect(DictionaryService.wordExist("HeLlo")).toBeTruthy()
        expect(DictionaryService.wordExist("table")).toBeTruthy()
        expect(DictionaryService.wordExist("mouse")).toBeTruthy()
    })
    test("word not exist", () => {
        expect(DictionaryService.wordExist("a")).toBeFalsy()
        expect(DictionaryService.wordExist("")).toBeFalsy()
        expect(DictionaryService.wordExist("b")).toBeFalsy()
        expect(DictionaryService.wordExist("bdfsoihadspjwef")).toBeFalsy()
        expect(DictionaryService.wordExist("bounour")).toBeFalsy()
    })
    test("random sentances length", () => {
        for(let i=1; i<10; i++){
            let sentence = DictionaryService.randomSentence(i)
            expect(sentence.split('-').length).toEqual(i)
        }
    })
    test("points of words", () => {
        expect(() => DictionaryService.getPointsOfWord("hello", [1, 1, 3, 1])).toThrow()
        expect(() => DictionaryService.getPointsOfWord("hello", [1, 1, 3, 1, 1, 1])).toThrow()

        expect(DictionaryService.getPointsOfWord("hello")).toEqual(8)
        expect(DictionaryService.getPointsOfWord("hello", [1, 1, 3, 1, 1])).toEqual(10)

    })
})