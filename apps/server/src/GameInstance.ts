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
import {rootLogger} from "ts-jest";

export class GameInstance {
    private readonly _board: BoardManager;
    private playerRepository: Repository<Player> = AppDataSource.getRepository(Player)

    /**
     * Create a new GameInstance
     */
    constructor() {
        this._board = new BoardManager();

        this._board.needInit().then(res => {
            if(res)
                this.init()
        })
    }

    async init() {
        console.log("INIT GAME")
        await this._board.init("WORDJAM")
        await this.playerRepository.clear()
    }

    /**
     * Getter for the players map
     */
    async players(): Promise<Player[]> {
        return await this.playerRepository.find();
    }
    async getPlayerByToken(token: string): Promise<Player|undefined> {
        let res = await this.playerRepository.findOne({
            where: {
                token: token
            }
        })
        if(!res)
            return undefined
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
            await this.board.putLettersOnBoard(word, player);
            player.score += response.score
            while (player.letters.length < Config.MIN_HAND_LETTERS) {
                await this.addLetterToPlayer(player);
            }
            await this.playerRepository.save(player)
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
    async addLetterToPlayer(player: Player) {
        player.letters.push(generateLetters(1)[0]);
        await this.playerRepository.save(player)
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
    async replaceAllLetters(player: Player): Promise<AddLetterResponse> {
        let response = this.checkReplaceLettersAvailability(player);
        if(response === AddLetterResponse.SUCCESS) {
            player.letters = generateLetters(Config.MIN_HAND_LETTERS);
            player.cooldownTarget = getDatePlusCooldown();
            this.playerRepository.save(player)
        }
        return response;
    }

}