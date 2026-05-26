export function renderCard(parent, task) {
  parent.className = `card prio-${task.priority}`;
  parent.innerHTML = `
    <div class="title">${task.title}</div>
    <div class="meta">
      <span class="cat">${task.category_id}</span>
      ${task.due_date ? `<span class="due">${task.due_date}</span>` : ''}
    </div>
  `;
}
