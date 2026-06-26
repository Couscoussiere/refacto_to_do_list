import express from "express";
import cors from "cors";
import type { Connection } from "mysql2";
import type { RequestHandler } from "express";
import { ProjectsRouter } from "./routes/projects.js";
import { openapiSpec, swaggerHtml } from "./openapi.js";

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
	.split(",")
	.map((origin) => origin.trim());

export const createApp = (db: Connection, authMiddlewareOverride?: RequestHandler) => {
	const app = express();

	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(cors({ origin: allowedOrigins }));

	app.get("/health", (_req, res) => {
		res.status(200).json({ status: "ok" });
	});

	app.use("/v1/projects", ProjectsRouter(db, authMiddlewareOverride));

	if (process.env.NODE_ENV !== "production") {
		app.get("/v1/docs", (_req, res) => res.send(swaggerHtml("/v1/openapi.json")));
		app.get("/v1/openapi.json", (_req, res) => res.json(openapiSpec));
	}

	app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
		if (err instanceof SyntaxError) {
			res.status(400).json({ message: "Invalid JSON" });
			return;
		}
		next(err);
	});

	return app;
};
