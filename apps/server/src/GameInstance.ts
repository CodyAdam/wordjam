import {Player} from "./types/Player";
import {BoardManager} from "./BoardManager";
import {generateLetters, getDatePlusCooldown} from "./Utils";
import {PlaceWord} from "./types/PlaceWord";
import {PlacedResponse} from "./types/responses/PlacedResponse";
import {AddLetterResponse} from "./types/responses/AddLetterResponse";
import {Config} from "./Config";
import {SubmitWordResponse} from "./types/SubmitWordResponse";
import {Repository} from "typeorm";
import {AppDataSource} from "./data-source";

export class GameInstance {
    private readonly _board: BoardManager;
    private playerRepository: Repository<Player> = AppDataSource.getRepository(Player)

    /**
     * Create a new GameInstance
     */
    constructor() {
        this._board = new BoardManager();
    }

    async init() {
        await this._board.init("WORDJAM")
        await this.playerRepository.clear()
    }

    /**
     * Getter for the players map
     */
    async players(): Promise<Player[]> {
        return await this.playerRepository.find();
    }
    async getPlayerByToken(token: string): Promise<Player> {
        let res = await this.playerRepository.findOne({
            where: {
                token: token
            }
        })
        if(!res)
            throw `Player not found by token ${token}`
        return res
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
    async playerCooldown(token : string): Promise<number> {
        let now : Date = new Date();
        let player : Player | null = await this.playerRepository.findOne({
            where: {token: token}
        })
        if (player === null) return -1;
        if(player.cooldownTarget.getTime() < now.getTime()) return 0;
        let cd = player.cooldownTarget.getTime() - now.getTime();
        return Math.abs(cd/1000);
    }

    /**
     * Check if a username is available
     * @param username The username to check
     */
    async checkUsernameAvailability(username: string): Promise<boolean> {
        for (let player of await this.players()) {
            if (player.username === username) return false;
        }
        return true;
    }

    /**
     * Check a word to submit and then apply the score
     * @param player
     * @param word
     */
    async submitWord(player: Player, word: PlaceWord): Promise<SubmitWordResponse> {
        let response = await this.board.checkLetterPlacedFromClient(word, player);
        if (response.placement === PlacedResponse.OK) {
            this.board.putLettersOnBoard(word, player);
            player.score += response.score
            while (player.letters.length < Config.MIN_HAND_LETTERS) {
                this.addLetterToPlayer(player);
            }
        }

        return {placement: response.placement, highlight: response.highlight};
    }

    /**
     * Add a player to the game
     * @param player The player to add
     */
    async addPlayer(player: Player) {
        await this.playerRepository.save(player)
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