import {Position} from "./Position";
import {Column, Entity, OneToOne, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class BoardLetter {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    placedBy: string
    @Column()
    timestamp: number
    @Column()
    letter: string
    @OneToOne(() => Position)
    position: Position
}