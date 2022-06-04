let articleZones = document.querySelectorAll("section article>div");
let zoneToDo = document.querySelector("section .cToDo-parent>div");

let filterName = document.querySelector("header div #filter-name");
filterName.addEventListener("click", filterInput);

let filterPrio = document.querySelector("header div #filter-priority");
filterPrio.addEventListener("click", filterInput);

let h4ErrorCreate = document.querySelector("header>h4");

let inputName = document.querySelector("header input");
let inputPriority = document.querySelector("header select");

let btnCreateTask = document.querySelector("header button");
btnCreateTask.addEventListener("click", createTask);

let isFilterByName = false;
let isFilterByPrio = false;

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
    /*     
        <div class="item-task high">
            <h3>Task 1</h3>
            <i class="fa-solid fa-trash"></i>
        </div> 
    */

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
    if (inputName.value === "" || inputPriority.value === "") {

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


function filterInput(e) {
    if (e.target.id === "filter-name") {
        isFilterByPrio = changeFilterMode(true, inputPriority, filterPrio)
        isFilterByName = changeFilterMode(isFilterByName, inputName, filterName)
    } else if (e.target.id === "filter-priority") {
        isFilterByName = changeFilterMode(true, inputName, filterName)
        isFilterByPrio = changeFilterMode(isFilterByPrio, inputPriority, filterPrio)
    }

    if (isFilterByPrio || isFilterByName) {

        btnCreateTask.disabled = true;
        btnCreateTask.parentNode.classList.add("disabled");

    } else {

        btnCreateTask.disabled = false;
        btnCreateTask.parentNode.classList.remove("disabled");

    }

    drawAllZones(tasks)
}

const changeFilterMode = (filterType, filterInput, filterIcon) => {

    filterType = !filterType
    if (filterType) {
        filterIcon.classList.add("filtering");
        filterInput.classList.add("filtering");
        filterInput.value = "";
        filterInput.addEventListener("input", filterByInput)
    } else {
        filterIcon.classList.remove("filtering");
        filterInput.classList.remove("filtering");
        filterInput.value = "";
        filterInput.removeEventListener("input", filterByInput)
    }
    return filterType;
}


function filterByInput(e) {
    if (e.target.type === "text") {
        filterByName(e.target.value)
    } else if (e.target.type === "select-one") {
        filterByPriority(e.target.value)
    }
}


function filterByName(name) {
    let auxData = {
        arrToDo: [],
        arrWIP: [],
        arrReview: [],
        arrDone: []
    };

    for (const zone in tasks) {
        tasks[zone].forEach(task => {
            if (task.title.toLowerCase().includes(name.toLowerCase())) {
                auxData[zone].push(task);
            }
        });
    }
    drawAllZones(auxData)
}

function filterByPriority(priorityValue) {
    let auxData = {
        arrToDo: [],
        arrWIP: [],
        arrReview: [],
        arrDone: []
    };

    if (priorityValue === "") {
        auxData = tasks
        drawAllZones(auxData)
        return;
    }

    for (const zone in tasks) {
        tasks[zone].forEach(task => {
            if (task.priority === priorityValue) {
                auxData[zone].push(task);
            }
        });
    }
    drawAllZones(auxData)
}

drawAllZones(tasks);
