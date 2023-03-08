import {WebSocketServer} from "ws";
import {LoginResponse, LoginResponseType, WSMessage} from "./ws";
import {Player} from "./player";

const port = 8080;
const wss = new WebSocketServer({ port: port });

let players : Player[] = [];

console.log("Server started on port " + port);

wss.on("connection", (ws) => {

    ws.on("message", (rawData) => {
        console.log("Received message = "+rawData);
    });

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

    ws.send("Successfully connected to Wordjam server!");
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
        let newPlayer: Player = {username: username, token: generateToken()};
        players.push(newPlayer);
        result.token = newPlayer.token;
        console.log("New Player : "+newPlayer.username)
    }
    return result;
}

function LetterPlacedFromClient(data: any){

}


function generateToken(): string {
    return "";
}