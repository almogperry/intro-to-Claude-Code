import { renderCard } from './card.js';

export function renderColumn(parent, col, allTasks, categories) {
  const tasks = allTasks.filter(t => t.column_id === col.id);
  parent.className = 'column';
  parent.innerHTML = `
    <div class="column-header">
      <span>${col.name}</span>
      <span class="count">${tasks.length}</span>
    </div>
    <div class="cards"></div>
  `;

  const cardsEl = parent.querySelector('.cards');
  tasks.forEach(t => {
    const cardEl = document.createElement('div');
    renderCard(cardEl, t, categories);
    cardsEl.appendChild(cardEl);
  });
}
