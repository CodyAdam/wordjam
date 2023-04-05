import {Player} from "./types/Player";
import {BoardManager} from "./BoardManager";
import {generateLetters, getDatePlusCooldown} from "./Utils";
import {PlaceWord} from "./types/PlaceWord";
import {PlacedResponse} from "./types/responses/PlacedResponse";

export class GameInstance {
    private readonly _players: Map<string, Player>;
    private readonly _board: BoardManager;

    /**
     * Create a new GameInstance
     */
    constructor() {
        this._players = new Map<string, Player>();
        this._board = new BoardManager("WORDJAM");
    }

    /**
     * Getter for the players map
     */
    get players(): Map<string, Player> {
        return this._players;
    }

    /**
     * Getter for the board manager
     */
    get board(): BoardManager {
        return this._board;
    }

    /**
     * Get the cooldown (for getting new letter) of a player
     * @param token The token of the player
     */
    playerCooldown(token : string): number {
        let now : Date = new Date();
        let player : Player | undefined = this._players.get(token);
        if (player === undefined) return -1;
        if(player.cooldownTarget.getTime() < now.getTime()) return 0;
        let cd = player.cooldownTarget.getTime() - now.getTime();
        return Math.abs(cd/1000);
    }

    /**
     * Check if a username is available
     * @param username The username to check
     */
    checkUsernameAvailability(username: string): boolean {
        for (let player of this._players.values()) {
            if (player.username === username) return false;
        }
        return true;
    }

    /**
     * Check a word to submit and then apply the score
     * @param player
     * @param word
     */
    submitWord(player: Player, word: PlaceWord): PlacedResponse {
        let response = this.board.checkLetterPlacedFromClient(word, player);

        if(response.placement == PlacedResponse.OK) {
            this.board.putLettersOnBoard(word, player);
            player.score += response.score
        }

        return response.placement
    }

    /**
     * Add a player to the game
     * @param player The player to add
     */
    addPlayer(player: Player) {
        this._players.set(player.token, player);
    }

    /**
     * Add a letter to the player's letters inventory
     * @param player The player to add the letter to
     */
    addLetterToPlayer(player: Player) {
        if (player.cooldownTarget > new Date()) throw new Error('The cooldown is not over');
        player.letters.push(generateLetters(1)[0]);
        player.cooldownTarget = getDatePlusCooldown();
    }

}