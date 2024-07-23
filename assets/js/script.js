// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

const projectFormEl = $('#taskForm');
const projectNameInputEl = $('#taskTitle');
const projectTypeInputEl = $('#taskDescription');
const projectDateInputEl = $('#taskDueDate');

// Function to generate a unique task id
function generateTaskId() {
    return nextId++;
}

// Function to create a new task card
function createTaskCard(task) {
    const taskCard = $(`
        <div class="card mb-3" id="task-${task.id}" draggable="true">
            <div class="card-body">
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.description}</p>
                <p class="card-text"><small class="text-muted">Due: ${task.dueDate}</small></p>
                <button class="btn btn-danger btn-sm delete-task">Delete</button>
            </div>
        </div>
    `);

    taskCard.on('dragstart', handleDragStart);
    taskCard.on('dragend', handleDragEnd);
    taskCard.find('.delete-task').on('click', handleDeleteTask);

    return taskCard;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
    $('#todo-cards').empty();
    $('#in-progress-cards').empty();
    $('#done-cards').empty();

    taskList.forEach(task => {
        const taskCard = createTaskCard(task);
        $(`#${task.status}-cards`).append(taskCard);
    });

    // Make cards draggable
    $('.card').draggable({
        start: handleDragStart,
        stop: handleDragEnd
    });
}

// Function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();

    const taskTitle = projectNameInputEl.val();
    const taskDescription = projectTypeInputEl.val();
    const taskDueDate = projectDateInputEl.val();

    if (!taskTitle || !taskDescription || !taskDueDate) {
        return alert('Please fill out all fields');
    }

    const newTask = {
        id: generateTaskId(),
        title: taskTitle,
        description: taskDescription,
        dueDate: taskDueDate,
        status: 'todo'
    };

    taskList.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));

    renderTaskList();
    projectFormEl.trigger("reset");

    const modal = bootstrap.Modal.getInstance(document.getElementById('formModal'));
    modal.hide();
}

// Function to handle deleting a task
function handleDeleteTask(event) {
    const taskId = $(event.target).closest('.card').attr('id').split('-')[1];
    taskList = taskList.filter(task => task.id !== parseInt(taskId));
    localStorage.setItem("tasks", JSON.stringify(taskList));

    renderTaskList();
}

// Function to handle dropping a task into a new lane for an updated status
function handleDrop(event, ui) {
    const taskId = ui.helper.attr('id').split('-')[1];
    const newStatus = $(event.target).closest('.lane').attr('id').split('-')[0];

    const task = taskList.find(task => task.id === parseInt(taskId));
    if (task) {
        task.status = newStatus;
        localStorage.setItem("tasks", JSON.stringify(taskList));
        renderTaskList();
    }
}

// Function to handle drag start
function handleDragStart(event) {
    $(event.target).addClass('dragging');
}

// Function to handle drag end
function handleDragEnd(event) {
    $(event.target).removeClass('dragging');
}

$(document).ready(function () {
    renderTaskList();

    projectFormEl.on('submit', handleAddTask);

    $('.lane').droppable({
        accept: '.card',
        drop: handleDrop
    });

    projectDateInputEl.datepicker();  

    // Make sure draggable functionality is applied to cards
    $('.card').draggable({
        start: handleDragStart,
        stop: handleDragEnd
    });
});
