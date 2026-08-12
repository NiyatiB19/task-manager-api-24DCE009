const express = require("express");
const router = express.Router();

const tasks = require("../data/tasks");

// GET all tasks
router.get("/", (req, res) => {
    res.status(200).json(tasks);
});

// POST new task
router.post("/", (req, res) => {

    const newTask = {
        id: tasks.length + 1,
        title: req.body.title,
        completed: false
    };

    tasks.push(newTask);

    res.status(201).json(newTask);

});

// PUT update task
router.put("/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const task = tasks.find(t => t.id === id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    task.title = req.body.title;
    task.completed = req.body.completed;

    res.status(200).json(task);

});

// DELETE task
router.delete("/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const index = tasks.findIndex(t => t.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    tasks.splice(index, 1);

    res.status(200).json({
        message: "Task deleted successfully"
    });

});

module.exports = router;