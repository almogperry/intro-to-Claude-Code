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

        // Determine column based on drop Y coordinate
        const dropY = evt.pageY;
        let targetColId = null;
        let newPos = 0;

        for (const col of columns) {
          const rect = col.getBoundingClientRect();
          const colTop = rect.top + window.scrollY;
          const colBottom = rect.bottom + window.scrollY;

          if (dropY >= colTop && dropY <= colBottom) {
            targetColId = parseInt(col.dataset.colId);
            const cardsContainer = col.querySelector('.cards');
            const cardElsInCol = Array.from(cardsContainer.children);

            // Find position within column by comparing Y coordinates
            let insertPos = cardElsInCol.length;
            for (let i = 0; i < cardElsInCol.length; i++) {
              const cardRect = cardElsInCol[i].getBoundingClientRect();
              const cardMidY = cardRect.top + cardRect.height / 2 + window.scrollY;
              if (dropY < cardMidY) {
                insertPos = i;
                break;
              }
            }
            newPos = insertPos;
            break;
          }
        }

        if (targetColId === null) return;

        const state = getState();
        const oldTask = state.tasks.find(t => t.id === taskId);

        try {
          await updateTask(taskId, { column_id: targetColId, position: newPos });
          setState(s => {
            const tasks = s.tasks.map(t =>
              t.id === taskId ? { ...t, column_id: targetColId, position: newPos } : t
            );
            return { ...s, tasks };
          });
        } catch (e) {
          alert('Failed to move task: ' + e.message);
          location.reload();
        }
      }
    });
  });
}
