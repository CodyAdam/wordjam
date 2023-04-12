import {Player} from "./types/Player";
import {DictionaryService} from "./Dictionary";
import {BoardLetter} from "./types/BoardLetter";
import {Position} from "./types/Position";
import {PlaceWord} from "./types/PlaceWord";
import {PlacedResponse} from "./types/responses/PlacedResponse";
import {Direction} from "./types/Direction";
import {CheckLetterResponse} from "./types/CheckLetterResponse";
import {posEquals} from "./Utils";
import {Config} from "./Config";

export class BoardManager {
    private readonly _board: Map<string, BoardLetter>;

    /**
     * Create a new BoardManager
     * @param initialWord The word to be placed on the board at the start of the game
     */
    constructor(initialWord: string = 'WORDJAM') {
        this._board = new Map<string, BoardLetter>();
        this.defaultBoardSetup(initialWord);
        DictionaryService.addCustomWord(initialWord);
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
    checkLetterPlacedFromClient(data: PlaceWord, player: Player): CheckLetterResponse {
        let currentPos: Position = Object.assign({}, data.startPos);
        let word: string = '';
        let score = 0;
        let additionalWords: string[] = [];
        let validPosition: boolean = false;
        let playerLetters: string[] = [...player.letters];
        let lettersToPlaced: string[] = [...data.letters];
        let lettersPositions: Position[] = [];

        let previousLetter = Object.assign({}, data.startPos);
        if (data.direction == Direction.DOWN) previousLetter.y++;
        else previousLetter.x--;
        while(this.hasLetter(previousLetter)) {
            word = this.board.get(previousLetter.x + '_' + previousLetter.y)?.letter + word;
            validPosition = true;
            if (data.direction == Direction.DOWN) previousLetter.y++;
            else previousLetter.x--;
        }

        while (lettersToPlaced.length > 0 || this.hasLetter(currentPos)) {
            lettersPositions.push(Object.assign({}, currentPos));
            if (this.hasLetter(currentPos)) {
                let letter = this.board.get(currentPos.x + '_' + currentPos.y)?.letter;
                word += letter;
                validPosition = true;
            } else {
                let newLetter : string = lettersToPlaced.shift() || '';
                if (!playerLetters.includes(newLetter)) {
                    return {
                        placement: PlacedResponse.PLAYER_DONT_HAVE_LETTERS,
                        score: 0,
                        highlight: {positions: [], color: ''}
                    };
                }
                let {concurrentWord, concurrentPos}  = this.detectWordFromInside(
                    currentPos,
                    data.direction == Direction.DOWN ? Direction.RIGHT : Direction.DOWN,
                    newLetter
                );

                score += DictionaryService.getPointsOfWord(concurrentWord)

                if (concurrentWord !== newLetter && DictionaryService.wordExist(concurrentWord)) {
                    validPosition = true;
                    additionalWords.push(concurrentWord);
                    lettersPositions.push(...concurrentPos);
                }
                else if(concurrentWord !== newLetter) return {
                    placement: PlacedResponse.INVALID_POSITION.toString().replace("%WORD%", concurrentWord.toUpperCase()),
                    score: 0,
                    highlight: {positions: concurrentPos, color: Config.COLOR_HIGHLIGHT_ERROR}
                };

                playerLetters.splice(playerLetters.indexOf(newLetter, 0), 1);
                word += newLetter;
            }
            if (data.direction === Direction.DOWN) currentPos.y = currentPos.y - 1;
            else currentPos.x++;
        }
        console.log(word)
        if (!validPosition) return {
            placement: PlacedResponse.WORD_NOT_CONNECTED_TO_OTHERS,
            score: 0,
            highlight: {positions: lettersPositions, color: Config.COLOR_HIGHLIGHT_ERROR}
        };
        if (!DictionaryService.wordExist(word)) return {
            placement: PlacedResponse.WORD_NOT_EXIST.toString().replace("%WORD%", word.toUpperCase()),
            score: 0,
            highlight: {positions: lettersPositions, color: Config.COLOR_HIGHLIGHT_ERROR}
        };

        score += DictionaryService.getPointsOfWord(word)
        return {
            placement: PlacedResponse.OK,
            score,
            highlight: {positions: lettersPositions, color: Config.COLOR_HIGHLIGHT_VALID}
        };
    }

    /**
     * Detect if there is a word on the board from a given position and a given direction
     * @param position The position of any letter of the word
     * @param direction The direction of the word
     * @param letter The letter to be placed on the board at the given position
     * @returns The word if it exists, an empty string otherwise
     */
    private detectWordFromInside(position: Position, direction: Direction, letter: string): {concurrentWord: string, concurrentPos: Position[]} {
        let word : string = '';
        let currentPos: Position = Object.assign({}, position);
        while (this.hasLetter(currentPos) || posEquals(currentPos,position)) {
            if (direction == Direction.DOWN) currentPos.y++;
            else currentPos.x--;
        }

        let positions: Position[] = [];
        if (direction == Direction.DOWN) currentPos.y--;
        else currentPos.x++;
        while (this.hasLetter(currentPos) || posEquals(currentPos,position)) {
            if (!posEquals(currentPos,position)) word += this.board.get(currentPos.x + '_' + currentPos.y)?.letter;
            else word += letter;
            positions.push(Object.assign({}, currentPos));
            if (direction == Direction.DOWN) currentPos.y--;
            else currentPos.x++;
        }

        return {concurrentWord: word, concurrentPos: positions};
    }

    /**
     * Place a word on the board
     * @param data The data to place
     * @param player The player who wants to place the word
     * @returns the score gains by the player
     */
    putLettersOnBoard(data: PlaceWord, player: Player) {
        let currentPos: Position = Object.assign({}, data.startPos);
        let lettersToPlaced: string[] = [...data.letters];
        while (lettersToPlaced.length > 0) {
            if (!this.hasLetter(currentPos)) {
                let newLetter = lettersToPlaced.shift() || '';
                this.board.set(currentPos.x + '_' + currentPos.y, {
                    placedBy: player.username,
                    timestamp: Date.now(),
                    letter: newLetter,
                    position: Object.assign({}, currentPos),
                });
            }
            if (data.direction == Direction.DOWN) currentPos.y--;
            else currentPos.x++;
        }
        this.removeLettersFromPlayer(player, data.letters);
    }

    /**
     * Remove letters from a player
     * @param player The player to remove letters from
     * @param letters The letters to remove
     */
    private removeLettersFromPlayer(player: Player, letters: string[]) {
        console.log("inventory", player.letters)
        console.log("letters to remove", letters)
        player.letters = player.letters.filter((letter) => {
            const indexInToRemove = letters.indexOf(letter);
            if (indexInToRemove !== -1) {
                letters.splice(indexInToRemove, 1);
                return false;
            }
            return true;
        });
        console.log("inventory then ", player.letters)
    }

}