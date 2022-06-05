import Task from "./task.js";

export default class Controller {

    saveLocalStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value))
    }

    getLocalStorage(key) {
        return JSON.parse(localStorage.getItem(key));
    }

    setNewTaskAndSave(name, priority) {
        let storageData = this.getLocalStorage("tasks")
        let newTask = new Task(this.getNextID(storageData), name, priority)
        storageData.arrToDo.push(newTask);
        this.saveLocalStorage("tasks", storageData);

        return newTask;
    }

    printNewTask(id, name, priority) {
        let newTask = new Task(id, name, priority)
        return newTask;
    }

    getNextID(arrTasks) {

        let tasksIds = [];

        for (const zone in arrTasks) {
            arrTasks[zone].forEach(task => tasksIds.push(task._id));
        }

        tasksIds.sort((a, b) => a - b);

        let nextId = (tasksIds.length !== 0) ? tasksIds[tasksIds.length - 1] + 1 : 0;

        return nextId
    }



    filterByName(name) {
        let storageData = this.getLocalStorage('tasks');
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
        return auxData;
    }

    filterByPriority(priorityValue) {
        let storageData = this.getLocalStorage('tasks');

        if (priorityValue === "") {
            return storageData;
        }


        let auxData = {
            arrToDo: [],
            arrWIP: [],
            arrReview: [],
            arrDone: []
        };


        for (const zone in storageData) {
            storageData[zone].forEach(task => {
                if (task.priority === priorityValue) {
                    auxData[zone].push(task);
                }
            });
        }
        return auxData;
    }


    deleteTask(taskId) {
        let storageData = this.getLocalStorage("tasks");
        let finalZone;

        for (const zone in storageData) {

            storageData[zone].forEach((task, index) => {

                if (task._id === parseInt(taskId)) {
                    storageData[zone].splice(index, 1);
                    this.saveLocalStorage("tasks", storageData)
                    console.log(storageData[zone]);
                    finalZone = storageData[zone]
                }
            });
        }
        return (finalZone) ? finalZone : [];


    }

    onTaskTranslated(taskId, previousArray, nextArray) {
        let storageData = this.getLocalStorage("tasks");

        let index = storageData[previousArray].findIndex(task => task._id.toString() === taskId)

        storageData[nextArray].push(storageData[previousArray][index]);
        storageData[previousArray].splice(index, 1);
        this.saveLocalStorage("tasks", storageData);

        return storageData;
    }

}