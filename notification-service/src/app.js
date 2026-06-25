import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());
export const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cors({ origin: allowedOrigins }));
    app.get("/health", (_req, res) => {
        res.status(200).json({ status: "ok" });
    });
    const httpServer = http.createServer(app);
    const wss = new WebSocketServer({ server: httpServer });
    wss.on("connection", (ws) => {
        ws.send("Connexion WebSocket établie");
    });
    const sendNotificationToAllClients = (notification) => {
        wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
                client.send(JSON.stringify(notification));
            }
        });
    };
    return { app, httpServer, wss, sendNotificationToAllClients };
};
