// Добавить добавление даты создания и даты выполнения
(function () {

  let objOfTasks = JSON.parse(localStorage.getItem('taskList')) || {};
  console.log(Array.isArray(objOfTasks));

  // Elements UI
  const listContainer = document.querySelector(
    ".tasks-list-section .list-group"
  );
  const form = document.forms["addTask"];
  const inputTitle = form.elements["title"];
  const inputBody = form.elements["body"];
  const container = document.querySelector(".container");
  const showTasksGroup = document.querySelector(".btn-group");

  //Events
  renderAllTasks(objOfTasks);
  form.addEventListener("submit", onFormSubmitHandler);
  listContainer.addEventListener("click", onDeleteHandler);
  listContainer.addEventListener("click", onCompletedHandler);
  showTasksGroup.addEventListener("click", onBtnGroupHandler);

  function renderAllTasks(tasksList) {
    isEmptyCheck(tasksList);
    listContainer.innerHTML = "";
    const fragment = document.createDocumentFragment();
    Object.values(objOfTasks)
      .sort((a, b) => a.completed - b.completed)
      .forEach((task) => {
        let li = listItemTemplate(task);
        fragment.append(li);
      });
    listContainer.append(fragment);
  }

  function renderCompletedTasks(taskList) {
    isEmptyCheck(taskList);
    listContainer.innerHTML = "";
    const fragment = document.createDocumentFragment();
    Object.values(objOfTasks)
      .filter((task) => task.completed)
      .forEach((task) => {
        let li = listItemTemplate(task);
        fragment.append(li);
      });
    listContainer.append(fragment);
  }

  function renderUnfinishedTasks(taskList) {
    isEmptyCheck(taskList);
    listContainer.innerHTML = "";
    const fragment = document.createDocumentFragment();
    Object.values(objOfTasks)
      .filter((task) => !task.completed)
      .forEach((task) => {
        let li = listItemTemplate(task);
        fragment.append(li);
      });
    listContainer.append(fragment);
  }
  function listItemTemplate({ _id, title, body, completed } = {}) {
    // Деструктурирующее присваивание
    const li = document.createElement("li");
    li.classList.add(
      "list-group-item",
      "d-flex",
      "align-item-center",
      "flex-wrap",
      "mt-2"
    );
    if (completed) {
      li.classList.add("completed-task");
    }
    li.setAttribute("data-task-id", _id);

    const span = document.createElement("span");
    span.textContent = title;
    span.style.fontWeight = "bold";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Удалить задачу";
    deleteBtn.classList.add("btn", "btn-danger", "ml-auto", "delete-btn");

    const completeOrReturnBtn = createCompleteReturnBtn(completed);

    const article = document.createElement("p");
    article.textContent = body;
    article.classList.add("mt-2", "w-100");

    li.append(span);
    li.append(article);
    li.append(completeOrReturnBtn);
    li.append(deleteBtn);

    return li;
  }

  function onFormSubmitHandler(e) {
    e.preventDefault();
    const titleValue = inputTitle.value;
    const bodyValue = inputBody.value;
    console.log(titleValue, bodyValue);

    if (!titleValue || !bodyValue) {
      alert("Пожалуйста введите title и body");
      return;
    }

    const task = createNewTask(titleValue, bodyValue);
    const listItem = listItemTemplate(task); // listItemTemplate создает DOM элемент
    listContainer.prepend(listItem);
    const warning = document.querySelector(".alert-success");
    if (warning) {
      warning.remove();
    }
    showTasksGroup.hidden = false;
    form.reset();
    saveToLocalStorage(objOfTasks);
  }

  function onBtnGroupHandler({ target }) {
    let button = target.dataset.name;
    switch (button) {
      case "completedTasks":
        renderCompletedTasks(objOfTasks);
        break;
      case "allTasks":
        renderAllTasks(objOfTasks);
        break;
      case "unfinishedTasks":
        renderUnfinishedTasks(objOfTasks);
    }
  }
  function createNewTask(title, body) {
    const newTask = {
      title,
      body,
      completed: false,
      _id: `task-${Math.random()}`,
    };

    objOfTasks[newTask._id] = newTask; // Добавляем в массив тасков новый таск

    return { ...newTask }; // Возвращаем копию таска (поверхностное копирование)
  }

  function deleteTask(id) {
    const { title } = objOfTasks[id]; // Деструктурирующее присванивание
    const isConfirm = confirm(`Вы точно хотите удалить задачу: ${title}?`);
    if (!isConfirm) return isConfirm;
    delete objOfTasks[id];
    return isConfirm;
  }

  function createCompleteReturnBtn(completed) {
    const button = document.createElement('button');
    if (completed) {
      button.textContent = "Вернуть задачу";
      button.classList.add("btn", "btn-info");
    } else {
      button.textContent = "Выполнить задачу";
      button.classList.add("btn", "btn-success");
    }
    return button;
  }
  function isEmptyCheck(taskList) {
    if (Object.keys(taskList).length === 0) {
      listIsEmptyWarning();
      hideBtnGroup();
      return false;
    }
    return true;
  }
  function listIsEmptyWarning() {
    const paragraph = document.createElement("p");
    paragraph.textContent = "Ваш список задач пуст";
    paragraph.classList.add(
      "alert",
      "alert-success",
      "w-50",
      "mx-auto",
      "mt-5"
    );
    container.append(paragraph);
  }
  function completeTask(id, parent, button) {
    objOfTasks[id].completed = true;
    parent.classList.add('completed-task')
    listContainer.append(parent);
    button.replaceWith(createCompleteReturnBtn(objOfTasks[id].completed));
  }
  function hideBtnGroup() {
    showTasksGroup.hidden = true;
  }
  function deleteTaskFromHTML(confirmed, el) {
    if (!confirmed) return;
    el.remove();
  }

  function onDeleteHandler({ target }) {
    if (target.classList.contains("delete-btn")) {
      const parent = target.closest("[data-task-id]");
      const id = parent.dataset.taskId;
      const confirmed = deleteTask(id);
      deleteTaskFromHTML(confirmed, parent);
      isEmptyCheck(objOfTasks);
      saveToLocalStorage(objOfTasks);
    }
  }

  function onCompletedHandler({ target }) {
    if (target.classList.contains("btn-success")) {
      const parent = target.closest("[data-task-id]");
      const id = parent.dataset.taskId;
      completeTask(id, parent, target);
      target.remove();
      saveToLocalStorage(objOfTasks);
    }
  }

  function saveToLocalStorage(tasks) {
    localStorage.setItem('taskList', JSON.stringify(objOfTasks));
  }
})();
