import { updateTask } from './api.js';
import { setState, getState } from './store.js';

export function initDnD(boardEl) {
  const columns = boardEl.querySelectorAll('.column');
  let draggedCard = null;

  // Track dragged card
  document.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('card')) {
      draggedCard = e.target;
      e.target.style.opacity = '0.5';
    }
  });

  document.addEventListener('dragend', (e) => {
    if (draggedCard) {
      draggedCard.style.opacity = '1';
    }
  });

  // Allow drops anywhere
  document.addEventListener('dragover', (e) => {
    if (draggedCard) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  });

  document.addEventListener('dragenter', (e) => {
    if (draggedCard) {
      e.preventDefault();
    }
  });

  // Handle drop
  document.addEventListener('drop', async (e) => {
    if (!draggedCard) return;
    e.preventDefault();

    const taskId = parseInt(draggedCard.dataset.taskId);
    const dropX = e.pageX;
    let targetColId = null;
    let newPos = 0;

    // Find column by horizontal position
    for (const col of columns) {
      const rect = col.getBoundingClientRect();
      const colLeft = rect.left + window.scrollX;
      const colRight = rect.right + window.scrollX;

      if (dropX >= colLeft && dropX <= colRight) {
        targetColId = parseInt(col.dataset.colId);
        const cardsContainer = col.querySelector('.cards');
        const cardEls = Array.from(cardsContainer.children).filter(el => el !== draggedCard);

        // Calculate position by Y coordinate within the column
        const dropY = e.pageY;
        let insertPos = cardEls.length;
        for (let i = 0; i < cardEls.length; i++) {
          const cardRect = cardEls[i].getBoundingClientRect();
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

    if (targetColId === null) {
      draggedCard = null;
      return;
    }

    const state = getState();
    const oldTask = state.tasks.find(t => t.id === taskId);

    if (oldTask.column_id === targetColId && oldTask.position === newPos) {
      draggedCard = null;
      return;
    }

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

    draggedCard = null;
  });
}
