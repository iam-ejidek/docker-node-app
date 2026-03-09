const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000; // DevOps Tip: Always use environment variables for Ports

app.use(express.json());

// 1. Health Check Route (Essential for DevOps/Monitoring)
app.get('/health', (req, res) => {
    res.status(200).send('The server is healthy!');
});

// The Root Route - now serving HTML instead of plain text
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Task Control Center | Abdulhamid</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { background-color: #f0f2f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                .navbar { background-color: #1a237e; }
                .hero { background: #1a237e; color: white; padding: 40px 0; margin-bottom: 30px; border-radius: 0 0 20px 20px; }
                .task-card { border-radius: 12px; border: none; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
                .btn-add { background-color: #1a237e; color: white; }
                .btn-add:hover { background-color: #0d47a1; color: white; }
                .status-badge { font-size: 0.8rem; }
            </style>
        </head>
        <body>

            <nav class="navbar navbar-dark shadow-sm">
                <div class="container">
                    <span class="navbar-brand mb-0 h1">DevOps Task Engine v1.1</span>
                    <a href="/health" class="btn btn-outline-light btn-sm">System Health</a>
                </div>
            </nav>

            <header class="hero text-center">
                <div class="container">
                    <h1>Task Management Portal</h1>
                    <p>Engineer: <strong>Abdulhamid Adekunle</strong></p>
                </div>
            </header>

            <main class="container">
                <div class="row g-4">
                    <div class="col-md-5">
                        <div class="card task-card p-4">
                            <h4 class="mb-3">Create New Task</h4>
                            <div class="mb-3">
                                <label class="form-label">Task Title</label>
                                <input type="text" id="taskTitle" class="form-control" placeholder="e.g. Configure Jenkins Pipeline">
                            </div>
                            <button onclick="addTask()" class="btn btn-add w-100">Add to JSON Database</button>
                        </div>
                    </div>

                    <div class="col-md-7">
                        <div class="card task-card p-4">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h4 class="m-0">Active Tasks</h4>
                                <a href="/tasks" target="_blank" class="btn btn-sm btn-link">View Raw JSON</a>
                            </div>
                            <div id="taskList" class="list-group">
                                <div class="text-center py-3 text-muted">Loading environment data...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <script>
                // Logic to fetch and display tasks
                async function loadTasks() {
                    const res = await fetch('/tasks');
                    const tasks = await res.json();
                    const list = document.getElementById('taskList');
                    list.innerHTML = '';
                    
                    tasks.forEach(task => {
                        list.innerHTML += \`
                            <div class="list-group-item d-flex justify-content-between align-items-center border-0 border-bottom">
                                <div>
                                    <h6 class="mb-0">\${task.title}</h6>
                                    <small class="text-muted">ID: \${task.id}</small>
                                </div>
                                <span class="badge bg-primary rounded-pill status-badge">Active</span>
                            </div>
                        \`;
                    });
                }

                // Logic to add a task
                async function addTask() {
                    const title = document.getElementById('taskTitle').value;
                    if(!title) return alert('Enter a task!');

                    await fetch('/tasks', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ title })
                    });

                    document.getElementById('taskTitle').value = '';
                    loadTasks(); // Refresh the list
                }

                // Initial load
                loadTasks();
            </script>
        </body>
        </html>
    `);
});

// 3. POST New Task
app.post('/tasks', (req, res) => {
    const data = fs.readFileSync('./tasks.json', 'utf8');
    const tasks = JSON.parse(data);
    const newTask = { id: Date.now(), title: req.body.title, completed: false };
    tasks.push(newTask);
    fs.writeFileSync('./tasks.json', JSON.stringify(tasks, null, 2));
    res.status(201).json(newTask);
});

app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});