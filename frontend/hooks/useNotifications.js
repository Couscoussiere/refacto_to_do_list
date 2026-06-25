"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNotifications = useNotifications;
const react_1 = require("react");
const WS_URL = 'ws://localhost:8080/notifications/ws';
const AUTO_DISMISS_MS = 5000;
let notifCounter = 0;
function useNotifications() {
    const [notifications, setNotifications] = (0, react_1.useState)([]);
    const dismiss = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };
    (0, react_1.useEffect)(() => {
        let active = true;
        let ws = null;
        let reconnectTimer = null;
        const connect = () => {
            if (!active)
                return;
            ws = new WebSocket(WS_URL);
            ws.onmessage = (event) => {
                if (!active)
                    return;
                try {
                    // Structure : { type: "task.completed", data: { type: "TaskCompleted", occurredAt, data: { taskId, projectId } } }
                    const msg = JSON.parse(event.data);
                    if (!msg.type)
                        return;
                    const inner = msg.data?.data ?? msg.data ?? {};
                    const notif = {
                        id: ++notifCounter,
                        type: msg.type,
                        taskId: inner.taskId,
                        projectId: inner.projectId ?? msg.data?.data?.projectId,
                    };
                    setNotifications(prev => [...prev, notif]);
                    setTimeout(() => {
                        if (active)
                            setNotifications(prev => prev.filter(n => n.id !== notif.id));
                    }, AUTO_DISMISS_MS);
                }
                catch {
                    // message non-JSON ("Connexion WebSocket établie"), on ignore
                }
            };
            ws.onclose = () => {
                if (active)
                    reconnectTimer = setTimeout(connect, 3000);
            };
            ws.onerror = () => ws?.close();
        };
        connect();
        return () => {
            active = false;
            if (reconnectTimer)
                clearTimeout(reconnectTimer);
            ws?.close();
        };
    }, []);
    return { notifications, dismiss };
}
