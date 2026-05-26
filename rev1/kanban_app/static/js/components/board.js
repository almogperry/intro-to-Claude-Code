import { getState, subscribe, setState } from '../store.js';
import { renderColumn } from './column.js';
import { renderFilterBar } from './filter_bar.js';
import { showTaskForm } from './task_form.js';
import { initDnD } from '../dnd.js';
import { applyFilters, getDefaultFilterState } from '../filters.js';
import { getDueStatus } from '../due_window.js';

export function renderBoard(parent) {
  parent.innerHTML = `
    <header>
      <h1>Kanban</h1>
      <button class="btn" id="addTaskBtn">+ New Task</button>
    </header>
    <div id="filterBarContainer"></div>
    <div class="board" id="board"></div>
  `;

  const addBtn = document.getElementById('addTaskBtn');
  addBtn.addEventListener('click', () => {
    const state = getState();
    showTaskForm(document.body, state.columns, state.categories);
  });

  // Initialize filter state if not present
  const state = getState();
  if (!state.filterState) {
    setState(s => ({ ...s, filterState: getDefaultFilterState() }));
  }

  function render() {
    const state = getState();
    const filterState = state.filterState || getDefaultFilterState();

    // Render filter bar
    const filterBarContainer = document.getElementById('filterBarContainer');
    filterBarContainer.innerHTML = '';
    renderFilterBar(filterBarContainer, state.categories, state.columns, filterState, (newFilterState) => {
      setState(s => ({ ...s, filterState: newFilterState }));
    });

    // Apply filters
    const filteredTasks = applyFilters(state.tasks, filterState, state.columns, getDueStatus);

    // Render board with filtered tasks
    const board = document.getElementById('board');
    board.innerHTML = '';
    state.columns.forEach(col => {
      const colEl = document.createElement('div');
      renderColumn(colEl, col, filteredTasks, state.categories);
      board.appendChild(colEl);
    });
    initDnD(board);
  }

  render();
  subscribe(render);
}
