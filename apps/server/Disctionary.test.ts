import {DictionaryService} from "./Dictionary";

console.log(DictionaryService)

describe("DictionnaryService", ()=>{
    describe("Test existence", () => {
        it('Words not exists', () => {
            expect(DictionaryService.wordExist("glbskf")).toBeFalsy()
            expect(DictionaryService.wordExist("dsfjiodg")).toBeFalsy()
            expect(DictionaryService.wordExist("helo")).toBeFalsy()
        })
        it('Words exists', () => {
            expect(DictionaryService.wordExist("hello")).toBeTruthy()
            expect(DictionaryService.wordExist("try")).toBeTruthy()
            expect(DictionaryService.wordExist("language")).toBeTruthy()
            expect(DictionaryService.wordExist("yes")).toBeTruthy()
        })
    })
})