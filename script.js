document.getElementById('taskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const taskName = document.getElementById('taskName').value;
    addTask(taskName);
    document.getElementById('taskName').value = ''; // Limpa o campo de entrada
});

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || []; 
    tasks.forEach(task => addTaskToDOM(task));
    updateTotalTime(tasks); // Atualiza o tempo total ao carregar as tarefas 
}

function addTask(name) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const newTask = { id: Date.now(), name, timeSpent: 0 };
    
    if (activeTaskId) { // Se uma tarefa está ativa
        stopTimer(activeTaskId); // Para a tarefa ativa
    }
    
    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    addTaskToDOM(newTask);
    updateTotalTime(tasks); // Atualiza o tempo total ao adicionar uma nova tarefa
    
    // Inicia automaticamente a nova tarefa
    startTimer(newTask.id);
}

function addTaskToDOM(task) {
    const taskRow = document.createElement('tr');
    taskRow.setAttribute('id', task.id); // Adiciona um ID ao tr da tarefa
    taskRow.innerHTML = `
        <td>${task.name}</td>
        <td class="time">${formatTime(task.timeSpent)}</td> <!-- Adiciona a classe time -->
        <td class="actions"> <!-- Adiciona a classe actions -->
            <button class="start" data-task-id="${task.id}" onclick="startTimer(${task.id})">Iniciar</button>
            <button class="stop" onclick="stopTimer(${task.id})">Parar</button>
            <button class="delete" onclick="deleteTask(${task.id})">Excluir</button>
        </td>
    `;
    document.querySelector('#taskList tbody').appendChild(taskRow);
}

let timers = {};
let activeTaskId = null; 
let startTime = null; // Adicione esta variável

function startTimer(taskId) {
    if (activeTaskId) {
        stopTimer(activeTaskId); 
    }

    const tasks = JSON.parse(localStorage.getItem('tasks'));
    const task = tasks.find(t => t.id === taskId);

    // Armazena a hora de início
    startTime = Date.now();
    
    // Inicia o intervalo para atualização de tempo
    timers[taskId] = { seconds: task.timeSpent };
    activeTaskId = taskId; // Define a tarefa ativa
    
    timers[taskId].interval = setInterval(() => {
        const now = Date.now();
        const elapsedTime = Math.floor((now - startTime) / 1000); // Calcule o tempo decorrido em segundos
        task.timeSpent = timers[taskId].seconds + elapsedTime; // Atualiza o tempo na tarefa

        updateTaskDisplay(task); 
        updateLocalStorage(tasks); 
        updateTotalTime(tasks); 
    }, 1000);
    
    // Marca o botão como ativo
    const allStartButtons = document.querySelectorAll('button.start');
    allStartButtons.forEach(button => {
        button.classList.remove('active'); // Remove a classe ativa de todos os botões
    });
    document.querySelector(`button.start[data-task-id='${taskId}']`).classList.add('active'); // Marca o botão da tarefa ativa
}

function stopTimer(taskId) {
    clearInterval(timers[taskId]?.interval);
    delete timers[taskId]; // Remove o cronômetro específico da tarefa
    if (activeTaskId === taskId) {
        activeTaskId = null; // Reseta a tarefa ativa se ela for parada
    }

    startTime = null; // Limpa a hora de início

    // Remove a classe ativa do botão "Iniciar"
    const taskButton = document.querySelector(`button.start[data-task-id='${taskId}']`);
    if (taskButton) {
        taskButton.classList.remove('active');
    }
}


function updateTaskDisplay(task) {
    const taskRow = document.getElementById(task.id);
    if (taskRow) {
        taskRow.cells[1].textContent = formatTime(task.timeSpent); // Atualiza o tempo na segunda coluna
    }
}

function formatTime(seconds) { 
    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0'); 
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0'); 
    const secs = String(seconds % 60).padStart(2, '0'); 
    return `${hours}:${minutes}:${secs}`; 
}

function updateLocalStorage(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function deleteTask(taskId) {
    // Para a tarefa ativa se for a que está sendo excluída
    if (activeTaskId === taskId) {
        stopTimer(taskId); // Para o cronômetro da tarefa ativa
    }

    let tasks = JSON.parse(localStorage.getItem('tasks'));
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    // Remove a tarefa da DOM
    const taskRow = document.getElementById(taskId);
    if (taskRow) {
        taskRow.remove(); // Remove a linha da tarefa
    }

    updateTotalTime(tasks); // Atualiza o tempo total após a exclusão
}

function updateTotalTime(tasks) {
    const totalSeconds = tasks.reduce((acc, task) => acc + task.timeSpent, 0);
    const totalTimeElement = document.getElementById('totalTime');
    totalTimeElement.textContent = `Tempo Total: ${formatTime(totalSeconds)}`;
}

// Carrega as tarefas ao iniciar
loadTasks();
