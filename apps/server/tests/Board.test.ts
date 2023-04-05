import {describe} from "node:test";
import {BoardManager} from "../src/BoardManager";
import {Player} from "../src/types/Player";
import {PlaceWord} from "../src/types/PlaceWord";
import {Direction} from "../src/types/Direction";
import {PlacedResponse} from "../src/types/responses/PlacedResponse";

describe("Board", ()=>{

    test("default board creation", ()=> {
        let board : BoardManager = new BoardManager();
        expect(board.board.size).toEqual(7);
        expect(board.board.get("0_0")).toEqual({ placedBy: 'Server', timestamp: expect.any(Number), letter: 'W', position: { x: 0, y: 0 } });
        expect(board.board.get("1_0")).toEqual({ placedBy: 'Server', timestamp: expect.any(Number), letter: 'O', position: { x: 1, y: 0 } });
        expect(board.board.get("2_0")).toEqual({ placedBy: 'Server', timestamp: expect.any(Number), letter: 'R', position: { x: 2, y: 0 } });
        expect(board.board.get("3_0")).toEqual({ placedBy: 'Server', timestamp: expect.any(Number), letter: 'D', position: { x: 3, y: 0 } });
        expect(board.board.get("4_0")).toEqual({ placedBy: 'Server', timestamp: expect.any(Number), letter: 'J', position: { x: 4, y: 0 } });
        expect(board.board.get("5_0")).toEqual({ placedBy: 'Server', timestamp: expect.any(Number), letter: 'A', position: { x: 5, y: 0 } });
        expect(board.board.get("6_0")).toEqual({ placedBy: 'Server', timestamp: expect.any(Number), letter: 'M', position: { x: 6, y: 0 } });
    })

    test("custom board creation", ()=> {
        let board : BoardManager = new BoardManager("WORDCUSTOM");
        expect(board.board.size).toEqual(10);
        expect(board.board.get("0_0")).toEqual({ placedBy: 'Server', timestamp: expect.any(Number), letter: 'W', position: { x: 0, y: 0 } });
        expect(board.board.get("1_0")).toEqual({ placedBy: 'Server', timestamp: expect.any(Number), letter: 'O', position: { x: 1, y: 0 } });
        expect(board.board.get("2_0")).toEqual({ placedBy: 'Server', timestamp: expect.any(Number), letter: 'R', position: { x: 2, y: 0 } });
        expect(board.board.get("3_0")).toEqual({ placedBy: 'Server', timestamp: expect.any(Number), letter: 'D', position: { x: 3, y: 0 } });
        expect(board.board.get("4_0")).toEqual({ placedBy: 'Server', timestamp: expect.any(Number), letter: 'C', position: { x: 4, y: 0 } });
        expect(board.board.get("5_0")).toEqual({ placedBy: 'Server', timestamp: expect.any(Number), letter: 'U', position: { x: 5, y: 0 } });
        expect(board.board.get("6_0")).toEqual({ placedBy: 'Server', timestamp: expect.any(Number), letter: 'S', position: { x: 6, y: 0 } });
        expect(board.board.get("7_0")).toEqual({ placedBy: 'Server', timestamp: expect.any(Number), letter: 'T', position: { x: 7, y: 0 } });
        expect(board.board.get("8_0")).toEqual({ placedBy: 'Server', timestamp: expect.any(Number), letter: 'O', position: { x: 8, y: 0 } });
        expect(board.board.get("9_0")).toEqual({ placedBy: 'Server', timestamp: expect.any(Number), letter: 'M', position: { x: 9, y: 0 } });
    })

    test("placed word on board #1", () => {
        let board : BoardManager = new BoardManager();
        let player : Player = {username: "Test", token: "test", score: 0, cooldownTarget: new Date(), letters: ["D", "O", "R", "R", "L", "A", "G", "H", "T", "I", "D", "U"]};
        let placeWord: PlaceWord = {letters: ["O", "R", "D"], startPos: {x: 0, y: 0}, direction: Direction.DOWN};
        expect(board.checkLetterPlacedFromClient(placeWord, player).placement).toEqual(PlacedResponse.OK);
        board.putLettersOnBoard({letters: ["O", "R", "D"], startPos: {x: 0, y: 0}, direction: Direction.DOWN}, player);

        placeWord = {letters: ["A", "L", "I", "G", "H", "T"], startPos: {x: -2, y: -2}, direction: Direction.RIGHT};
        expect(board.checkLetterPlacedFromClient(placeWord, player).placement).toEqual(PlacedResponse.OK);
        board.putLettersOnBoard({letters: ["A", "L", "I", "G", "H", "T"], startPos: {x: -2, y: -2}, direction: Direction.RIGHT}, player);

        placeWord = {letters: ["D", "U"], startPos: {x: 2, y: 1}, direction: Direction.DOWN};
        expect(board.checkLetterPlacedFromClient(placeWord, player).placement).toEqual(PlacedResponse.OK);
        board.putLettersOnBoard({letters: ["D", "U"], startPos: {x: 2, y: 1}, direction: Direction.DOWN}, player);
    });

    test("word not connected to existing words", () => {
        let board : BoardManager = new BoardManager();
        let player : Player = {username: "Test", token: "test", score: 0, cooldownTarget: new Date(), letters: ["W", "D", "O", "R", "R", "L", "A", "G", "H", "T", "I", "D", "U"]};
        let placeWord: PlaceWord = {letters: ["W", "O", "R", "D"], startPos: {x: 10, y: 0}, direction: Direction.DOWN};
        expect(board.checkLetterPlacedFromClient(placeWord, player).placement).toEqual(PlacedResponse.WORD_NOT_CONNECTED_TO_OTHERS);
    });

    test("player has not the letters", () => {
        let board : BoardManager = new BoardManager();
        let player : Player = {username: "Test", token: "test", score: 0, cooldownTarget: new Date(), letters: ["W", "O", "R", "R", "L", "A", "G", "H", "T", "I", "U"]};
        let placeWord: PlaceWord = {letters: ["O", "R", "D"], startPos: {x: 0, y: 0}, direction: Direction.DOWN};
        expect(board.checkLetterPlacedFromClient(placeWord, player).placement).toEqual(PlacedResponse.PLAYER_DONT_HAVE_LETTERS);
    });

    test("word starting below other one", () => {
        let board : BoardManager = new BoardManager();
        let player : Player = {username: "Test", token: "test", score: 0, cooldownTarget: new Date(), letters: ["W", "O", "D", "R", "R", "L", "A", "G", "H", "T", "I", "U"]};
        let placeWord: PlaceWord = {letters: ["O", "R", "D"], startPos: {x: 0, y: -1}, direction: Direction.DOWN};
        expect(board.checkLetterPlacedFromClient(placeWord, player).placement).toEqual(PlacedResponse.OK);
    });

    test("one letter for two words", () => {
        let board : BoardManager = new BoardManager("WOR");
        let player : Player = {username: "Test", token: "test", score: 0, cooldownTarget: new Date(), letters: ["W", "O", "D", "R", "R", "L", "A", "G", "H", "T", "I", "U"]};
        let placeWord : PlaceWord = {letters: ["D"], startPos: {x: 3, y: 0}, direction: Direction.DOWN};
        board.putLettersOnBoard({letters: ["W", "O", "R"], startPos: {x: 3, y: 3}, direction: Direction.DOWN}, player);
        expect(board.checkLetterPlacedFromClient(placeWord, player).placement).toEqual(PlacedResponse.OK);
    });

});