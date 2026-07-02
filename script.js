
class Task {
    /**
     * Constructor to initialize a Task object
     * @param {Object} data - Task data (text, priority, workspace, etc.)
     */
    constructor(data) {
        // Properties
        this.id = data.id || Date.now().toString() + Math.random().toString(36).substring(2, 9);
        this.text = data.text;
        this.completed = data.completed || false;
        this.priority = data.priority || "Important";
        this.workspace = data.workspace || "Workspace";
        this.createdAt = data.createdAt || new Date().toLocaleString();
    }

    /**
     * Method: Toggles the completion status of the task
     */
    toggleCompletion() {
        this.completed = !this.completed;
    }

    /**
     * Method: Updates the text of the task
     * @param {string} newText - The new task description
     */
    updateText(newText) {
        if (newText.trim() !== "") {
            this.text = newText.trim();
        }
    }
}


class Workspace {
    /**
     * Constructor to initialize a Workspace object
     * @param {string} name - Name of the workspace
     */
    constructor(name) {
        // Properties
        this.name = name;
        this.tasks = []; // Store workspace tasks here
    }

    /**
     * Method: Adds a Task object to the workspace
     * @param {Task} task - The task object to add
     */
    addTask(task) {
        this.tasks.push(task);
    }

    /**
     * Method: Deletes a task by its ID
     * @param {string} taskId - The ID of the task to remove
     */
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
    }

    /**
     * Method: Renames the workspace and updates the workspace property of all its tasks
     * @param {string} newName - The new workspace name
     */
    rename(newName) {
        this.name = newName;
        // Update all tasks to reflect the new workspace name
        this.tasks.forEach(task => task.workspace = newName);
    }
}


class TodoApp {
    
