import { getBoard, postTask } from "./api.js";
import { normalize, orderedColumns, tasksForColumn } from "./state.js";

let state = null;

function renderTask(task) {
  const el = document.createElement("div");
  el.className = "task";
  el.dataset.taskId = task.id;
  if (task._optimistic) el.classList.add("optimistic");
  el.textContent = task.title;
  return el;
}

function renderAddForm(columnId) {
  const form = document.createElement("form");
  form.className = "add-task-form";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Task title…";
  input.required = true;

  const btn = document.createElement("button");
  btn.type = "submit";
  btn.textContent = "+ Add";

  form.appendChild(input);
  form.appendChild(btn);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = input.value.trim();
    if (!title) return;
    input.value = "";
    addTaskOptimistic(title, columnId);
  });

  return form;
}

function renderColumn(column) {
  const el = document.createElement("section");
  el.className = "column";
  el.dataset.columnId = column.id;
  if (column.isTerminal) el.classList.add("terminal");

  const title = document.createElement("h2");
  title.className = "column-title";
  title.textContent = column.name;
  el.appendChild(title);

  const list = document.createElement("div");
  list.className = "tasks";
  for (const task of tasksForColumn(state, column.id)) {
    list.appendChild(renderTask(task));
  }
  el.appendChild(list);
  el.appendChild(renderAddForm(column.id));

  return el;
}

function render() {
  const board = document.getElementById("board");
  board.replaceChildren(...orderedColumns(state).map(renderColumn));
}

function showError(msg) {
  let banner = document.getElementById("error-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "error-banner";
    banner.className = "error-banner";
    document.body.prepend(banner);
  }
  banner.textContent = msg;
  banner.hidden = false;
  setTimeout(() => { banner.hidden = true; }, 5000);
}

async function addTaskOptimistic(title, columnId) {
  const tempId = `tmp-${Date.now()}`;
  const optimistic = {
    id: tempId,
    title,
    columnId,
    priority: "medium",
    scope: null,
    dueDate: null,
    sortKey: 0,
    categoryId: null,
    _optimistic: true,
  };
  state.tasks[tempId] = optimistic;
  render();

  try {
    const created = await postTask(title, columnId);
    delete state.tasks[tempId];
    state.tasks[created.id] = created;
    render();
  } catch (err) {
    delete state.tasks[tempId];
    render();
    showError(err.message);
  }
}

async function init() {
  state = normalize(await getBoard());
  render();
}

init();
