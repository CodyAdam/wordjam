import { WebSocketServer } from "ws";

const port = 8080;
const wss = new WebSocketServer({ port: port });

console.log("Server started on port " + port);

wss.on("connection", (ws) => {

    ws.on("message", (message) => {
        console.log("Received message => " + message);
    });

    ws.send("Successfully connected to Wordjam server!");
});