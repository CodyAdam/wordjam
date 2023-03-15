import { WebSocketServer } from "ws";
import {DictionaryService} from "./Dictionary";


export function main(){
    const port = 8080;
    const wss = new WebSocketServer({ port: port });
    const dictionnaryService = new DictionaryService()

    console.log("Server started on port " + port);

    wss.on("connection", (ws) => {

        ws.on("message", (message) => {
            console.log("Received message => " + message);
        });

        ws.send("Successfully connected to Wordjam server!");
    });
}