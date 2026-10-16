const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const validateTask = require("../middleware/validateTask");
const Task = require("../models/Task");
const cache = require("../cache/cache");
const taskEvents = require("../events");


// GET ALL TASKS

router.get("/", auth, async (req, res, next) => {
    try {
        const cachedTasks = cache.get("all_tasks");

      if (cachedTasks !== undefined) {
            console.log("CACHE HIT");
            return res.status(200).json(cachedTasks);
        }

        console.log("CACHE MISS");

        const tasks = await Task.find();

        cache.set("all_tasks", tasks);

        res.status(200).json(tasks);
    } catch (err) {
        next(err);
    }
});


// GET TASK BY ID

router.get("/:id", auth, async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json(task);
    } catch (err) {
        next(err);
    }
});


// CREATE NEW TASK

router.post("/", auth, validateTask, async (req, res, next) => {
    try {
        const newTask = await Task.create({
            title: req.body.title,
            description: req.body.description,
            priority: req.body.priority || "medium"
        });

        // Invalidate cached task list
        cache.del("all_tasks");

        // Send the response without waiting for notification work
        res.status(201).json(newTask);

        console.log(
            "[API] Response sent at:",
            new Date().toISOString()
        );

        // Emit the event with task details and authenticated user ID
        taskEvents.emit("task-created", {
            task: newTask,
            assignedUser: req.user?.id || "Unknown"
        });

    } catch (err) {
        next(err);
    }
});

// UPDATE TASK

router.put("/:id", auth, async (req, res, next) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedTask) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Invalidate cached task list
        cache.del("all_tasks");

        res.status(200).json(updatedTask);
    } catch (err) {
        next(err);
    }
});


// DELETE TASK

router.delete("/:id", auth, async (req, res, next) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);

        if (!deletedTask) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Invalidate cached task list
        cache.del("all_tasks");

        // Emit task-deleted event
        taskEvents.emit("task-deleted", deletedTask);

        res.status(200).json({
            message: "Task deleted successfully"
        });
    } catch (err) {
        next(err);
    }
});


module.exports = router;