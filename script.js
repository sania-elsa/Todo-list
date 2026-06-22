const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const themeBtn = document.getElementById("theme-btn");
const prioritySelect = document.getElementById("priority-select");
const workspaceTabsContainer = document.getElementById("workspace-tabs-container");
const addWorkspaceBtn = document.getElementById("add-workspace-btn");


let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let workspaces = JSON.parse(localStorage.getItem("workspaces")) || ["Workspace"];
let currentWorkspace = localStorage.getItem("currentWorkspace") || "Workspace";

if (!workspaces.includes(currentWorkspace)) {
    currentWorkspace = "Workspace";
}


tasks = tasks.map(task => {
    const ws = task.workspace || task.category || "Workspace";
    const { category, ...rest } = task; 
    return {
        ...rest,
        id: task.id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
        workspace: workspaces.includes(ws) ? ws : "Workspace"
    };
});

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveWorkspaces() {
    localStorage.setItem("workspaces", JSON.stringify(workspaces));
    localStorage.setItem("currentWorkspace", currentWorkspace);
}

function renderWorkspaces() {
    workspaceTabsContainer.innerHTML = "";
    
    workspaces.forEach(ws => {
        const btn = document.createElement("button");
        btn.className = "tab-btn";
        if (ws === currentWorkspace) btn.classList.add("active");
        
        const nameSpan = document.createElement("span");
        nameSpan.className = "workspace-name";
        nameSpan.textContent = ws;
        btn.appendChild(nameSpan);
        
        if (ws !== "Workspace") {
            const deleteIcon = document.createElement("button");
            deleteIcon.className = "workspace-delete-btn";
            deleteIcon.innerHTML = '<i class="fa-solid fa-times"></i>';
            deleteIcon.title = "Delete Workspace";
            
            deleteIcon.addEventListener("click", (e) => {
                e.stopPropagation();
                deleteWorkspace(ws);
            });
            
            btn.appendChild(deleteIcon);
            
            
            btn.addEventListener("dblclick", (e) => {
                e.stopPropagation();
                renameWorkspaceInline(ws, nameSpan, btn);
            });
            btn.title = "Double-click to rename";
        }
        
        btn.addEventListener("click", () => {
            currentWorkspace = ws;
            saveWorkspaces();
            renderWorkspaces();
            renderTasks();
        });
        
        workspaceTabsContainer.appendChild(btn);
    });
}

function renameWorkspaceInline(oldName, nameSpan, btn) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = oldName;
    input.className = "workspace-edit-input";
    
    nameSpan.replaceWith(input);
    input.focus();
    
    
    const originalOnClick = btn.onclick;
    btn.onclick = (e) => e.stopPropagation();

    const saveRename = () => {
        const newName = input.value.trim();
        if (newName === "" || newName === oldName) {
            renderWorkspaces();
            return;
        }
        if (workspaces.includes(newName)) {
            alert("A workspace with this name already exists!");
            renderWorkspaces();
            return;
        }
        const wsIndex = workspaces.indexOf(oldName);
        if (wsIndex !== -1) workspaces[wsIndex] = newName;
        if (currentWorkspace === oldName) currentWorkspace = newName;
        tasks = tasks.map(task => task.workspace === oldName ? { ...task, workspace: newName } : task);
        saveWorkspaces();
        saveTasks();
        renderWorkspaces();
        renderTasks();
    };

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveRename();
        else if (e.key === "Escape") renderWorkspaces();
    });
    
    input.addEventListener("blur", () => {
        saveRename(); 
    });
}

function addWorkspace() {
    if (workspaceTabsContainer.querySelector(".workspace-edit-input")) return;

    const btn = document.createElement("button");
    btn.className = "tab-btn";
    
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "New Workspace";
    input.className = "workspace-edit-input";
    
    btn.appendChild(input);
    workspaceTabsContainer.appendChild(btn);
    
    input.focus();
    
    const saveNewWorkspace = () => {
        const wsName = input.value.trim();
        if (wsName === "") {
            renderWorkspaces();
            return;
        }
        if (workspaces.includes(wsName)) {
            alert("Workspace already exists!");
            renderWorkspaces();
            return;
        }
        workspaces.push(wsName);
        currentWorkspace = wsName;
        saveWorkspaces();
        renderWorkspaces();
        renderTasks();
    };

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveNewWorkspace();
        else if (e.key === "Escape") renderWorkspaces();
    });

    input.addEventListener("blur", () => {
        if (input.value.trim() !== "") saveNewWorkspace();
        else renderWorkspaces();
    });
}

function deleteWorkspace(wsName) {
    if (wsName === "Workspace") return;
    
    if (!confirm(`Are you sure you want to delete the "${wsName}" workspace?\nTasks will be moved to the default "Workspace".`)) {
        return;
    }
    
    workspaces = workspaces.filter(ws => ws !== wsName);
    
    tasks = tasks.map(task => {
        if (task.workspace === wsName) {
            return { ...task, workspace: "Workspace" };
        }
        return task;
    });
    
    if (currentWorkspace === wsName) {
        currentWorkspace = "Workspace";
    }
    
    saveWorkspaces();
    saveTasks();
    renderWorkspaces();
    renderTasks();
}

