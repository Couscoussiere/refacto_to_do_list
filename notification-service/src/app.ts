import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import { openapiSpec, swaggerHtml } from "./openapi.js";

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

	if (process.env.NODE_ENV !== "production") {
		app.get("/v1/docs", (_req, res) => res.send(swaggerHtml("/v1/openapi.json")));
		app.get("/v1/openapi.json", (_req, res) => res.json(openapiSpec));
	}

	const httpServer = http.createServer(app);
	const wss = new WebSocketServer({ server: httpServer });

	wss.on("connection", (ws) => {
		ws.send("Connexion WebSocket établie");
	});

	const sendNotificationToAllClients = (notification: unknown) => {
		wss.clients.forEach((client) => {
			if (client.readyState === client.OPEN) {
				client.send(JSON.stringify(notification));
			}
		});
	};

	return { app, httpServer, wss, sendNotificationToAllClients };
};
