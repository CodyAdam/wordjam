const
    io = require("socket.io-client"),
    ioClient = io.connect("http://localhost:8080");

console.log("Connecting to server...");
ioClient.on("board", (msg:any) => console.info(msg));
//ioClient.emit("login", JSON.stringify({data: {username: "test3"}}));
ioClient.emit("login", JSON.stringify({token: "RDOB"}));
ioClient.on("token", (msg:any) => console.info(msg));