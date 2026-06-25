"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProjects = getAllProjects;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
exports.createProject = createProject;
const fetchWithAuth_1 = require("../utils/fetchWithAuth");
const API_BASE = "http://localhost:8080";
const PROJECT_BASE = `${API_BASE}/projects/`;
async function getAllProjects() {
    const res = await (0, fetchWithAuth_1.fetchWithAuth)(PROJECT_BASE);
    if (!res.ok)
        throw new Error('Erreur lors du chargement des projets');
    const data = await res.json();
    return data.projects;
}
async function updateProject(id, payload) {
    const res = await (0, fetchWithAuth_1.fetchWithAuth)(`${PROJECT_BASE}${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur lors de la mise à jour du projet');
    }
    const data = await res.json();
    return data.project;
}
async function deleteProject(id) {
    const res = await (0, fetchWithAuth_1.fetchWithAuth)(`${PROJECT_BASE}${id}`, { method: 'DELETE' });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur lors de la suppression du projet');
    }
}
async function createProject(payload) {
    const res = await (0, fetchWithAuth_1.fetchWithAuth)(`${PROJECT_BASE}create`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur lors de la création du projet');
    }
    const data = await res.json();
    return data.project;
}
