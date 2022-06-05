import Controller from "./controller.js"

const CONTROLLER = new Controller();

let articleZones = document.querySelectorAll("#workflow-board article>div");
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

let changeThemeIcon = document.querySelector("header .theme-selector i");
changeThemeIcon.addEventListener("click", changeTheme);

let isFilterByName = false;
let isFilterByPrio = false;

let draggedTask;
let currentZone;

let dark = false;

const drawPriorities = (data, DOM) => {
    DOM.innerHTML = `<option value="">Choose Priority</option>`;
    console.log(data);
    data.forEach(priority => drawPriority(priority, DOM))

}

const drawPriority = (priority, DOM) => {
    let option = `<option value="${priority.name}">${priority.name.charAt(0).toUpperCase() + priority.name.slice(1)}</option>`
    DOM.innerHTML += option;
}

const addOnDropEvent = () => {

    for (const zone of articleZones) {
        zone.addEventListener("dragenter", toggleOnDragInZone)
        zone.addEventListener("dragleave", toggleOnDragInZone)
        zone.addEventListener("dragover", dragOverZone, false)
        zone.addEventListener("drop", dropTask)
    }

    deleteZone.addEventListener("dragover", dragOverZone, false)
    deleteZone.addEventListener("drop", dropTask)
    deleteZone.addEventListener("dragenter", toggleOnDragInZone)
    deleteZone.addEventListener("dragleave", toggleOnDragInZone)
};


const drawAllZones = (zones) => {
    if (!zones) {
        zones = {
            arrToDo: [],
            arrWIP: [],
            arrReview: [],
            arrDone: [],
        }
        CONTROLLER.saveLocalStorage("tasks", zones)
    }

    let counter = 0;
    for (const zone in zones) {
        drawTasksInZone(zones[zone], articleZones[counter]);
        counter++;
    }
}

const drawTasksInZone = (array, DOM) => {
    DOM.innerHTML = "";
    if (array.length !== 0)
        array.forEach(task => CONTROLLER.printNewTask(task._id, task.title, task.priority).drawTask(DOM, dragTask, deleteAppendAnim, onDeleteTask, dark));
}

function deleteAppendAnim(e) {
    e.target.classList.remove("new-task");
    e.target.removeEventListener("transitionend", deleteAppendAnim)
}

const drawEmptyTask = (DOM, message) => {

    let div = document.createElement("div");
    div.classList.add("empty-task");

    let h3 = document.createElement("h3");
    h3.innerText = message;

    div.append(h3);
    DOM.appendChild(div)
}

function createTask() {
    if (inputName.value === "" || inputPriority.value === "") {

        h4ErrorCreate.style.display = "block"
        return;
    }

    let newTask = CONTROLLER.setNewTaskAndSave(inputName.value, inputPriority.value)
    let emptyTask = document.querySelector("#arrToDo .empty-task")
    if (emptyTask) zoneToDo.removeChild(emptyTask)

    newTask.drawTask(zoneToDo, dragTask, deleteAppendAnim, onDeleteTask, dark, true);

    h4ErrorCreate.style.display = "none"
    inputName.value = "";
    inputPriority.value = inputPriority.children[0].value;


}

function onDeleteTask(e) {
    let updatedZone = CONTROLLER.deleteTask(e.target.parentNode.dataset.task_id)
    drawTasksInZone(updatedZone, e.target.parentNode.parentNode);
}


function dragTask(e) {

    draggedTask = e.target;
    currentZone = e.target.parentNode;
    changePointerEventStyle("none");
    e.target.addEventListener("dragend", onDragTaskEnd);
    toggleOnDrag(currentZone);
    articleZones.forEach(zone => {
        if (draggedTask.parentNode !== zone)
            drawEmptyTask(zone, "Drop your task here")
    })

}

function onDragTaskEnd(e) {
    toggleOnDrag(currentZone);
    changePointerEventStyle("all");
    e.target.addEventListener("dragend", onDragTaskEnd)

    articleZones.forEach(zone => {
        let emptyTask = document.querySelector(`#${zone.id} .empty-task`)
        if (emptyTask) {
            zone.removeChild(emptyTask)
        }
    })
}

function toggleOnDrag(currentZone) {
    articleZones.forEach(zone => {
        if (zone !== currentZone) zone.classList.toggle("dgd-zones")
    });

    deleteZone.classList.toggle("dgd-delete")
}

function toggleOnDragInZone(e) {

    e.target.classList.toggle("dgd-over")
}

const changePointerEventStyle = (value) => {
    articleZones.forEach(zone => {
        if (zone.length !== 0) {
            Array.from(zone.children).forEach(task => { if (draggedTask !== task) task.style.pointerEvents = value })
        }
    })
}

function dropTask(e) {

    e.preventDefault();
    toggleOnDragInZone(e);
    if (e.target.id !== "delete-board") {
        if (draggedTask !== e.target.parentNode && draggedTask !== e.target) {
            translateTask(draggedTask.dataset.task_id,
                draggedTask.parentNode.id,
                e.target.id,
                draggedTask.parentNode,
                e.target
            );
        }

    } else {
        let updatedZone = CONTROLLER.deleteTask(draggedTask.dataset.task_id, draggedTask.parentNode);
        drawTasksInZone(updatedZone, draggedTask.parentNode)

    }
    //changePointerEventStyle("all")
}

function translateTask(taskId, previousArray, nextArray, previousZone, nextZone) {
    if (previousZone === nextZone) {
        return;
    }

    let updatedZones = CONTROLLER.onTaskTranslated(taskId, previousArray, nextArray)

    drawTasksInZone(updatedZones[previousArray], previousZone);

    let emptyTask = document.querySelector(`#${nextArray} .empty-task`)
    if (emptyTask) nextZone.removeChild(emptyTask)

    drawTasksInZone(updatedZones[nextArray], nextZone)

    draggedTask.classList.add("new-task");
    draggedTask.addEventListener("transitionend", deleteAppendAnim)
}

function dragOverZone(e) {

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
    let storageData = CONTROLLER.getLocalStorage("tasks");
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
        drawAllZones(CONTROLLER.filterByName(e.target.value));
    } else if (e.target.type === "select-one") {
        drawAllZones(CONTROLLER.filterByPriority(e.target.value))
    }
}


function changeTheme(e) {
    let body = document.querySelector("body")
    console.log(articleZones);
    if (e.target.style.left === "0%") {
        dark = true;
        e.target.style.left = `calc(100% - ${e.target.offsetWidth}px)`
        e.target.classList.add("dark")
        e.target.classList.remove("light")

        articleZones.forEach(zone => zone.parentNode.classList.add("dark"));
        drawAllZones(CONTROLLER.getLocalStorage("tasks"));
        filterName.classList.add("dark")
        filterPrio.classList.add("dark")
        inputName.classList.add("dark")
        inputPriority.classList.add("dark")
        btnCreateTask.classList.add("dark")
        body.classList.add("dark")

    } else {
        dark = false;
        e.target.classList.remove("dark")
        e.target.classList.add("light")
        e.target.style.left = "0%"

        articleZones.forEach(zone => zone.parentNode.classList.remove("dark"));
        drawAllZones(CONTROLLER.getLocalStorage("tasks"));
        filterName.classList.remove("dark")
        filterPrio.classList.remove("dark")
        inputName.classList.remove("dark")
        inputPriority.classList.remove("dark")
        btnCreateTask.classList.remove("dark")
        body.classList.remove("dark")
    }

}


drawPriorities(priorities, inputPriority);
addOnDropEvent();
drawAllZones(CONTROLLER.getLocalStorage("tasks"));
