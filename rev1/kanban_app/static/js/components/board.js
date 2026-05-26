import { getState, subscribe } from '../store.js';
import { renderColumn } from './column.js';

export function renderBoard(parent) {
  parent.innerHTML = `
    <header>
      <h1>Kanban</h1>
      <button class="btn" id="addTaskBtn">+ New Task</button>
    </header>
    <div class="board" id="board"></div>
  `;

  function render() {
    const state = getState();
    const board = document.getElementById('board');
    board.innerHTML = '';
    state.columns.forEach(col => {
      const colEl = document.createElement('div');
      renderColumn(colEl, col, state.tasks, state.categories);
      board.appendChild(colEl);
    });
  }

  render();
  subscribe(render);
}
