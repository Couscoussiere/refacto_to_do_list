import { generateKeyPairSync } from "node:crypto";
import { defineConfig } from "vitest/config";

// Paire RSA éphémère pour les tests : aucune clé n'est commitée
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" },
});
export default defineConfig({
    test: {
        environment: "node",
        globals: true,
        pool: "forks",
        env: {
            JWT_PRIVATE_KEY: Buffer.from(privateKey).toString("base64"),
            JWT_PUBLIC_KEY: Buffer.from(publicKey).toString("base64"),
        },
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            include: ["src/**/*.ts"],
            exclude: ["src/index.ts"],
        },
    },
});
