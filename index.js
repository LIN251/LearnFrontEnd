const API = (function () {
  const API_URL = "http://localhost:3000/todos";

  const getTodos = async () => {
    const res = await fetch(`${API_URL}`);
    return await res.json();
  };

  const postTodo = async (newTodo) => {
    const res = await fetch(`${API_URL}`, {
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(newTodo),
    });
    return await res.json();
  };

  const deleteTodo = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    return await res.json();
  };

  const putTodo = async (id, todo) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(todo),
    });
    return await res.json();
  };

  return {
    putTodo,
    getTodos,
    postTodo,
    deleteTodo,
  };
})();

// put：  fully update
// patch： partially update
// post： create
// delete： delete








class TodoModel {
  #todos = [];
  constructor() {}
  getTodos() {
    return this.#todos;
  }
  async fetchTodos() {
    this.#todos = await API.getTodos();
  }

  async addTodo(newTodo) {
    const todo = await API.postTodo(newTodo);
    this.#todos.push(todo);
    return todo;
  }

  async removeTodo(id) {
    const removedId = await API.deleteTodo(id);
    this.#todos = this.#todos.filter((todo) => todo.id !== id);
    return removedId;
  }

  async updateTitle(id, updateTodo) {
    const todo = this.#todos.find((todo) => todo.id === Number(id));
    todo.title = updateTodo;
    const updatedTodo = await API.putTodo(id, todo);
  }
}












class TodoView {
  constructor() {
    this.form = document.querySelector(".todo-app__form");
    // this.addBtn = document.querySelector(".todo-app__add-btn");
    this.input = document.getElementById("todo-app__input");
    this.todolist = document.querySelector(".todolist");
  }

  initRenderTodos(todos) {
    this.todolist.innerHTML = "";
    todos.forEach((todo) => {
      this.appendTodo(todo);
    });
  }

  removeTodo(id) {
    const element = document.getElementById(`todo-${id}`);
    element.remove();
  }

  appendTodo(todo) {
    const todoElem = this.createTodoElem(todo);
    this.todolist.append(todoElem);
  }

  createTodoElem(todo) {
    const todoElem = document.createElement("div");
    todoElem.classList.add("todo");
    todoElem.setAttribute("id", `todo-${todo.id}`);

    const title = document.createElement("div");
    title.classList.add("title");
    title.textContent = todo.title;
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("todo__delete-btn");
    deleteBtn.setAttribute("remove-id", todo.id);
    deleteBtn.textContent = "Delete";

    const editBtn = document.createElement("button");
    editBtn.classList.add("todo__edit-btn");
    editBtn.setAttribute("editBtn-id", todo.id);
    editBtn.textContent = "Edit";

    const saveBtn = document.createElement("button");
    saveBtn.classList.add("todo__save-btn");
    saveBtn.style.display = "none";
    saveBtn.setAttribute("saveBtn-id", todo.id);
    saveBtn.textContent = "Save";

    todoElem.append(title, editBtn, saveBtn, deleteBtn);
    return todoElem;
  }

  createEditInput(todoID) {
    const editDiv = document.getElementById(todoID); // todo div

    const titleElement = editDiv.querySelector(".title"); // text

    const editInput = document.createElement("input"); // input box
    editInput.setAttribute("type", "text");
    editInput.setAttribute("value", titleElement.textContent);
    editInput.setAttribute("input-id", todoID);

    titleElement.textContent = ""; // remove old text

    editDiv.insertBefore(editInput, editDiv.firstChild);
  }

  hideEditShowSave(id) {
    const editBtn = document.querySelector(`[editBtn-id="${id}"]`);
    const saveBtn = document.querySelector(`[saveBtn-id="${id}"]`);

    if (editBtn) {
      editBtn.style.display = "none";
    }

    if (saveBtn) {
      saveBtn.style.display = "inline-block";
    }
  }

  hideSaveShowEdit(id) {
    const editBtn = document.querySelector(`[editBtn-id="${id}"]`);
    const saveBtn = document.querySelector(`[saveBtn-id="${id}"]`);

    if (editBtn) {
      editBtn.style.display = "inline-block";
    }

    if (saveBtn) {
      saveBtn.style.display = "none";
    }
  }

  updateTitleRemoveInput(titleElement, newVal, editInput) {
    titleElement.textContent = newVal;
    editInput.remove();
  }
}





class TodoController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.init();
  }

  async init() {
    this.setUpEvents();
    await this.model.fetchTodos();
    this.view.initRenderTodos(this.model.getTodos());
  }

  setUpEvents() {
    this.setUpAddEvent();
    this.setUpDeleteEvent();
    this.setUpEditEvent();
    this.setUpSaveEvent();
  }

  setUpAddEvent() {
    this.view.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = this.view.input.value;
      this.model
        .addTodo({
          title,
          completed: false,
        })
        .then((todo) => {
          this.view.appendTodo(todo);
        });
    });
  }

  setUpDeleteEvent() {
    this.view.todolist.addEventListener("click", (e) => {
      const isDeleteBtn = e.target.classList.contains("todo__delete-btn");
      if (isDeleteBtn) {
        const removeId = e.target.getAttribute("remove-id");
        this.model.removeTodo(removeId).then(() => {
          this.view.removeTodo(removeId);
        });
      }
    });
  }

  setUpEditEvent() {
    this.view.todolist.addEventListener("click", (e) => {
      const isEditBtn = e.target.classList.contains("todo__edit-btn");

      if (isEditBtn) {
        const editId = e.target.getAttribute("editBtn-id");
        this.view.createEditInput(`todo-${editId}`, editId); // create input
        this.view.hideEditShowSave(editId); // change edit to save
        // const editDiv = this.view.getElementById(`todo-${editId}`);
        // const titleElement = editDiv.querySelector(".title");
        // console.log(titleElement)
        // titleElement.textContent = "";
        // this.view.createEditInput(editId)
      }
    });
  }

  setUpSaveEvent() {
    this.view.todolist.addEventListener("click", (e) => {
      const isSaveBtn = e.target.classList.contains("todo__save-btn");
      if (isSaveBtn) {
        const saveId = e.target.getAttribute("saveBtn-id"); // id

        const editInput = document.querySelector(`[input-id="todo-${saveId}"]`); // input box
        const editDiv = document.querySelector(`#todo-${saveId}`); // todo div
        const titleElement = editDiv.querySelector(".title"); // title div

        this.view.updateTitleRemoveInput(
          titleElement,
          editInput.value,
          editInput
        );
        this.view.hideSaveShowEdit(saveId);
        this.model.updateTitle(saveId, editInput.value);
      }
    });
  }
}

const model = new TodoModel();
const view = new TodoView();
const controller = new TodoController(model, view);
