import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Player {
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    username: string
    @Column()
    token: string
    @Column()
    letters: string[]
    @Column()
    score: number
    @Column()
    cooldownTarget: Date
}