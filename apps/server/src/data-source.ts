import {DataSource} from "typeorm";
import {Player} from "./types/Player";
import {Position} from "./types/Position";
import {BoardLetter} from "./types/BoardLetter";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "0"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DB,
    synchronize: true,
    logging: true,
    entities: [
        Player,
        Position,
        BoardLetter
    ],
    subscribers: [],
    migrations: [],
})