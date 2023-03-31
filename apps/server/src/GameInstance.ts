import {Player} from "./types/Player";
import {BoardManager} from "./BoardManager";
import {generateLetters, getDatePlusCooldown} from "./Utils";

export class GameInstance {
    private readonly _players: Map<string, Player>;
    private readonly _board: BoardManager;

    constructor() {
        this._players = new Map<string, Player>();
        this._board = new BoardManager("WORDJAM");
    }

    get players(): Map<string, Player> {
        return this._players;
    }

    get board(): BoardManager {
        return this._board;
    }

    playerCooldown(token : string): number {
        let now : Date = new Date();
        let player : Player | undefined = this._players.get(token);
        if (player === undefined) return -1;
        if(player.cooldownTarget.getTime() < now.getTime()) return 0;
        let cd = player.cooldownTarget.getTime() - now.getTime();
        return Math.abs(cd/1000);
    }

    checkUsernameAvailability(username: string): boolean {
        for (let player of this._players.values()) {
            if (player.username === username) return false;
        }
        return true;
    }

    addPlayer(player: Player) {
        this._players.set(player.token, player);
    }

    addLetterToPlayer(player: Player) {
        if (player.cooldownTarget > new Date()) throw new Error('The cooldown is not over');
        player.letters.push(generateLetters(1)[0]);
        player.cooldownTarget = getDatePlusCooldown();
    }

}