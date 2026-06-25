const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const parsePositiveInt = (value) => {
    if (typeof value === "number") {
        if (!Number.isInteger(value) || value <= 0)
            return null;
        return value;
    }
    if (typeof value === "string") {
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
const getTaskServiceUrl = () => {
    const baseUrl = process.env.TASK_SERVICE_URL || "http://localhost:3002";
    return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
};
export const createProjectTasksController = (db) => {
    const createTaskForProject = async (req, res) => {
        try {
            const projectId = parsePositiveInt(req.params.id);
            const body = (req.body ?? {});
            const title = isNonEmptyString(body.title) ? body.title.trim() : isNonEmptyString(body.name) ? body.name.trim() : "";
            if (!projectId || !title) {
                res.status(400).json({ message: "Invalid project id or title" });
                return;
            }
            const response = await fetch(`${getTaskServiceUrl()}/tasks`, {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                },
                body: JSON.stringify({ projectId, title }),
            });
            if (!response.ok) {
                const text = await response.text().catch(() => "");
                res.status(502).json({ message: "task-service error", status: response.status, body: text });
                return;
            }
            const json = (await response.json());
            const task = json.task;
            if (!task || typeof task.id !== "number") {
                res.status(502).json({ message: "Invalid task-service response" });
                return;
            }
            await db
                .promise()
                .execute("INSERT INTO project_tasks (project_id, task_id) VALUES (?, ?)", [projectId, task.id]);
            res.status(201).json({ task });
        }
        catch (error) {
            console.error("createTaskForProject error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    };
    const listTasksForProject = async (req, res) => {
        try {
            const projectId = parsePositiveInt(req.params.id);
            if (!projectId) {
                res.status(400).json({ message: "Invalid project id" });
                return;
            }
            const response = await fetch(`${getTaskServiceUrl()}/tasks?projectId=${projectId}`, {
                headers: { accept: "application/json" },
            });
            if (!response.ok) {
                const text = await response.text().catch(() => "");
                res.status(502).json({ message: "task-service error", status: response.status, body: text });
                return;
            }
            const json = (await response.json());
            res.status(200).json({ tasks: Array.isArray(json.tasks) ? json.tasks : [] });
        }
        catch (error) {
            console.error("listTasksForProject error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    };
    return { createTaskForProject, listTasksForProject };
};
