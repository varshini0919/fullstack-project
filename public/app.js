const API_URL = '/api';
let isLoginMode = true;

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');

// Utils
function getToken() { return localStorage.getItem('token'); }
function getUser() { return JSON.parse(localStorage.getItem('user')); }

function init() {
    if (getToken()) {
        showDashboard();
    } else {
        showAuth();
    }
}

function showAuth() {
    authSection.style.display = 'block';
    dashboardSection.style.display = 'none';
}

async function showDashboard() {
    authSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    
    const user = getUser();
    document.getElementById('user-info').innerText = `${user.name} (${user.role})`;

    if (user.role === 'Admin') {
        document.getElementById('admin-controls').style.display = 'block';
        loadUsersForTask();
    } else {
        document.getElementById('admin-controls').style.display = 'none';
    }

    loadDashboardStats();
    loadTasks();
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? 'Login' : 'Register';
    document.getElementById('name').style.display = isLoginMode ? 'none' : 'block';
    document.getElementById('role').style.display = isLoginMode ? 'none' : 'block';
    if (!isLoginMode) document.getElementById('name').required = true;
    else document.getElementById('name').required = false;

    document.getElementById('toggle-auth').innerHTML = isLoginMode 
        ? 'Need an account? <span onclick="toggleAuthMode()">Register here</span>' 
        : 'Have an account? <span onclick="toggleAuthMode()">Login here</span>';
}

document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    let url = `${API_URL}/auth/login`;
    let body = { email, password };

    if (!isLoginMode) {
        url = `${API_URL}/auth/register`;
        body.name = document.getElementById('name').value;
        body.role = document.getElementById('role').value;
    }

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.msg || 'Error occurred');

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        showDashboard();
    } catch (err) {
        document.getElementById('auth-error').innerText = err.message;
    }
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAuth();
}

async function loadDashboardStats() {
    try {
        const res = await fetch(`${API_URL}/tasks/dashboard`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();
        document.getElementById('stat-total').innerText = data.total;
        document.getElementById('stat-pending').innerText = data.pending;
        document.getElementById('stat-completed').innerText = data.completed;
    } catch (err) {
        console.error(err);
    }
}

async function loadTasks() {
    try {
        const res = await fetch(`${API_URL}/tasks`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const tasks = await res.json();
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';

        if(tasks.length === 0) {
            taskList.innerHTML = '<p>No tasks found.</p>';
            return;
        }

        tasks.forEach(task => {
            const assigneeName = task.assignedTo ? task.assignedTo.name : 'Unassigned';
            const html = `
                <div class="task-item ${task.status === 'Completed' ? 'completed' : ''}">
                    <div>
                        <h4>${task.title}</h4>
                        <small>${task.description || ''}</small>
                        <small style="margin-top: 5px;"><strong>Assigned to:</strong> ${assigneeName}</small>
                    </div>
                    <div>
                        <select onchange="updateTaskStatus('${task._id}', this.value)">
                            <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </div>
                </div>
            `;
            taskList.innerHTML += html;
        });
    } catch (err) {
        console.error(err);
    }
}

async function loadUsersForTask() {
    try {
        const res = await fetch(`${API_URL}/auth/users`);
        const users = await res.json();
        const select = document.getElementById('task-assignee');
        select.innerHTML = '<option value="">Select Assignee</option>';
        users.forEach(u => {
            if (u.role !== 'Admin') {
                select.innerHTML += `<option value="${u._id}">${u.name}</option>`;
            }
        });
    } catch (err) {
        console.error(err);
    }
}

document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;
    const assignedTo = document.getElementById('task-assignee').value;

    try {
        const res = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ title, description, assignedTo })
        });
        if (res.ok) {
            document.getElementById('task-title').value = '';
            document.getElementById('task-desc').value = '';
            loadDashboardStats();
            loadTasks();
            alert('Task Created');
        }
    } catch (err) {
        console.error(err);
    }
});

async function updateTaskStatus(id, newStatus) {
    try {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            loadDashboardStats();
            loadTasks(); 
        }
    } catch (err) {
        console.error(err);
    }
}

// Start
init();
