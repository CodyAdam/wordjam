import {Column, Entity, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Position} from "./types/Position";

@Entity()
export class DBPlayer {
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    username: string
    @Column()
    token: string
    @Column('text', {array: true})
    letters: string[]
    @Column()
    score: number
    @Column()
    cooldownTarget: Date
}

@Entity()
export class DBBoardLetter {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    placedBy: string

    @Column({type: 'bigint'})
    timestamp: number

    @Column()
    letter: string

    @Column()
    x: number

    @Column()
    y: number
}