let articleZones = document.querySelectorAll("section article>div");
let zoneToDo = document.querySelector("section .cToDo-parent>div");
let deleteZone = document.querySelector("main footer");

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

let draggedTask;
const addOnDropEvent = () => {
    for (const zone of articleZones) {
        zone.addEventListener("dragover", dragOverZone, false)
        zone.addEventListener("drop", dropTask)

    }

    deleteZone.addEventListener("dragover", dragOverZone, false)
    deleteZone.addEventListener("drop", dropTask)
};


const drawAllZones = (zones) => {
    if (!zones) {
        zones = {
            arrToDo: [],
            arrWIP: [],
            arrReview: [],
            arrDone: [],
        }
        localStorage.setItem('tasks', JSON.stringify(zones))
    }

    let counter = 0;
    for (const zone in zones) {
        drawTasksInZone(zones[zone], articleZones[counter]);
        counter++;
    }
}

const drawTasksInZone = (array, DOM) => {
    DOM.innerHTML = "";
    console.log(array);
    if (array.length !== 0)
        array.forEach(task => drawTask(task, DOM));
    else
        drawEmptyTask(DOM)
}

const drawTask = (task, DOM, withAnimation = false) => {
    /*     
        <div class="item-task high">
            <h3>Task 1</h3>
            <i class="fa-solid fa-trash"></i>
        </div> 
    */
    console.log(task);
    let div = document.createElement("div");
    div.dataset.task_id = task._id;
    div.classList.add("item-task");
    div.classList.add(task.priority);
    div.draggable = true;
    div.addEventListener("dragstart", dragTask)

    if (withAnimation) {
        div.classList.add("new-task");
        div.addEventListener("transitionend", deleteAppendAnim)
    }

    let h3 = document.createElement("h3");
    h3.innerText = task.title;

    let i = document.createElement("i");
    i.addEventListener("click", onDeleteTask);
    i.classList.add("fa-solid");
    i.classList.add("fa-trash");

    div.append(h3, i);
    DOM.appendChild(div)
}

function deleteAppendAnim(e) {
    e.target.classList.remove("new-task");
    e.target.removeEventListener("transitionend", deleteAppendAnim)
}



const drawEmptyTask = (DOM) => {

    let div = document.createElement("div");
    div.classList.add("empty-task");

    let h3 = document.createElement("h3");
    h3.innerText = "Drop your task here";

    div.append(h3);
    DOM.appendChild(div)
}

const getNextID = (arrTasks) => {

    let tasksIds = [];

    for (const zone in arrTasks) {
        arrTasks[zone].forEach(task => tasksIds.push(task._id));
    }

    tasksIds.sort((a, b) => a - b);

    let nextId = (tasksIds.length !== 0) ? tasksIds[tasksIds.length - 1] + 1 : 0;
    console.log(nextId);
    return nextId
}

function createTask() {
    let storageData = JSON.parse(localStorage.getItem('tasks'));

    if (inputName.value === "" || inputPriority.value === "") {

        h4ErrorCreate.style.display = "block"
        return;
    }

    let newTask = {
        _id: getNextID(storageData),
        title: inputName.value,
        priority: inputPriority.value,
    }

    storageData.arrToDo.push(newTask);

    drawTasksInZone(storageData.arrToDo, zoneToDo);
    h4ErrorCreate.style.display = "none"
    inputName.value = "";
    inputPriority.value = inputPriority.children[0].value;


    localStorage.setItem('tasks', JSON.stringify(storageData))
}

function onDeleteTask(e) {
    deleteTask(e.target.parentNode.dataset.task_id, e.target.parentNode.parentNode)
}


function deleteTask(taskId, zoneToDraw) {
    let storageData = JSON.parse(localStorage.getItem('tasks'));
    for (const zone in storageData) {
        storageData[zone].forEach((task, index) => {
            if (task._id === parseInt(taskId)) {
                storageData[zone].splice(index, 1);
                localStorage.setItem('tasks', JSON.stringify(storageData))
                drawTasksInZone(storageData[zone], zoneToDraw);
                return;
            }
        });
    }
}

function dragTask(e) {
    // reset the transparency
    draggedTask = e.target;
    changePointerEventStyle("none");

}

const changePointerEventStyle = (value) => {
    articleZones.forEach(zone => {
        if (zone.length !== 0) {
            console.log(zone.children);
            Array.from(zone.children).forEach(task => { if (draggedTask !== task) task.style.pointerEvents = value })
        }
    })
}

function dropTask(e) {
    // reset the transparency
    e.preventDefault();

    if (e.target.id !== "delete-board") {
        console.log(e.target);
        if (draggedTask !== e.target.parentNode && draggedTask !== e.target) {
            translateTask(draggedTask.dataset.task_id,
                draggedTask.parentNode.id,
                e.target.id,
                draggedTask.parentNode,
                e.target
            );
        }

    } else {
        deleteTask(draggedTask.dataset.task_id, draggedTask.parentNode);
    }
    changePointerEventStyle("all")
}

function translateTask(taskId, previousArray, nextArray, previousZone, nextZone) {
    if (previousZone === nextZone) {
        return;
    }
    console.log(nextArray);
    let storageData = JSON.parse(localStorage.getItem('tasks'));
    let index = storageData[previousArray].findIndex(task => task._id.toString() === taskId)
    storageData[nextArray].push(storageData[previousArray][index]);
    storageData[previousArray].splice(index, 1)
    localStorage.setItem('tasks', JSON.stringify(storageData))
    drawTasksInZone(storageData[previousArray], previousZone);
    drawTask(storageData[nextArray][storageData[nextArray].length - 1], nextZone, true);
}

function dragOverZone(e) {
    // reset the transparency
    e.preventDefault();
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
    let storageData = JSON.parse(localStorage.getItem('tasks'));
    drawAllZones(storageData)
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
    let storageData = JSON.parse(localStorage.getItem('tasks'));
    let auxData = {
        arrToDo: [],
        arrWIP: [],
        arrReview: [],
        arrDone: []
    };

    for (const zone in storageData) {
        storageData[zone].forEach(task => {
            if (task.title.toLowerCase().includes(name.toLowerCase())) {
                auxData[zone].push(task);
            }
        });
    }
    drawAllZones(auxData)
}

function filterByPriority(priorityValue) {
    let storageData = JSON.parse(localStorage.getItem('tasks'));
    let auxData = {
        arrToDo: [],
        arrWIP: [],
        arrReview: [],
        arrDone: []
    };

    if (priorityValue === "") {
        auxData = storageData
        drawAllZones(auxData)
        return;
    }

    for (const zone in storageData) {
        storageData[zone].forEach(task => {
            if (task.priority === priorityValue) {
                auxData[zone].push(task);
            }
        });
    }
    drawAllZones(auxData)
}

addOnDropEvent();
drawAllZones(JSON.parse(localStorage.getItem('tasks')));
