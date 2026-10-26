import { describe, it, expect, afterEach } from "vitest";
import { normalizeEmail, signToken } from "../../src/service/authService.js";
import jwt from "jsonwebtoken";
import { getJwtPublicKey, JWT_ALGORITHM } from "../../src/config/jwtKeys.js";

describe("normalizeEmail", () => {
    it("convertit en minuscules", () => {
        expect(normalizeEmail("OLIVIER@TEST.COM")).toBe("olivier@test.com");
    });

    it("supprime les espaces en début et fin", () => {
        expect(normalizeEmail("  olivier@test.com  ")).toBe("olivier@test.com");
    });

    it("combine trim + lowercase", () => {
        expect(normalizeEmail("  OLIVIER@Test.Com  ")).toBe("olivier@test.com");
    });
});

describe("signToken", () => {
    const originalPrivateKey = process.env.JWT_PRIVATE_KEY;

    afterEach(() => { process.env.JWT_PRIVATE_KEY = originalPrivateKey; });

    it("retourne un JWT avec le bon payload", () => {
        const token = signToken({ sub: "42", email: "olivier@test.com" });
        const decoded = jwt.verify(token, getJwtPublicKey(), { algorithms: [JWT_ALGORITHM] }) as Record<string, unknown>;
        expect(decoded.sub).toBe("42");
        expect(decoded.email).toBe("olivier@test.com");
    });

    it("signe le token en RS256", () => {
        const token = signToken({ sub: "42", email: "olivier@test.com" });
        const header = jwt.decode(token, { complete: true })?.header;
        expect(header?.alg).toBe("RS256");
    });

    it("lève une erreur si JWT_PRIVATE_KEY est absent", () => {
        delete process.env.JWT_PRIVATE_KEY;
        expect(() => signToken({ sub: "1", email: "a@b.com" })).toThrow("JWT_PRIVATE_KEY is missing");
    });
});