    constructor() {
        
        this.workspaces = [];
        this.currentWorkspaceName = "Workspace";

        
        this.taskInput = document.getElementById("task-input");
        this.addBtn = document.getElementById("add-btn");
        this.taskList = document.getElementById("task-list");
        this.themeBtn = document.getElementById("theme-btn");
        this.prioritySelect = document.getElementById("priority-select");
        this.workspaceTabsContainer = document.getElementById("workspace-tabs-container");
        this.addWorkspaceBtn = document.getElementById("add-workspace-btn");

        
        this.loadData();
        this.handleEvents();
        
        
        this.updateThemeIcon();
        this.renderWorkspaces();
        this.renderTasks();
    }

    
    loadData() {
        const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const storedWorkspaces = JSON.parse(localStorage.getItem("workspaces")) || ["Workspace"];
        this.currentWorkspaceName = localStorage.getItem("currentWorkspace") || "Workspace";

        
        if (!storedWorkspaces.includes(this.currentWorkspaceName)) {
            this.currentWorkspaceName = "Workspace";
        }

        
        storedWorkspaces.forEach(wsName => {
            this.workspaces.push(new Workspace(wsName));
        });

        
        storedTasks.forEach(taskData => {
            const wsName = taskData.workspace || taskData.category || "Workspace";
            const actualWs = storedWorkspaces.includes(wsName) ? wsName : "Workspace";
            
            const task = new Task({
                ...taskData,
                workspace: actualWs
            });

            const workspaceObj = this.getWorkspaceByName(actualWs);
            if (workspaceObj) {
                workspaceObj.addTask(task);
            }
        });
    }

    
    saveData() {
        
        let allTasks = [];
        let workspaceNames = [];

        this.workspaces.forEach(ws => {
            workspaceNames.push(ws.name);
            allTasks = allTasks.concat(ws.tasks);
        });

        localStorage.setItem("tasks", JSON.stringify(allTasks));
        localStorage.setItem("workspaces", JSON.stringify(workspaceNames));
        localStorage.setItem("currentWorkspace", this.currentWorkspaceName);
    }

    
    getWorkspaceByName(name) {
        return this.workspaces.find(w => w.name === name);
    }

    
    getCurrentWorkspace() {
        return this.getWorkspaceByName(this.currentWorkspaceName);
    }

    
    renderWorkspaces() {
        this.workspaceTabsContainer.innerHTML = "";
        
        this.workspaces.forEach(ws => {
            const btn = document.createElement("button");
            btn.className = "tab-btn";
            if (ws.name === this.currentWorkspaceName) btn.classList.add("active");
            
            const nameSpan = document.createElement("span");
            nameSpan.className = "workspace-name";
            nameSpan.textContent = ws.name;
            btn.appendChild(nameSpan);
            
            
            if (ws.name !== "Workspace") {
                const deleteIcon = document.createElement("button");
                deleteIcon.className = "workspace-delete-btn";
                deleteIcon.innerHTML = '<i class="fa-solid fa-times"></i>';
                deleteIcon.title = "Delete Workspace";
                
                deleteIcon.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this.deleteWorkspace(ws.name);
                });
                
                btn.appendChild(deleteIcon);
                
                btn.addEventListener("dblclick", (e) => {
                    e.stopPropagation();
                    this.renameWorkspaceInline(ws.name, nameSpan, btn);
                });
                btn.title = "Double-click to rename";
            }
            
            btn.addEventListener("click", () => {
                this.currentWorkspaceName = ws.name;
                this.saveData();
                this.renderWorkspaces();
                this.renderTasks();
            });
            
            this.workspaceTabsContainer.appendChild(btn);
        });
    }

    
    renameWorkspaceInline(oldName, nameSpan, btn) {
        const input = document.createElement("input");
        input.type = "text";
        input.value = oldName;
        input.className = "workspace-edit-input";
        
        nameSpan.replaceWith(input);
        input.focus();
        
        
        btn.onclick = (e) => e.stopPropagation();

        const saveRename = () => {
            const newName = input.value.trim();
            if (newName === "" || newName === oldName) {
                this.renderWorkspaces();
                return;
            }
            if (this.getWorkspaceByName(newName)) {
                alert("A workspace with this name already exists!");
                this.renderWorkspaces();
                return;
            }
            
            const ws = this.getWorkspaceByName(oldName);
            if (ws) {
                ws.rename(newName);
                if (this.currentWorkspaceName === oldName) {
                    this.currentWorkspaceName = newName;
                }
                this.saveData();
                this.renderWorkspaces();
                this.renderTasks();
            }
        };

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") saveRename();
            else if (e.key === "Escape") this.renderWorkspaces();
        });
        
        input.addEventListener("blur", () => saveRename());
    }

    
    addWorkspace() {
        if (this.workspaceTabsContainer.querySelector(".workspace-edit-input")) return;

        const btn = document.createElement("button");
        btn.className = "tab-btn";
        
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "New Workspace";
        input.className = "workspace-edit-input";
        
        btn.appendChild(input);
        this.workspaceTabsContainer.appendChild(btn);
        
        input.focus();
        
        const saveNewWorkspace = () => {
            const wsName = input.value.trim();
            if (wsName === "") {
                this.renderWorkspaces();
                return;
            }
            if (this.getWorkspaceByName(wsName)) {
                alert("Workspace already exists!");
                this.renderWorkspaces();
                return;
            }
            
            
            const newWs = new Workspace(wsName);
            this.workspaces.push(newWs);
            this.currentWorkspaceName = wsName;
            
            this.saveData();
            this.renderWorkspaces();
            this.renderTasks();
        };

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") saveNewWorkspace();
            else if (e.key === "Escape") this.renderWorkspaces();
        });

        input.addEventListener("blur", () => {
            if (input.value.trim() !== "") saveNewWorkspace();
            else this.renderWorkspaces();
        });
    }

   
    deleteWorkspace(wsName) {
        if (wsName === "Workspace") return; // Safety check
        
        if (!confirm(`Are you sure you want to delete the "${wsName}" workspace?\nTasks will be moved to the default "Workspace".`)) {
            return;
        }
        
        const wsToDelete = this.getWorkspaceByName(wsName);
        const defaultWs = this.getWorkspaceByName("Workspace");
        
        if (wsToDelete && defaultWs) {
            
            wsToDelete.tasks.forEach(task => {
                task.workspace = "Workspace";
                defaultWs.addTask(task);
            });
            
            
            this.workspaces = this.workspaces.filter(ws => ws.name !== wsName);
            
            
            if (this.currentWorkspaceName === wsName) {
                this.currentWorkspaceName = "Workspace";
            }
            
            this.saveData();
            this.renderWorkspaces();
            this.renderTasks();
        }
    }

    
    renderTasks() {
        this.taskList.innerHTML = "";
        
        const currentWs = this.getCurrentWorkspace();
        if (!currentWs) return;

        
        let filteredTasks = [...currentWs.tasks];
        
        filteredTasks.sort((a, b) => {
            if (a.completed === b.completed) return 0;
            return a.completed ? 1 : -1; // Move completed to the bottom
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
                task.toggleCompletion();
                this.saveData();
                this.renderTasks();
            });

            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                currentWs.deleteTask(task.id);
                this.saveData();
                this.renderTasks();
            });

            li.addEventListener("dblclick", () => {
                this.editTaskInline(task, taskTextEl);
            });

            this.taskList.appendChild(li);
        });
    }

    
    editTaskInline(task, taskTextEl) {
        const input = document.createElement("input");
        input.type = "text";
        input.value = task.text;
        input.className = "task-edit-input";
        
        taskTextEl.replaceWith(input);
        input.focus();
        
        const saveTaskEdit = () => {
            task.updateText(input.value);
            this.saveData();
            this.renderTasks();
            
            
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
                this.renderTasks();
                setTimeout(() => {
                    const newLi = document.querySelector(`.task-item[data-id="${task.id}"]`);
                    if (newLi) newLi.focus();
                }, 0);
            }
        });
        
        input.addEventListener("blur", () => saveTaskEdit());
    }

    
    addNewTask() {
        const taskText = this.taskInput.value.trim();
        if (taskText === "") return;

        // Object Creation: Instantiate new Task
        const newTask = new Task({
            text: taskText,
            priority: this.prioritySelect.value,
            workspace: this.currentWorkspaceName
        });

        const currentWs = this.getCurrentWorkspace();
        if (currentWs) {
            currentWs.addTask(newTask);
            this.saveData();
            this.renderTasks();
            this.taskInput.value = "";
        }
    }

    
    handleEvents() {
        
        this.addBtn.addEventListener("click", () => this.addNewTask());

        
        this.addWorkspaceBtn.addEventListener("click", () => this.addWorkspace());

        
        this.taskInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.addNewTask();
            } else if (e.key === "Escape") {
                this.taskInput.value = "";
            }
        });

        // Theme Toggle Button
        this.themeBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            const currentTheme = document.body.classList.contains("dark-mode") ? "dark" : "light";
            localStorage.setItem("theme", currentTheme);
            this.updateThemeIcon();
        });

        // Task List Keyboard Navigation
        this.taskList.addEventListener("keydown", (e) => {
            const focusedLi = document.activeElement;
            if (!focusedLi || !focusedLi.classList.contains("task-item")) return;
            if (e.target.classList.contains("task-edit-input")) return; // Don't trigger when editing

            const taskId = focusedLi.dataset.id;
            const currentWs = this.getCurrentWorkspace();
            if (!currentWs) return;

            const task = currentWs.tasks.find(t => t.id === taskId);
            if (!task) return;

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
                
                // Track visual index for focus restoration
                const allVisualItems = Array.from(document.querySelectorAll(".task-item"));
                const visualIndex = allVisualItems.indexOf(focusedLi);
                
                currentWs.deleteTask(taskId);
                this.saveData();
                this.renderTasks();
                
                // Focus the item that moved into the deleted slot (or previous)
                setTimeout(() => {
                    const allItems = document.querySelectorAll(".task-item");
                    if (allItems.length > 0) {
                        const newFocusIndex = Math.min(visualIndex, allItems.length - 1);
                        if (allItems[newFocusIndex]) allItems[newFocusIndex].focus();
                    }
                }, 0);
            } else if (e.key === " " || e.key === "Spacebar") {
                e.preventDefault();
                task.toggleCompletion();
                this.saveData();
                this.renderTasks();
                
                setTimeout(() => {
                    const newLi = document.querySelector(`.task-item[data-id="${taskId}"]`);
                    if (newLi) newLi.focus();
                }, 0);
            } else if (e.key === "Enter" && e.ctrlKey) {
                e.preventDefault();
                const taskTextEl = focusedLi.querySelector(".task-text");
                if (taskTextEl) {
                    this.editTaskInline(task, taskTextEl);
                }
            }
        });
        
        
        if (localStorage.getItem("theme") === "dark") {
            document.body.classList.add("dark-mode");
        }
    }

    
    updateThemeIcon() {
        if (document.body.classList.contains("dark-mode")) {
            this.themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            this.themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    }
}


const app = new TodoApp();
