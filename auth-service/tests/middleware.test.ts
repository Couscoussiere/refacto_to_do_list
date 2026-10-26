import { describe, it, expect, beforeEach } from "vitest";
import { generateKeyPairSync } from "node:crypto";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createTestApp } from "./helpers/createTestApp.js";
import { getJwtPrivateKey, JWT_ALGORITHM } from "../src/config/jwtKeys.js";

const USER = {
	email: "olivier.dick@test.com",
	password: "Password123",
	firstName: "Olivier",
	lastName: "Dick",
};

describe("requireAuth middleware", () => {
	let app: ReturnType<typeof createTestApp>["app"];
	let validToken: string;

	beforeEach(async () => {
		({ app } = createTestApp());
		await request(app).post("/v1/auth/register").send(USER);
		const res = await request(app).post("/v1/auth/login").send({
			email: USER.email,
			password: USER.password,
		});
		validToken = res.body.token as string;
	});

	it("token Bearer valide → appelle next() et retourne 200", async () => {
		const res = await request(app).get("/v1/auth/me").set("Authorization", `Bearer ${validToken}`);

		expect(res.status).toBe(200);
	});

	it("header Authorization absent → 401", async () => {
		const res = await request(app).get("/v1/auth/me");

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Missing Authorization header");
	});

	it("schéma non Bearer → 401", async () => {
		const res = await request(app).get("/v1/auth/me").set("Authorization", `Basic ${validToken}`);

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Invalid Authorization header");
	});

	it("token expiré → 401", async () => {
		const expiredToken = jwt.sign(
			{ sub: "1", email: USER.email, exp: Math.floor(Date.now() / 1000) - 3600 },
			getJwtPrivateKey(),
			{ algorithm: JWT_ALGORITHM }
		);

		const res = await request(app).get("/v1/auth/me").set("Authorization", `Bearer ${expiredToken}`);

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Invalid token");
	});

	it("token malformé → 401", async () => {
		const res = await request(app).get("/v1/auth/me").set("Authorization", "Bearer pas.un.token.valide");

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Invalid token");
	});

	it("token signé en HS256 (ancien secret partagé) → 401", async () => {
		const hsToken = jwt.sign({ sub: "1", email: USER.email }, "test-secret-key", { algorithm: "HS256" });

		const res = await request(app).get("/v1/auth/me").set("Authorization", `Bearer ${hsToken}`);

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Invalid token");
	});

	it("token signé par une autre clé privée → 401", async () => {
		const { privateKey: autreCle } = generateKeyPairSync("rsa", { modulusLength: 2048 });
		const forgedToken = jwt.sign({ sub: "1", email: USER.email }, autreCle, { algorithm: JWT_ALGORITHM });

		const res = await request(app).get("/v1/auth/me").set("Authorization", `Bearer ${forgedToken}`);

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Invalid token");
	});

	it("token sans sub → 401", async () => {
		const tokenSansSub = jwt.sign({ email: USER.email }, getJwtPrivateKey(), { algorithm: JWT_ALGORITHM });

		const res = await request(app).get("/v1/auth/me").set("Authorization", `Bearer ${tokenSansSub}`);

		expect(res.status).toBe(401);
		expect(res.body.message).toBe("Invalid token");
	});

	it("token valide → req.auth contient userId et email", async () => {
		const res = await request(app).get("/v1/auth/me").set("Authorization", `Bearer ${validToken}`);

		expect(res.status).toBe(200);
		expect(res.body.user.email).toBe(USER.email);
	});
});
