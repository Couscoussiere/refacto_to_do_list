import { toProject, } from '../models/project.js';
export const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
export const parsePositiveInt = (value) => {
    if (isFiniteNumber(value)) {
        if (!Number.isInteger(value) || value <= 0)
            return null;
        return value;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length === 0)
            return null;
        const parsed = Number.parseInt(trimmed, 10);
        if (!Number.isFinite(parsed) || parsed <= 0)
            return null;
        return parsed;
    }
    return null;
};
const allowedProjectStatuses = new Set([
    'NOT_STARTED',
    'PENDING',
    'IN_PROGRESS',
    'DONE',
]);
export const parseProjectStatus = (value) => {
    if (!isNonEmptyString(value))
        return null;
    const status = value.trim().toUpperCase();
    return allowedProjectStatuses.has(status) ? status : null;
};
const isValidDateOnly = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);
export const parseDateOnlyOrNull = (value) => {
    if (value === undefined || value === null)
        return null;
    if (!isNonEmptyString(value))
        return null;
    const trimmed = value.trim();
    if (!isValidDateOnly(trimmed))
        return null;
    return trimmed;
};
export const parseBudgetOrDefault = (value) => {
    if (value === undefined || value === null || value === '')
        return 0;
    if (isFiniteNumber(value))
        return value;
    if (typeof value === 'string') {
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
};
export const badRequest = (req, res, message) => {
    res.status(400).json({
        message,
        received: {
            contentType: req.header('content-type'),
            keys: Object.keys((req.body ?? {})),
        },
    });
};
const MAX_DATE = new Date("2100-12-31");
export const datesAreValid = (startDate, dueDate) => {
    if (!startDate || !dueDate)
        return false;
    if (isNaN(startDate.getTime()) || isNaN(dueDate.getTime()))
        return false;
    if (startDate > MAX_DATE || dueDate > MAX_DATE)
        return false;
    if (startDate > dueDate)
        return false;
    return true;
};
export const getProjectById = async (db, id) => {
    const [rows] = await db
        .promise()
        .query('SELECT id, owner_user_id, name, description, start_date, due_date, budget, status, created_at, updated_at FROM projects WHERE id = ? LIMIT 1', [id]);
    const firstRow = rows[0];
    if (!firstRow)
        return null;
    return toProject(firstRow);
};
