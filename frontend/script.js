// Load all tasks when page opens
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("taskManagerToken")) {
        showPage("tasksPage");
        loadTasks();
    } else {
        showPage("loginPage");
    }
});

function showPage(pageId) {
    document.querySelectorAll(".auth-page, #tasksPage").forEach(page => {
        page.classList.toggle("hidden", page.id !== pageId);
    });
}

async function registerUser(event) {
    event.preventDefault();

    await authenticate(
        "/api/auth/register",
        {
            name: document.getElementById("registerName").value.trim(),
            email: document.getElementById("registerEmail").value.trim(),
            phone: document.getElementById("registerPhone").value.trim(),
            password: document.getElementById("registerPassword").value
        },
        "registerMessage",
        "Registration successful. You can now log in."
    );
}

async function loginUser(event) {
    event.preventDefault();

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: document.getElementById("loginEmail").value.trim(),
                password: document.getElementById("loginPassword").value
            })
        });
        const data = await response.json();

        if (!response.ok) {
            showAuthMessage("loginMessage", data.message || "Login failed.");
            return;
        }

        localStorage.setItem("taskManagerToken", data.token);
        showPage("tasksPage");
        await loadTasks();
    } catch (error) {
        showAuthMessage("loginMessage", "Unable to connect to the server.");
    }
}

async function authenticate(endpoint, userData, messageId, successMessage) {
    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        showAuthMessage(messageId, response.ok ? successMessage : (data.message || "Request failed."));
        if (response.ok && endpoint.endsWith("/register")) {
            document.getElementById("registerPassword").value = "";
            showPage("loginPage");
            showAuthMessage("loginMessage", successMessage);
        }
    } catch (error) {
        showAuthMessage(messageId, "Unable to connect to the server.");
    }
}

function logoutUser() {
    localStorage.removeItem("taskManagerToken");
    showPage("loginPage");
    showAuthMessage("loginMessage", "Logged out.");
}

function showAuthMessage(messageId, message) {
    document.getElementById(messageId).textContent = message;
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("taskManagerToken")}`
    };
}


// GET all tasks
async function loadTasks() {

    try {

        const response = await fetch("/tasks", { headers: authHeaders() });

        const tasks = await response.json();

        if (response.status === 401) {
            logoutUser();
            return;
        }

        displayTasks(tasks);

    } catch (error) {

        console.error("Error loading tasks:", error);

    }
}


// Display tasks on page
function displayTasks(tasks) {

    const taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    if (tasks.length === 0) {

        taskList.innerHTML = "<p>No tasks available.</p>";

        return;
    }

    tasks.forEach(task => {

        const taskDiv = document.createElement("div");

        taskDiv.className = "task";

        const priority = (task.priority || "medium").toLowerCase();
        const statusText = task.completed ? "completed" : "pending";

        taskDiv.innerHTML = `
            <div class="task-header">
                <button
                    class="status-toggle ${task.completed ? "done" : ""}"
                    onclick="toggleTask('${task._id}', ${task.completed})"
                    aria-label="Toggle task status"
                    title="Toggle status">
                    ${task.completed ? "✓" : ""}
                </button>

                <div class="task-content">
                    <h3 class="${task.completed ? "completed" : ""}">
                        ${task.title}
                    </h3>

                    <p>${task.description || ""}</p>

                    <div class="task-meta">
                        <span class="status ${task.completed ? "completed-label" : "pending-label"}">${statusText}</span>
                        <span class="priority ${priority}">${priority.toUpperCase()}</span>
                    </div>
                </div>
            </div>

            <div class="actions">
                <button
                    class="edit"
                    onclick="editTask('${task._id}', '${escapeQuotes(task.title)}', '${escapeQuotes(task.description || "")}', '${task.priority || "medium"}')">
                    Edit
                </button>

                <button
                    class="delete"
                    onclick="deleteTask('${task._id}')">
                    Delete
                </button>
            </div>
        `;

        taskList.appendChild(taskDiv);
    });
}


// Add a new task
async function addTask() {

    const titleInput = document.getElementById("title");
    const descriptionInput = document.getElementById("description");
    const priorityInput = document.getElementById("priority");

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const priority = priorityInput.value;

    if (!title) {

        alert("Task title is required.");

        return;
    }

    try {

        const response = await fetch("/tasks", {

            method: "POST",

            headers: {
                ...authHeaders()
            },

            body: JSON.stringify({
                title: title,
                description: description,
                priority: priority
            })

        });

        const data = await response.json();

        if (!response.ok) {

            alert(data.message || "Failed to add task.");

            return;
        }

        titleInput.value = "";
        descriptionInput.value = "";
        priorityInput.value = "medium";

        await loadTasks();

    } catch (error) {

        console.error("Error adding task:", error);

        alert("Failed to add task.");
    }
}


// Edit a task
async function editTask(id, oldTitle, oldDescription, oldPriority) {

    const newTitle = prompt("Enter new title:", oldTitle);

    if (newTitle === null) {
        return;
    }

    const newDescription = prompt(
        "Enter new description:",
        oldDescription
    );

    if (newDescription === null) {
        return;
    }

    const newPriority = prompt(
        "Enter priority (low, medium, high):",
        oldPriority
    );

    if (newPriority === null) {
        return;
    }

    const normalizedPriority = (newPriority || "medium").trim().toLowerCase();

    if (newTitle.trim() === "") {

        alert("Title cannot be empty.");

        return;
    }

    if (!["low", "medium", "high"].includes(normalizedPriority)) {

        alert("Priority must be low, medium, or high.");

        return;
    }

    try {

        const response = await fetch(`/tasks/${id}`, {

            method: "PUT",

            headers: {
                ...authHeaders()
            },

            body: JSON.stringify({
                title: newTitle.trim(),
                description: newDescription.trim(),
                priority: normalizedPriority
            })

        });

        const data = await response.json();

        if (!response.ok) {

            alert(data.message || "Failed to update task.");

            return;
        }

        await loadTasks();

    } catch (error) {

        console.error("Error updating task:", error);

        alert("Failed to update task.");
    }
}


// Delete a task
async function deleteTask(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(`/tasks/${id}`, {

            method: "DELETE",
            headers: authHeaders()

        });

        const data = await response.json();

        if (!response.ok) {

            alert(data.message || "Failed to delete task.");

            return;
        }

        await loadTasks();

    } catch (error) {

        console.error("Error deleting task:", error);

        alert("Failed to delete task.");
    }
}


// Complete / Undo task
async function toggleTask(id, currentStatus) {

    try {

        const response = await fetch(`/tasks/${id}`, {

            method: "PUT",

            headers: {
                ...authHeaders()
            },

            body: JSON.stringify({
                completed: !currentStatus
            })

        });

        const data = await response.json();

        if (!response.ok) {

            alert(data.message || "Failed to update task.");

            return;
        }

        await loadTasks();

    } catch (error) {

        console.error("Error updating task:", error);

        alert("Failed to update task.");
    }
}


// Prevent quotes from breaking onclick attributes
function escapeQuotes(text) {

    return text
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, "&quot;");
}