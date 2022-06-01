let articleZones = document.querySelectorAll("section article>div");
let zoneToDo = document.querySelector("section .cToDo-parent>div");

let h4ErrorCreate = document.querySelector("header>h4");

let inputName = document.querySelector("header input");
let inputPriority = document.querySelector("header select");
let btnCreateTask = document.querySelector("header button");

btnCreateTask.addEventListener("click", createTask)

const drawAllZones = (zones) => {
    let counter = 0;
    for (const zone in zones) {
        drawTasksInZone(zones[zone], articleZones[counter]);
        counter++;
    }
}

const drawTasksInZone = (array, DOM) => {
    DOM.innerHTML = "";
    if (array.length !== 0)
        array.forEach(task => drawTask(task, DOM));
    else
        drawEmptyTask(DOM)
}

const drawTask = (task, DOM) => {
    /*     <div class="item-task high">
                <h3>Task 1</h3>
                <i class="fa-solid fa-trash"></i>
            </div> */

    let div = document.createElement("div");
    div.dataset.task_id = task._id;
    div.classList.add("item-task");
    div.classList.add(task.priority);

    let h3 = document.createElement("h3");
    h3.innerText = task.title;

    let i = document.createElement("i");
    i.addEventListener("click", deleteTask);
    i.classList.add("fa-solid");
    i.classList.add("fa-trash");

    div.append(h3, i);
    DOM.appendChild(div)
}


const drawEmptyTask = (DOM) => {

    let div = document.createElement("div");
    div.classList.add("empty-task");

    let h3 = document.createElement("h3");
    h3.innerText = "Drop your task here";

    div.append(h3);
    DOM.appendChild(div)
}

const getNextID = (tasks) => {

    let tasksIds = [];

    for (const zone in tasks) {
        tasks[zone].forEach(task => tasksIds.push(task._id));
    }

    tasksIds.sort((a, b) => a - b);

    let nextId = (tasksIds.length !== 0) ? tasksIds[tasksIds.length - 1] + 1 : 0;
    console.log(nextId);
    return nextId
}

function createTask() {
    if (inputName.value === "" || inputPriority.value === "all") {

        h4ErrorCreate.style.display = "block"
        return;
    }

    let newTask = {
        _id: getNextID(tasks),
        title: inputName.value,
        priority: inputPriority.value,
    }

    tasks.arrToDo.push(newTask);

    drawTasksInZone(tasks.arrToDo, zoneToDo);
    h4ErrorCreate.style.display = "none"
    inputName.value = "";
    inputPriority.value = inputPriority.children[0].value;
}

function deleteTask(e) {
    for (const zone in tasks) {
        tasks[zone].forEach((task, index) => {
            if (task._id === parseInt(e.target.parentNode.dataset.task_id)) {
                tasks[zone].splice(index, 1);
                drawAllZones(tasks);
                return;
            }
        });
    }
}

drawAllZones(tasks);
