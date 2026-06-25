"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.saveUser = saveUser;
exports.getUser = getUser;
exports.getToken = getToken;
exports.saveToken = saveToken;
exports.isAuthenticated = isAuthenticated;
const API_BASE = "http://localhost:8080";
const AUTH_BASE = `${API_BASE}/auth`;
async function register(payload) {
    const response = await fetch(`${AUTH_BASE}/register`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message ?? 'Erreur lors de l\'inscription');
    }
    return response.json();
}
async function login(payload) {
    const response = await fetch(`${AUTH_BASE}/login`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message ?? 'Email ou mot de passe incorrect');
    }
    return response.json();
}
async function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}
function saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}
function getUser() {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
}
function getToken() {
    return localStorage.getItem('token');
}
function saveToken(token) {
    localStorage.setItem('token', token);
}
function isAuthenticated() {
    return getToken() !== null;
}
