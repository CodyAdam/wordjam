import {DictionaryService} from "../src/Dictionary";
import {describe} from "node:test";

describe("Dictionnary", ()=>{
    test("word exist", ()=>{
        expect(DictionaryService.wordExist("hello"))
        expect(DictionaryService.wordExist("Hello"))
        expect(DictionaryService.wordExist("HeLlo"))
        expect(DictionaryService.wordExist("table"))
        expect(DictionaryService.wordExist("mouse"))
        expect(DictionaryService.wordExist("a"))
    })
    test("word not exist", () => {
        expect(!DictionaryService.wordExist(""))
        expect(!DictionaryService.wordExist("b"))
        expect(!DictionaryService.wordExist("bdfsoihadspjwef"))
        expect(!DictionaryService.wordExist("bounour"))
    })
})