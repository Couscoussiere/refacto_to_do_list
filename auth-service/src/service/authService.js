import jwt from "jsonwebtoken";
import { toUser } from "../models/User.js";
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is missing in environment");
    }
    return secret;
};
export const signToken = (payload) => {
    const secret = getJwtSecret();
    const expiresIn = (process.env.JWT_EXPIRES_IN || "1h");
    return jwt.sign(payload, secret, { expiresIn });
};
export const normalizeEmail = (email) => email.trim().toLowerCase();
export const getUserByEmail = async (db, email) => {
    const [rows] = await db
        .promise()
        .query("SELECT id, email, first_name, last_name, password_hash, created_at FROM users WHERE email = ? LIMIT 1", [email]);
    const firstRow = rows[0];
    if (!firstRow)
        return null;
    return toUser(firstRow);
};
export const getUserById = async (db, id) => {
    const [rows] = await db
        .promise()
        .query("SELECT id, email, first_name, last_name, password_hash, created_at FROM users WHERE id = ? LIMIT 1", [id]);
    const firstRow = rows[0];
    if (!firstRow)
        return null;
    return toUser(firstRow);
};
export const createUser = async (db, input) => {
    const [result] = await db
        .promise()
        .execute("INSERT INTO users (email, first_name, last_name, password_hash) VALUES (?, ?, ?, ?)", [input.email, input.firstName, input.lastName, input.passwordHash]);
    const user = await getUserById(db, result.insertId);
    if (!user) {
        throw new Error("User creation failed");
    }
    return user;
};
