import {WebSocketServer} from "ws";
import {LoginResponse, LoginResponseType, WSMessage} from "./ws";
import {Player} from "./player";
import {BoardClient, BoardLetter, Position} from "./board";

const port = 8080;
const wss = new WebSocketServer({ port: port });

let players : Player[] = [];
let board = new Map<string, BoardLetter>();

console.log("Server started on port " + port);

defaultBoardSetup();

wss.on("connection", (ws) => {

    ws.on("login", (rawData) => {
        let message : WSMessage;
        try {
            message = JSON.parse(rawData.toString());
        } catch (e: any){
            ws.send(e.toString());
            return;
        }

        const username : string = message.data.username || "";
        const token : string = message.token || "";
        ws.send(JSON.stringify(Login(username, token)));
    });

    ws.on("letterplaced", (rawData) => {
        let message : WSMessage;
        try {
            message = JSON.parse(rawData.toString());
        } catch (e: any){
            ws.send(e.toString());
            return;
        }

        LetterPlacedFromClient(message.data);
    });

    ws.send(JSON.stringify(Array.from(board.values())))
});

function Login(username: string, token: string) : LoginResponse{
    let result : LoginResponse = {status : LoginResponseType.SUCCESS};
    // Token verification
    if(token !== "") {
        const playerToken : Player[] = players.filter((p) => p.token == token);
        if(playerToken.length>0){
            result.username = playerToken[0].username;
            result.status = LoginResponseType.SUCCESS;
        } else result.status = LoginResponseType.WRONG_TOKEN;
        return result;
    }
    // Player Username verification
    const playerUsername : Player[] = players.filter((p) => p.username == username);
    // Check duplicate username
    if(playerUsername.length>0){
        result.status = LoginResponseType.ALREADY_EXIST;
    } else {
        let newPlayer: Player = {username: username, token: generateToken(4)};
        players.push(newPlayer);
        result.token = newPlayer.token;
        console.log("New Player : "+newPlayer.username)
    }
    return result;
}

function LetterPlacedFromClient(data: any){

}


function generateToken(len : number): string {
    let text = "";
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < len; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text;
}

function defaultBoardSetup(){
    board.set("0_0", {placedBy: "Server", timestamp: Date.now(), letter: "M", position: {x: 0, y: 0}});
    board.set("0_1", {placedBy: "Server", timestamp: Date.now(), letter: "A", position: {x: 0, y: 1}});
    board.set("0_2", {placedBy: "Server", timestamp: Date.now(), letter: "E", position: {x: 0, y: 2}});
    board.set("0_3", {placedBy: "Server", timestamp: Date.now(), letter: "L", position: {x: 0, y: 3}});
    board.set("0_4", {placedBy: "Server", timestamp: Date.now(), letter: "O", position: {x: 0, y: 4}});
}