export const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
export const parsePositiveInt = (value) => {
    if (typeof value === 'number') {
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
export const isTaskPriority = (value) => value === 'LOW' || value === 'MEDIUM' || value === 'HIGH';
export const isTaskStatus = (value) => value === 'TODO' ||
    value === 'IN_PROGRESS' ||
    value === 'DONE' ||
    value === 'CANCELLED';
export const parseNullableDate = (value) => {
    if (value === undefined)
        return undefined;
    if (value === null)
        return null;
    if (value instanceof Date && !Number.isNaN(value.getTime()))
        return value;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed)
            return null;
        const parsed = new Date(trimmed);
        if (Number.isNaN(parsed.getTime()))
            return undefined;
        return parsed;
    }
    return undefined;
};
