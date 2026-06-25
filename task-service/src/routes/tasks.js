import { Router } from "express";
import { createTaskController } from "../controllers/TaskController.js";
export const createTasksRouter = (params) => {
    const { rabbit, repo } = params;
    const router = Router();
    const controller = createTaskController({ repo, rabbit });
    router.get("/", controller.listTasks);
    router.post("/", controller.createTask);
    router.get("/:id", controller.getTask);
    router.put("/:id", controller.updateTask);
    router.delete("/:id", controller.deleteTask);
    return router;
};
