import {Player} from "./types/Player";
import {DictionaryService} from "./Dictionary";
import {BoardLetter} from "./types/BoardLetter";
import {Position} from "./types/Position";
import {PlaceWord} from "./types/PlaceWord";
import {PlacedResponse} from "./types/responses/PlacedResponse";
import {Direction} from "./types/Direction";

export class BoardManager {
    private readonly _board: Map<string, BoardLetter>;

    constructor(initialWord: string = 'WORDJAM') {
        this._board = new Map<string, BoardLetter>();
        this.defaultBoardSetup(initialWord);
    }

    defaultBoardSetup(word: string) {
        for(let i = 0; i < word.length; i++) {
            this._board.set(i + '_0', { placedBy: 'Server', timestamp: Date.now(), letter: word[i], position: { x: i, y: 0 } });
        }
    }

    get board(): Map<string, BoardLetter> {
        return this._board;
    }

    hasLetter(position: Position): boolean {
        return this.board.has(position.x + '_' + position.y);
    }

    checkLetterPlacedFromClient(data: PlaceWord, player: Player): PlacedResponse {
        let currentPos: Position = data.startPos;
        let word: string = '';
        let additionalWords: string[] = [];
        let playerLetters: string[] = player.letters;
        let lettersToPlaced: string[] = data.letters;
        while (lettersToPlaced.length > 0) {
            if (this.hasLetter(currentPos)) {
                word += this.board.get(currentPos.x + '_' + currentPos.y)?.letter;
            } else {
                let newLetter = lettersToPlaced.shift() || '';
                if (!playerLetters.includes(newLetter)) {
                    return PlacedResponse.PLAYER_DONT_HAVE_LETTERS;
                }
                let concurrentWord = this.detectWordFromInside(
                    currentPos,
                    data.direction == Direction.DOWN ? Direction.RIGHT : Direction.DOWN,
                );

                if (DictionaryService.wordExist(concurrentWord)) additionalWords.push(concurrentWord);
                else return PlacedResponse.INVALID_POSITION;

                playerLetters.splice(playerLetters.indexOf(newLetter, 0), 1);
                word += newLetter;
            }
            if (data.direction == Direction.DOWN) currentPos.y--;
            else currentPos.x++;
        }
        if (!DictionaryService.wordExist(word)) return PlacedResponse.WORD_NOT_EXIST;
        return PlacedResponse.OK;
    }

    detectWordFromInside(position: Position, direction: Direction): string {
        let word = '';
        let currentPos: Position = position;
        while (this.hasLetter(currentPos)) {
            if (direction == Direction.DOWN) currentPos.y++;
            else currentPos.x--;
        }

        if (direction == Direction.DOWN) currentPos.y--;
        else currentPos.x++;
        while (this.hasLetter(currentPos)) {
            word += this.board.get(currentPos.x + '_' + currentPos.y)?.letter;
            if (direction == Direction.DOWN) currentPos.y--;
            else currentPos.x++;
        }

        return word;
    }

    putLettersOnBoard(data: PlaceWord, player: Player) {
        let currentPos: Position = data.startPos;
        let lettersToPlaced: string[] = data.letters;
        while (lettersToPlaced.length > 0) {
            if (!this.hasLetter(currentPos)) {
                let newLetter = lettersToPlaced.shift() || '';
                this.board.set(currentPos.x + '_' + currentPos.y, {
                    placedBy: player.username,
                    timestamp: Date.now(),
                    letter: newLetter,
                    position: currentPos,
                });
            }
            if (data.direction == Direction.DOWN) currentPos.y--;
            else currentPos.x++;
        }
    }

}