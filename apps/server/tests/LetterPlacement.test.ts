import {beforeEach, describe} from "node:test";
import {PlacedResponse, PlaceWord, Direction} from "../src/types/board";
import {checkLetterPlacedFromClient} from "../src/server";

describe("LetterPlacement", () => {
    beforeEach(() => {
        initServerPlaceWordsTest();
    });

    test("placeWords", () => {
        expect(PlacedResponse.OK).toEqual(checkLetterPlacedFromClient({letters: [], startPos: {x:0, y:0}, direction: Direction.DOWN}, "test"))
    });
});

function initServerPlaceWordsTest(){

}