const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const themeBtn = document.getElementById("theme-btn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

/* Save Tasks */
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* Display Tasks */
function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        const li = document.createElement("li");

        li.className = task.completed
            ? "task-item completed"
            : "task-item";

        li.innerHTML = `
            <input type="checkbox" class="task-check" ${task.completed ? "checked" : ""}>
            <span class="task-text">${task.text}</span>
            <button class="delete-btn">🗑️</button>
        `;

        const checkbox = li.querySelector(".task-check");
        const deleteBtn = li.querySelector(".delete-btn");

        checkbox.addEventListener("change", () => {
            tasks[index].completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        deleteBtn.addEventListener("click", () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        });

        taskList.appendChild(li);
    });
}

/* Add Task */
addBtn.addEventListener("click", () => {
    const taskText = taskInput.value.trim();

    if (taskText === "") return;

    tasks.push({
        text: taskText,
        completed: false
    });

    saveTasks();
    renderTasks();

    taskInput.value = "";
});

/* Add Task using Enter Key */
taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addBtn.click();
    }
});

/* Dark Mode */


function updateThemeIcon() {
    if (document.body.classList.contains("dark-mode")) {
        themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const currentTheme = document.body.classList.contains("dark-mode")
        ? "dark"
        : "light";

    localStorage.setItem("theme", currentTheme);

    updateThemeIcon();
});

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
}

updateThemeIcon();

/* Load Saved Theme */
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
}

updateThemeIcon();

/* Initial Render */
renderTasks();


