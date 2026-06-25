"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTasksByProject = getTasksByProject;
exports.createTask = createTask;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
exports.updateTaskStatus = updateTaskStatus;
const fetchWithAuth_1 = require("../utils/fetchWithAuth");
const API_BASE = "http://localhost:8080";
const TASK_BASE = `${API_BASE}/tasks/`;
async function getTasksByProject(projectId) {
    const res = await (0, fetchWithAuth_1.fetchWithAuth)(`${TASK_BASE}?projectId=${projectId}`);
    if (!res.ok)
        throw new Error('Erreur lors du chargement des tâches');
    const data = await res.json();
    return data.tasks;
}
async function createTask(payload) {
    const res = await (0, fetchWithAuth_1.fetchWithAuth)(TASK_BASE, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur lors de la création de la tâche');
    }
    const data = await res.json();
    return data.task;
}
async function updateTask(id, payload) {
    const res = await (0, fetchWithAuth_1.fetchWithAuth)(`${TASK_BASE}${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur lors de la mise à jour');
    }
    const data = await res.json();
    return data.task;
}
async function deleteTask(id) {
    const res = await (0, fetchWithAuth_1.fetchWithAuth)(`${TASK_BASE}${id}`, { method: 'DELETE' });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur lors de la suppression');
    }
}
async function updateTaskStatus(id, status) {
    const res = await (0, fetchWithAuth_1.fetchWithAuth)(`${TASK_BASE}${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur lors de la mise à jour');
    }
    const data = await res.json();
    return data.task;
}
