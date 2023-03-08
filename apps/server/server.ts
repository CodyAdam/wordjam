import { WebSocketServer } from "ws";
import { WSMessage } from "./ws";

const port = 8080;
const wss = new WebSocketServer({ port: port });

console.log("Server started on port " + port);

wss.on("connection", (ws) => {

    ws.on("message", (rawData) => {
        let message : WSMessage;
        try {
            message = JSON.parse(rawData.toString());
        } catch (e: any){
            ws.send(e.toString());
            return;
        }
        let message_text = message.messageType;
        switch(message_text) {

        }

        console.log("Received message type => " + message_text);
    });

    ws.send("Successfully connected to Wordjam server!");
});