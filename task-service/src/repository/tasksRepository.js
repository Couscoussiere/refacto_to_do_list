import { toTask } from "../models/task.js";
export const createTasksRepository = (db) => {
    const create = async (input) => {
        const [result] = await db
            .promise()
            .execute("INSERT INTO tasks (project_id, user_id, name, description, priority, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)", [
            input.projectId,
            input.userId,
            input.name,
            input.description ?? null,
            input.priority ?? "MEDIUM",
            input.status ?? "TODO",
            input.dueDate ?? null,
        ]);
        const created = await getById(Number(result.insertId));
        if (!created)
            throw new Error("Task creation failed");
        return created;
    };
    const getById = async (id) => {
        const [rows] = await db
            .promise()
            .query("SELECT id, project_id, user_id, name, description, priority, status, due_date, created_at, updated_at FROM tasks WHERE id = ? LIMIT 1", [id]);
        const row = rows[0];
        return row ? toTask(row) : null;
    };
    const list = async (filter) => {
        if (filter?.projectId) {
            const [rows] = await db
                .promise()
                .query("SELECT id, project_id, user_id, name, description, priority, status, due_date, created_at, updated_at FROM tasks WHERE project_id = ? ORDER BY id ASC", [filter.projectId]);
            return rows.map(toTask);
        }
        const [rows] = await db
            .promise()
            .query("SELECT id, project_id, user_id, name, description, priority, status, due_date, created_at, updated_at FROM tasks ORDER BY id ASC");
        return rows.map(toTask);
    };
    const update = async (id, patch) => {
        const before = await getById(id);
        if (!before)
            return null;
        const name = patch.name ?? before.name;
        const description = patch.description !== undefined ? patch.description : before.description;
        const userId = patch.userId !== undefined ? patch.userId : before.userId;
        const priority = patch.priority ?? before.priority;
        const status = patch.status ?? before.status;
        const dueDate = patch.dueDate !== undefined ? patch.dueDate : before.dueDate;
        await db
            .promise()
            .execute("UPDATE tasks SET name = ?, description = ?, user_id = ?, priority = ?, status = ?, due_date = ? WHERE id = ?", [name, description, userId, priority, status, dueDate, id]);
        const after = await getById(id);
        if (!after)
            return null;
        return { before, after };
    };
    const remove = async (id) => {
        const [result] = await db
            .promise()
            .execute("DELETE FROM tasks WHERE id = ?", [id]);
        return result.affectedRows > 0;
    };
    return { create, getById, list, update, remove };
};
