export const getRoutingKey = (event) => {
    switch (event.type) {
        case "TaskCreated": return "task.created";
        case "TaskCompleted": return "task.completed";
        case "TaskReopened": return "task.reopened";
        case "TaskCancelled": return "task.cancelled";
        case "TaskStarted": return "task.started";
        case "TaskDeleted": return "task.deleted";
    }
};
