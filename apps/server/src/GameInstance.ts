import {Player} from "./types/Player";
import {BoardManager} from "./BoardManager";
import {generateLetters, getDatePlusCooldown} from "./Utils";
import {PlaceWord} from "./types/PlaceWord";
import {PlacedResponse} from "./types/responses/PlacedResponse";
import {AddLetterResponse} from "./types/responses/AddLetterResponse";
import {Config} from "./Config";
import {SubmitWordResponse} from "./types/SubmitWordResponse";
import {Database} from "./Database";

export class GameInstance {
    private readonly _players: Map<string, Player>;
    private readonly _board: BoardManager;
    private database = new Database()

    /**
     * Create a new GameInstance
     */
    constructor() {
        this._players = new Map<string, Player>();
        this._board = new BoardManager("WORDJAM");
    }

    async init(){
        if(!await this.database.isEmpty()){
            this.load()
        }
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

    save(){
        let players = Array.from(this.players.values())
        let letters = Array.from(this.board.board.values())

        console.log("Saving...")
        this.database.save(players, letters)
    }
    load(){
        console.log("Loading...")
        this.database.load().then(res => {
            console.log(`Loading ${res.players.length} players and ${res.letters.length} letters`)
            res.players.forEach(p => {
                this._players.set(p.token, p)
            })
            res.letters.forEach(l => {
                this._board.board.set(l.position.x + "_" + l.position.y, l)
            })
        })
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
    submitWord(player: Player, word: PlaceWord): SubmitWordResponse {
        let response = this.board.checkLetterPlacedFromClient(word, player);
        if(response.placement === PlacedResponse.OK) {
            this.board.putLettersOnBoard(word, player);
            player.score += response.score
            while(player.letters.length < Config.MIN_HAND_LETTERS) {
                this.addLetterToPlayer(player);
            }
        }

        return {placement: response.placement, highlight: response.highlight};
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
        player.letters.push(generateLetters(1)[0]);
    }

    /**
     * Check if a player can replace his letters
     * @param player The player to check
     */
    checkReplaceLettersAvailability(player: Player): AddLetterResponse {
        if (player.cooldownTarget > new Date()) return AddLetterResponse.IN_COOLDOWN;
        return AddLetterResponse.SUCCESS;
    }

    /**
     * Replace all the letters of a player
     * @param player The player to replace the letters of
     */
    replaceAllLetters(player: Player): AddLetterResponse {
        let response = this.checkReplaceLettersAvailability(player);
        if(response === AddLetterResponse.SUCCESS) {
            player.letters = generateLetters(Config.MIN_HAND_LETTERS);
            player.cooldownTarget = getDatePlusCooldown();
        }
        return response;
    }

}