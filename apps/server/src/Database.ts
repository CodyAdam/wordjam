import {Repository} from "typeorm";
import {DBBoardLetter, DBPlayer} from "./db";
import {AppDataSource} from "./data-source";
import {Player} from "./types/Player";
import {BoardLetter} from "./types/BoardLetter";

export class Database {
    playerRepo: Repository<DBPlayer> = AppDataSource.getRepository(DBPlayer)
    letterRepo: Repository<DBBoardLetter> = AppDataSource.getRepository(DBBoardLetter)

    async save(players: Player[], letters: BoardLetter[]){
        await this.clear()

        await this.playerRepo.save(
            players.map(p => this.playerRepo.create(p))
        )
        await this.letterRepo.save(
            letters.map(l => this.letterRepo.create({
                x: l.position.x,
                y: l.position.y,
                letter: l.letter,
                timestamp: l.timestamp,
                placedBy: l.placedBy,
            }))
        )
    }
    async load(): Promise<{players: Player[], letters: BoardLetter[]}> {
        let players = (await this.playerRepo.find()).map((p:DBPlayer): Player => {
            return p
        })
        let letters = (await this.letterRepo.find()).map((l: DBBoardLetter): BoardLetter => {
            return {
                letter: l.letter,
                timestamp: l.timestamp,
                placedBy: l.placedBy,
                position: {x: l.x, y: l.y}
            }
        })
        return {players, letters}
    }
    async clear(){
        await this.playerRepo.clear()
        await this.letterRepo.clear()
    }
    async isEmpty(): Promise<boolean>{
        return await this.playerRepo.count() == 0
    }

}