import { getBoard, postTask, patchTask } from "./api.js";
import { normalize, orderedColumns, tasksForColumn } from "./state.js";

let state = null;

function renderTask(task) {
  const el = document.createElement("div");
  el.className = "task";
  el.dataset.taskId = task.id;
  if (task._optimistic) el.classList.add("optimistic");
  el.textContent = task.title;
  if (!task._optimistic) {
    el.addEventListener("click", () => openEditPopup(task));
  }
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

async function editTaskOptimistic(id, fields) {
  const prev = { ...state.tasks[id] };
  Object.assign(state.tasks[id], fields);
  render();

  try {
    const updated = await patchTask(id, fields);
    state.tasks[id] = updated;
    render();
  } catch (err) {
    state.tasks[id] = prev;
    render();
    showError(err.message);
  }
}

function openEditPopup(task) {
  const existing = document.getElementById("edit-popup");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "edit-popup";
  overlay.className = "popup-overlay";

  const dialog = document.createElement("div");
  dialog.className = "popup-dialog";

  // Title
  const titleLabel = document.createElement("label");
  titleLabel.textContent = "Title";
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.value = task.title;

  // Priority
  const priorityLabel = document.createElement("label");
  priorityLabel.textContent = "Priority";
  const prioritySelect = document.createElement("select");
  for (const p of ["low", "medium", "high"]) {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    if (task.priority === p) opt.selected = true;
    prioritySelect.appendChild(opt);
  }

  // Category
  const categoryLabel = document.createElement("label");
  categoryLabel.textContent = "Category";
  const categorySelect = document.createElement("select");
  const noneOpt = document.createElement("option");
  noneOpt.value = "";
  noneOpt.textContent = "—";
  categorySelect.appendChild(noneOpt);
  for (const cat of Object.values(state.categories)) {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.name;
    if (task.categoryId === cat.id) opt.selected = true;
    categorySelect.appendChild(opt);
  }

  // Scope
  const scopeLabel = document.createElement("label");
  scopeLabel.textContent = "Scope";
  const scopeSelect = document.createElement("select");
  const scopeNone = document.createElement("option");
  scopeNone.value = "";
  scopeNone.textContent = "—";
  scopeSelect.appendChild(scopeNone);
  for (const s of ["day", "week", "month", "year"]) {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    if (task.scope === s) opt.selected = true;
    scopeSelect.appendChild(opt);
  }

  // Due date
  const dueDateLabel = document.createElement("label");
  dueDateLabel.textContent = "Due date";
  const dueDateInput = document.createElement("input");
  dueDateInput.type = "date";
  dueDateInput.value = task.dueDate || "";

  // Enforce scope+dueDate pairing
  function validatePair() {
    const hasScope = !!scopeSelect.value;
    const hasDue = !!dueDateInput.value;
    if (hasScope !== hasDue) {
      saveBtn.disabled = true;
    } else {
      saveBtn.disabled = false;
    }
  }
  scopeSelect.addEventListener("change", validatePair);
  dueDateInput.addEventListener("input", validatePair);

  // Buttons
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });

  saveBtn.addEventListener("click", () => {
    const fields = {};
    const newTitle = titleInput.value.trim();
    if (newTitle && newTitle !== task.title) fields.title = newTitle;
    if (prioritySelect.value !== task.priority) fields.priority = prioritySelect.value;
    const newCat = categorySelect.value || null;
    if (newCat !== task.categoryId) fields.categoryId = newCat;
    const newScope = scopeSelect.value || null;
    const newDue = dueDateInput.value || null;
    if (newScope !== task.scope) fields.scope = newScope;
    if (newDue !== task.dueDate) fields.dueDate = newDue;

    overlay.remove();
    if (Object.keys(fields).length > 0) {
      editTaskOptimistic(task.id, fields);
    }
  });

  dialog.appendChild(titleLabel);
  dialog.appendChild(titleInput);
  dialog.appendChild(priorityLabel);
  dialog.appendChild(prioritySelect);
  dialog.appendChild(categoryLabel);
  dialog.appendChild(categorySelect);
  dialog.appendChild(scopeLabel);
  dialog.appendChild(scopeSelect);
  dialog.appendChild(dueDateLabel);
  dialog.appendChild(dueDateInput);
  dialog.appendChild(saveBtn);
  dialog.appendChild(cancelBtn);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  titleInput.focus();
}

async function init() {
  state = normalize(await getBoard());
  render();
}

init();
