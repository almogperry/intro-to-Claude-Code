import { getBoard } from "./api.js";
import { normalize, orderedColumns } from "./state.js";

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
  el.appendChild(list);

  return el;
}

function render(state) {
  const board = document.getElementById("board");
  board.replaceChildren(...orderedColumns(state).map(renderColumn));
}

async function init() {
  const state = normalize(await getBoard());
  render(state);
}

init();
