export const routingKeyForOutgoing = (event) => {
    switch (event.type) {
        case "ProjectCompleted":
            return "project.completed";
    }
};
