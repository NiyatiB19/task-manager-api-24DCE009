const express = require("express");

const app = express();

const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const taskRoutes = require("./routes/tasks");

// Middleware
app.use(express.json());
app.use(logger);

// Home Route
app.get("/", (req, res) => {
    res.send("Task Management API is Running...");
});

// Routes
app.use("/tasks", taskRoutes);

// Error Handler (Always Last)
app.use(errorHandler);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});