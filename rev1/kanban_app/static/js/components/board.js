import { getState, subscribe } from '../store.js';
import { renderColumn } from './column.js';
import { showTaskForm } from './task_form.js';
import { initDnD } from '../dnd.js';

export function renderBoard(parent) {
  parent.innerHTML = `
    <header>
      <h1>Kanban</h1>
      <button class="btn" id="addTaskBtn">+ New Task</button>
    </header>
    <div class="board" id="board"></div>
  `;

  const addBtn = document.getElementById('addTaskBtn');
  addBtn.addEventListener('click', () => {
    const state = getState();
    showTaskForm(document.body, state.columns, state.categories);
  });

  function render() {
    const state = getState();
    const board = document.getElementById('board');
    board.innerHTML = '';
    state.columns.forEach(col => {
      const colEl = document.createElement('div');
      renderColumn(colEl, col, state.tasks, state.categories);
      board.appendChild(colEl);
    });
    initDnD(board);
  }

  render();
  subscribe(render);
}
