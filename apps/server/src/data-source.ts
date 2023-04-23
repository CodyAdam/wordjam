import {DataSource} from "typeorm";
import {DBBoardLetter, DBPlayer} from "./db";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "0"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DB,
    synchronize: true,
    logging: false,
    entities: [
        DBPlayer,
        DBBoardLetter
    ],
    subscribers: [],
    migrations: [],
})