const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const authRoutes = require("./routes/auth");
require("dotenv").config();
require("./listeners");
require("./middleware/auth");
require("./middleware/errorHandler");
require("./routes/auth");
require("./routes/tasks");

const app = express();

const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const taskRoutes = require("./routes/tasks");

// Middleware
app.use(express.json());
app.use(logger);
app.use("/api/auth", authRoutes);
// Serve frontend
app.use(express.static(path.join(__dirname, "frontend")));

// Home Route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Routes
app.use("/tasks", taskRoutes);

// Error Handler (Always Last)
app.use(errorHandler);

// MongoDB Connection
/*
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
*/
// Connect to MongoDB and start the server only when run directly
if (require.main === module) {
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => {
            console.log("MongoDB connected");
        })
        .catch((err) => {
            console.error("MongoDB connection error:", err);
        });

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export app for automated testing
module.exports = app;