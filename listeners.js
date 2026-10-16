
const taskEvents = require("./events");

taskEvents.on("task-created", (data) => {
    setImmediate(async () => {
        try {
            console.log(
                "[Notification] Processing started at:",
                new Date().toISOString()
            );

            // Simulate a slow notification service
            await new Promise((resolve) => {
                setTimeout(resolve, 2000);
            });

            console.log("[Notification] New task created");
            console.log("Task title:", data.task.title);
            console.log("Timestamp:", new Date().toISOString());
            console.log("Assigned user:", data.assignedUser);
            console.log("--------------------------------");
        } catch (error) {
            taskEvents.emit("error", error);
        }
    });
});

taskEvents.on("task-deleted", (task) => {
    console.log(
        `[Notification] Task "${task.title}" was deleted at ${new Date().toISOString()}`
    );
});
taskEvents.on("error", (error) => {
    console.error("[Notification Error]", error.message);
});

console.log("Task event listeners registered");
