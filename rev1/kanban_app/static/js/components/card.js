import { showCardExpanded } from './card_expanded.js';

export function renderCard(parent, task, categories) {
  const cat = categories.find(c => c.id === task.category_id);
  parent.className = `card prio-${task.priority}`;
  parent.dataset.taskId = task.id;
  parent.innerHTML = `
    <div class="title">${task.title}</div>
    <div class="meta">
      <span class="cat">${cat ? cat.name : ''}</span>
      ${task.due_date ? `<span class="due">${task.due_date}</span>` : ''}
      ${task.subtasks.length ? `<span>${task.subtasks.filter(s => s.checked).length}/${task.subtasks.length}</span>` : ''}
    </div>
  `;
  parent.addEventListener('click', (e) => {
    if (e.target.closest('.cards')) return; // ignore card container clicks
    showCardExpanded(document.body, task.id, parent);
  });
}
