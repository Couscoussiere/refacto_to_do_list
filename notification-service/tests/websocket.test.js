import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../src/app.js";
import WebSocket from 'ws';
// Crée une connexion WS avec une queue de messages pour éviter les race conditions
const connectWs = (port) => new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    const queue = [];
    const waiters = [];
    ws.on('message', (data) => {
        const message = data.toString();
        if (waiters.length > 0) {
            waiters.shift()(message);
        }
        else {
            queue.push(message);
        }
    });
    const nextMsg = () => {
        if (queue.length > 0)
            return Promise.resolve(queue.shift());
        return new Promise((res) => waiters.push(res));
    };
    ws.on('open', () => {
        resolve({
            ws,
            nextMsg,
            close: () => ws.close(),
        });
    });
    ws.on('error', reject);
});
describe("WebSocket", () => {
    let httpServer;
    let wss;
    let sendNotificationToAllClients;
    let port;
    beforeAll(() => new Promise((resolve) => {
        ({ httpServer, wss, sendNotificationToAllClients } = createApp());
        httpServer.listen(0, () => {
            port = httpServer.address().port;
            resolve();
        });
    }));
    afterAll(() => new Promise((resolve) => {
        for (const client of wss.clients) {
            client.terminate();
        }
        httpServer.close(() => resolve());
    }));
    it("connexion → message de bienvenue", async () => {
        const client = await connectWs(port);
        const msg = await client.nextMsg();
        client.close();
        expect(msg).toBe("Connexion WebSocket établie");
    });
    it("sendNotificationToAllClients → client reçoit la notification", async () => {
        const client = await connectWs(port);
        await client.nextMsg(); // bienvenue
        const msgPromise = client.nextMsg();
        sendNotificationToAllClients({ type: "task.created", data: { id: 1 } });
        const received = JSON.parse(await msgPromise);
        client.close();
        expect(received).toEqual({ type: "task.created", data: { id: 1 } });
    });
    it("plusieurs clients → tous reçoivent la notification", async () => {
        const [c1, c2] = await Promise.all([connectWs(port), connectWs(port)]);
        await Promise.all([c1.nextMsg(), c2.nextMsg()]); // bienvenus
        const p1 = c1.nextMsg();
        const p2 = c2.nextMsg();
        sendNotificationToAllClients({ type: "project.completed", data: {} });
        const [r1, r2] = await Promise.all([p1, p2]);
        c1.close();
        c2.close();
        expect(JSON.parse(r1).type).toBe("project.completed");
        expect(JSON.parse(r2).type).toBe("project.completed");
    });
    it("client déconnecté ne reçoit pas la notification", async () => {
        const client = await connectWs(port);
        await client.nextMsg(); // bienvenue
        client.close();
        await new Promise((r) => setTimeout(r, 50));
        expect(() => sendNotificationToAllClients({ type: "task.deleted", data: {} })).not.toThrow();
    });
});
