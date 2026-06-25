"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNAUTHORIZED_EVENT = void 0;
exports.fetchWithAuth = fetchWithAuth;
const authService_1 = require("../service/authService");
exports.UNAUTHORIZED_EVENT = 'app:unauthorized';
async function fetchWithAuth(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(0, authService_1.getToken)()}`,
            ...options.headers,
        },
    });
    if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event(exports.UNAUTHORIZED_EVENT));
    }
    return res;
}
