const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const themeBtn = document.getElementById("theme-btn");
const prioritySelect = document.getElementById("priority-select");
const tabBtns = document.querySelectorAll(".tab-btn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentCategory = "Personal";


tasks = tasks.map(task => ({
    ...task,
    id: task.id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
    category: task.category || "Personal"
}));


function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        tabBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.dataset.category;
        renderTasks();
    });
});


function renderTasks() {

    taskList.innerHTML = "";

    
    let filteredTasks = tasks.filter(task => task.category === currentCategory);

    
    filteredTasks.sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
    });

    filteredTasks.forEach((task) => {

        const li = document.createElement("li");

        li.className = task.completed
            ? "task-item completed"
            : "task-item";

        
        let tagText = task.priority || "Important";
        let tagClass = (task.priority || "important").toLowerCase().replace(" ", "-");
        
        if (task.completed) {
            tagText = "Done";
            tagClass = "done";
        }

        li.innerHTML = `
            <input type="checkbox" class="task-check"
                ${task.completed ? "checked" : ""}>

            <div class="task-content">
                <span class="task-text">${task.text}</span>

                <span class="priority ${tagClass}">
                    ${tagText}
                </span>

                <span class="task-time">
                    Added: ${task.createdAt}
                </span>
            </div>

            <button class="delete-btn">X</button>
        `;

        const checkbox = li.querySelector(".task-check");
        const deleteBtn = li.querySelector(".delete-btn");

        checkbox.addEventListener("change", () => {
            const taskIndex = tasks.findIndex(t => t.id === task.id);
            if (taskIndex !== -1) {
                tasks[taskIndex].completed = checkbox.checked;
                saveTasks();
                renderTasks();
            }
        });

        deleteBtn.addEventListener("click", () => {
            const taskIndex = tasks.findIndex(t => t.id === task.id);
            if (taskIndex !== -1) {
                tasks.splice(taskIndex, 1);
                saveTasks();
                renderTasks();
            }
        });

        taskList.appendChild(li);
    });
}


addBtn.addEventListener("click", () => {

    const taskText = taskInput.value.trim();

    if (taskText === "") return;

    tasks.push({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        text: taskText,
        completed: false,
        priority: prioritySelect.value,
        category: currentCategory,
        createdAt: new Date().toLocaleString()
    });

    saveTasks();
    renderTasks();

    taskInput.value = "";
});


taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addBtn.click();
    }
});


function updateThemeIcon() {

    if (document.body.classList.contains("dark-mode")) {
        themeBtn.innerHTML =
            '<i class="fa-solid fa-sun"></i>';
    } else {
        themeBtn.innerHTML =
            '<i class="fa-solid fa-moon"></i>';
    }
}


themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    const currentTheme =
        document.body.classList.contains("dark-mode")
        ? "dark"
        : "light";

    localStorage.setItem("theme", currentTheme);

    updateThemeIcon();
});


if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
}

updateThemeIcon();


renderTasks();

