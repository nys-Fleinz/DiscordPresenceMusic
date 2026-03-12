import express from 'express';
import http from 'http';
import { WebSocketServer } from "ws";
import clientRPC from "./clientRPC.js";

const port = 3000;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const client = new clientRPC();

let debouncer = null;


app.use(express.json());

wss.on('connection', (ws, socket, req) => {
    console.log('Extension web connecté.');
    ws.on("message", (rawData) => {
        let data = null;
        try {
            data = JSON.parse(rawData);
        } catch (error) {
            console.log("Invalid JSON");
        }
        if(!data) {
            console.log("CLOSED WINDOW");
            client.clearActivity();
            return;
        }
        clearTimeout(debouncer);
        debouncer = setTimeout(() => {
            if(data.state === "PLAYING") {
                client.updateActivity(data);
            } else {
                client.clearActivity();
            }
        }, 500)
    })
});


wss.on('error', (err) => {
    if(err.code === "EADDRINUSE") {
        console.log("Le port "+port+" est déjà en cours d'utilisation par un autre processus. Veuillez le terminer ou choisir un autre port.");
    }
})

server.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});