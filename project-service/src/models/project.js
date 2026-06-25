const toDate = (value) => (value instanceof Date ? value : new Date(value));
const toNullableDate = (value) => value === null ? null : toDate(value);
const toBudgetNumber = (value) => {
    if (typeof value === "number")
        return value;
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
};
export const toProject = (row) => ({
    id: row.id,
    ownerUserId: row.owner_user_id,
    name: row.name,
    description: row.description,
    startDate: toNullableDate(row.start_date),
    dueDate: toNullableDate(row.due_date),
    budget: toBudgetNumber(row.budget),
    status: row.status,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
});
export const toProjectTaskLink = (row) => ({
    projectId: row.project_id,
    taskId: row.task_id,
    createdAt: toDate(row.created_at),
});
