export default class Task {

    constructor(_id, title, priority) {
        this._id = _id;
        this.title = title;
        this.priority = priority;
    }

    drawTask(DOM, dragTask, deleteAppendAnim, onDeleteTask, withAnimation = false) {


        let div = document.createElement("div");
        div.dataset.task_id = this._id;
        div.classList.add("item-task");
        div.classList.add(this.priority);
        div.draggable = true;
        div.addEventListener("dragstart", dragTask)

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

        div.append(h3, i);
        DOM.appendChild(div)
    }
}