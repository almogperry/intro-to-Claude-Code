import { updateTask } from './api.js';
import { setState, getState } from './store.js';

export function initDnD(boardEl) {
  const columns = boardEl.querySelectorAll('.column');

  columns.forEach(colEl => {
    const cardsEl = colEl.querySelector('.cards');
    new Sortable(cardsEl, {
      group: 'tasks',
      animation: 150,
      ghostClass: 'ghost',
      delay: 200,
      delayOnTouchOnly: true,
      onEnd: async (evt) => {
        const cardEl = evt.item;
        const taskId = parseInt(cardEl.dataset.taskId);
        const newColId = parseInt(evt.to.closest('.column').dataset.colId);
        const newPos = Array.from(evt.to.children).indexOf(cardEl);

        const state = getState();
        const oldTask = state.tasks.find(t => t.id === taskId);

        // If cross-column, auto-sort in destination
        if (oldTask.column_id !== newColId) {
          try {
            // Update task column
            await updateTask(taskId, { column_id: newColId, position: newPos });
            setState(s => {
              const tasks = s.tasks.map(t =>
                t.id === taskId ? { ...t, column_id: newColId, position: newPos } : t
              );
              return { ...s, tasks };
            });
          } catch (e) {
            alert('Failed to move task: ' + e.message);
            location.reload();
          }
        } else {
          // Within column, keep dropped position
          try {
            await updateTask(taskId, { position: newPos });
            setState(s => {
              const tasks = s.tasks.map(t =>
                t.id === taskId ? { ...t, position: newPos } : t
              );
              return { ...s, tasks };
            });
          } catch (e) {
            alert('Failed to reorder task: ' + e.message);
            location.reload();
          }
        }
      }
    });
  });
}
