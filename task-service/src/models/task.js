const toDate = (value) => (value instanceof Date ? value : new Date(value));
const toNullableDate = (value) => {
    if (value === null)
        return null;
    return toDate(value);
};
export const toTask = (row) => ({
    id: Number(row.id),
    projectId: Number(row.project_id),
    userId: Number(row.user_id),
    name: row.name,
    description: row.description,
    priority: row.priority,
    status: row.status,
    dueDate: toNullableDate(row.due_date),
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
});
