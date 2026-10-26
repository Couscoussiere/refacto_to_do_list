// Les clés PEM sont stockées en base64 sur une seule ligne dans le .env
const readPemFromEnv = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is missing in environment`);
    }
    return Buffer.from(value, "base64").toString("utf8");
};

export const JWT_ALGORITHM = "RS256";

export const getJwtPrivateKey = (): string => readPemFromEnv("JWT_PRIVATE_KEY");

export const getJwtPublicKey = (): string => readPemFromEnv("JWT_PUBLIC_KEY");
