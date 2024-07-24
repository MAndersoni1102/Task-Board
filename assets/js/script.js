// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

const timeDisplayEl = $('#time-display');
const projectDisplayEl = $('#project-display');
const projectFormEl = $('#project-form');
const projectNameInputEl = $('#project-name-input');
const projectTypeInputEl = $('#project-type-input');
const projectDateInputEl = $('#taskDueDate');


    // Function that generates a unique task Id
    function generateTaskId() {
        return nextId++;
    }

    // This function creates a task card
    function createTaskCard(task) {
        let today = new Date();
        let dueDate = new Date(task.dueDate);
        let daysLeft = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
        let colorClass = "";
        if (daysLeft < 0) {
            colorClass = "pastDue";
        } else if (daysLeft < 5) {
            colorClass = "dueSoon";
        }

        let card = `
            <div class="card mb-3 ${colorClass} draggable" id="task-${task.id}" data-task-id="${task.id}">
                <div class="card-body">
                    <h5 class="card-title">${task.name}</h5>
                    <p class="card-text"><strong>Due Date:</strong> ${task.dueDate}</p>
                    <p class="card-text">${task.description}</p>
                    <button class="btn btn-danger btn-sm delete-task" data-task-id="${task.id}">Delete</button>
                </div>
            </div>
        `;
        return card;
    }

    // This function renders the task list and makes the cards draggable
    function renderTaskList() {
        $("#todo-cards, #in-progress-cards, #done-cards").empty();

        taskList.forEach(task => {
            let card = createTaskCard(task);
            let $card = $(card);
            $card.draggable({
                revert: "invalid",
                containment: ".container",
                helper: "clone",
                zIndex: 1000
            });
            if (task.status === "to-do") {
                $("#todo-cards").append($card);
            } else if (task.status === "in-progress") {
                $("#in-progress-cards").append($card);
            } else if (task.status === "done") {
                $("#done-cards").append($card);
            };
        });

        $(".delete-task").click(handleDeleteTask);
    }

    // Function to handle adding a new task
    function handleAddTask(event) {
        event.preventDefault();
        let taskName = $("#taskName").val();
        let taskDescription = $("#taskDescription").val();
        let taskDueDate = $("#dueDate").val();
        let formattedDate = dayjs(taskDueDate).format('MM/DD/YY');
        console.log("Formatted Date: ", formattedDate);

        if (taskName.trim() !== "") {
            let newTask = {
                id: generateTaskId(),
                name: taskName,
                description: taskDescription,
                status: "to-do",
                dueDate: formattedDate
            };
            taskList.push(newTask);
            localStorage.setItem("tasks", JSON.stringify(taskList));
            localStorage.setItem("nextId", nextId);

            $("#formModal").modal("hide");
            renderTaskList();
            $("#taskForm")[0].reset();
        }
    }

    // Function to handle deleting a task
    function handleDeleteTask(event) {
        let taskId = $(this).data("task-id");
        taskList = taskList.filter(task => task.id !== taskId);
        localStorage.setItem("tasks", JSON.stringify(taskList));
        renderTaskList();
    }

    // Function to handle dropping a task into a new status lane
    function handleDrop(event, ui) {
        let taskId = ui.draggable.data("task-id");
        let status = $(this).attr("id");
        let taskIndex = taskList.findIndex(task => task.id === taskId);
        taskList[taskIndex].status = status;
        localStorage.setItem("tasks", JSON.stringify(taskList));
        renderTaskList();
    }

    // When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
    $(document).ready(function () {
        renderTaskList();

        $(".lane").droppable({
            accept: ".draggable",
            drop: handleDrop
        });

        $("#taskForm").submit(handleAddTask);
        $("#dueDate").datepicker();
    });
