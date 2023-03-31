import {Player} from "./types/Player";
import {DictionaryService} from "./Dictionary";
import {BoardLetter} from "./types/BoardLetter";
import {Position} from "./types/Position";
import {PlaceWord} from "./types/PlaceWord";
import {PlacedResponse} from "./types/responses/PlacedResponse";
import {Direction} from "./types/Direction";

export class BoardManager {
    private readonly _board: Map<string, BoardLetter>;

    /**
     * Create a new BoardManager
     * @param initialWord The word to be placed on the board at the start of the game
     */
    constructor(initialWord: string = 'WORDJAM') {
        this._board = new Map<string, BoardLetter>();
        this.defaultBoardSetup(initialWord);
    }

    /**
     * Place the initial word on the board
     * @param word The word to be placed on the board
     */
    private defaultBoardSetup(word: string) {
        for(let i = 0; i < word.length; i++) {
            this._board.set(i + '_0', { placedBy: 'Server', timestamp: Date.now(), letter: word[i], position: { x: i, y: 0 } });
        }
    }

    /**
     * Getter for the board map
     * @returns The board map
     */
    get board(): Map<string, BoardLetter> {
        return this._board;
    }

    /**
     * Check if a letter is placed on the board at a given position
     * @param position The position to check
     * @returns true if a letter is placed on the board at the given position, false otherwise
     */
    private hasLetter(position: Position): boolean {
        return this.board.has(position.x + '_' + position.y);
    }

    /**
     * Check if a word can be placed on the board
     * @param data The data to check
     * @param player The player who wants to place the word
     * @returns A PlacedResponse
     */
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

    /**
     * Detect if there is a word on the board from a given position and a given direction
     * @param position The position of any letter of the word
     * @param direction The direction of the word
     * @returns The word if it exists, an empty string otherwise
     */
    private detectWordFromInside(position: Position, direction: Direction): string {
        let word : string = '';
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

    /**
     * Place a word on the board
     * @param data The data to place
     * @param player The player who wants to place the word
     * @returns the score gains by the player
     */
    putLettersOnBoard(data: PlaceWord, player: Player) : number {
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
        this.removeLettersFromPlayer(player, data.letters);
        return 0; // TODO: calculate score
    }

    /**
     * Remove letters from a player
     * @param player The player to remove letters from
     * @param letters The letters to remove
     */
    private removeLettersFromPlayer(player: Player, letters: string[]) {
        for (let letter of letters) {
            player.letters.splice(player.letters.indexOf(letter, 0), 1);
        }
    }

}