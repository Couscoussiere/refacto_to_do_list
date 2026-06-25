import express from "express";
import cors from "cors";
import createAuthRouter from "./routes/auth.js";
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());
export const createApp = (db) => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cors({ origin: allowedOrigins }));
    app.get("/health", (_req, res) => {
        res.status(200).json({ status: "ok" });
    });
    app.use("/auth", createAuthRouter(db));
    app.use((err, req, res, next) => {
        if (err instanceof SyntaxError) {
            res.status(400).json({ message: "Invalid JSON" });
            return;
        }
        next(err);
    });
    return app;
};
