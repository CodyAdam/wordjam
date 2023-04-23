import {Position} from "./Position";
import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class BoardLetter {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    placedBy: string
    @Column({type: "bigint"})
    timestamp: number
    @Column()
    letter: string
    @OneToOne(() => Position, {cascade: true, eager: true})
    @JoinColumn()
    position: Position
}