addWorkspaceBtn.addEventListener("click", addWorkspace);

function editTaskInline(task, taskTextEl) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = task.text;
    input.className = "task-edit-input";
    
    taskTextEl.replaceWith(input);
    input.focus();
    
    const saveTaskEdit = () => {
        const newText = input.value.trim();
        if (newText !== "") {
            const taskIndex = tasks.findIndex(t => t.id === task.id);
            if (taskIndex !== -1) {
                tasks[taskIndex].text = newText;
                saveTasks();
            }
        }
        renderTasks();
        
        
        setTimeout(() => {
            const newLi = document.querySelector(`.task-item[data-id="${task.id}"]`);
            if (newLi) newLi.focus();
        }, 0);
    };

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.stopPropagation(); 
            saveTaskEdit();
        } else if (e.key === "Escape") {
            e.stopPropagation();
            renderTasks();
            setTimeout(() => {
                const newLi = document.querySelector(`.task-item[data-id="${task.id}"]`);
                if (newLi) newLi.focus();
            }, 0);
        }
    });
    
    input.addEventListener("blur", () => saveTaskEdit());
}

function renderTasks() {
    taskList.innerHTML = "";
    
    let filteredTasks = tasks.filter(task => task.workspace === currentWorkspace);
    
    filteredTasks.sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
    });

    filteredTasks.forEach((task) => {
        const li = document.createElement("li");
        li.className = task.completed ? "task-item completed" : "task-item";
        li.tabIndex = 0; // Make focusable for keyboard navigation
        li.dataset.id = task.id;
        
        let tagText = task.priority || "Important";
        let tagClass = (task.priority || "important").toLowerCase().replace(" ", "-");
        
        if (task.completed) {
            tagText = "Done";
            tagClass = "done";
        }

        li.innerHTML = `
            <input type="checkbox" class="task-check" ${task.completed ? "checked" : ""} tabindex="-1">
            <div class="task-content">
                <span class="task-text">${task.text}</span>
                <span class="priority ${tagClass}">${tagText}</span>
                <span class="task-time">Added: ${task.createdAt}</span>
            </div>
            <button class="delete-btn" tabindex="-1">X</button>
        `;

        const checkbox = li.querySelector(".task-check");
        const deleteBtn = li.querySelector(".delete-btn");
        const taskTextEl = li.querySelector(".task-text");

        checkbox.addEventListener("change", () => {
            const taskIndex = tasks.findIndex(t => t.id === task.id);
            if (taskIndex !== -1) {
                tasks[taskIndex].completed = checkbox.checked;
                saveTasks();
                renderTasks();
            }
        });

        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const taskIndex = tasks.findIndex(t => t.id === task.id);
            if (taskIndex !== -1) {
                tasks.splice(taskIndex, 1);
                saveTasks();
                renderTasks();
            }
        });

        li.addEventListener("dblclick", () => {
            editTaskInline(task, taskTextEl);
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
        workspace: currentWorkspace,
        createdAt: new Date().toLocaleString()
    });

    saveTasks();
    renderTasks();
    taskInput.value = "";
});

taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        addBtn.click();
    } else if (e.key === "Escape") {
        taskInput.value = "";
    }
});


taskList.addEventListener("keydown", (e) => {
    const focusedLi = document.activeElement;
    if (!focusedLi || !focusedLi.classList.contains("task-item")) return;

    
    if (e.target.classList.contains("task-edit-input")) return;

    const taskId = focusedLi.dataset.id;
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextLi = focusedLi.nextElementSibling;
        if (nextLi) nextLi.focus();
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevLi = focusedLi.previousElementSibling;
        if (prevLi) prevLi.focus();
    } else if (e.key === "Delete") {
        e.preventDefault();
        tasks.splice(taskIndex, 1);
        saveTasks();
        renderTasks();
        
        // Focus next or previous task after deletion
        setTimeout(() => {
            const allItems = document.querySelectorAll(".task-item");
            if (allItems.length > 0) {
                const newFocusIndex = Math.min(taskIndex, allItems.length - 1);
                allItems[newFocusIndex].focus();
            }
        }, 0);
    } else if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
        
        setTimeout(() => {
            const newLi = document.querySelector(`.task-item[data-id="${taskId}"]`);
            if (newLi) newLi.focus();
        }, 0);
    } else if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        const taskTextEl = focusedLi.querySelector(".task-text");
        if (taskTextEl) {
            editTaskInline(tasks[taskIndex], taskTextEl);
        }
    }
});

function updateThemeIcon() {
    if (document.body.classList.contains("dark-mode")) {
        themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const currentTheme = document.body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("theme", currentTheme);
    updateThemeIcon();
});

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
}


saveWorkspaces(); 
updateThemeIcon();
renderWorkspaces();
renderTasks();
