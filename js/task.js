

export default class Task {

    constructor(_id, title, priority) {
        this._id = _id;
        this.title = title;
        this.priority = priority;
    }

    drawTask(DOM, dragTask, deleteAppendAnim, onDeleteTask, dark, withAnimation = false) {

        let div = document.createElement("div");
        div.dataset.task_id = this._id;

        div.classList.add("item-task");
        div.draggable = true;
        div.addEventListener("dragstart", dragTask);


        if (withAnimation) {
            div.classList.add("new-task");
            div.addEventListener("transitionend", deleteAppendAnim)
        }

        let h3 = document.createElement("h3");
        h3.innerText = this.title;

        let i = document.createElement("i");
        i.addEventListener("click", onDeleteTask);
        i.classList.add("fa-solid");
        i.classList.add("fa-trash");

        if (DOM.id !== "arrDone") {
            let priorityProperties = priorities.find(priority => priority.name === this.priority);
            div.style.borderColor = priorityProperties.borderColor;
            div.style.color = priorityProperties.fontColor;
        } else {
            h3.style.textDecoration = "line-through"
        }

        if (dark) {
            let priorityProperties = priorities.find(priority => priority.name === this.priority);
            div.style.backgroundColor = priorityProperties.borderColor;
            div.style.color = "black";
            div.style.borderColor = "black"
            i.style.color = "black"
        }




        div.append(h3, i);
        DOM.appendChild(div)
    }
}