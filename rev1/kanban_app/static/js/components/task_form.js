import { createTask } from '../api.js';
import { setState } from '../store.js';

export function showTaskForm(parent, columns, categories) {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(9,30,66,.5);display:flex;align-items:center;justify-content:center;z-index:1000';

  modal.innerHTML = `
    <div style="background:#fff;border-radius:8px;padding:24px;width:400px;box-shadow:0 8px 32px rgba(0,0,0,.25)">
      <h2 style="margin:0 0 16px;font-size:18px">New Task</h2>
      <form id="taskForm" style="display:flex;flex-direction:column;gap:12px">
        <input type="text" id="title" placeholder="Task title" maxlength="200" required style="padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:14px">
        <textarea id="description" placeholder="Description (optional)" style="padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:14px;min-height:60px;resize:vertical"></textarea>
        <select id="category" required style="padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:14px">
          <option value="">Select category</option>
          ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
        </select>
        <select id="column" required style="padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:14px">
          <option value="">Select column</option>
          ${columns.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
        </select>
        <select id="priority" style="padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:14px">
          <option value="med" selected>Medium priority</option>
          <option value="high">High priority</option>
          <option value="low">Low priority</option>
        </select>
        <div style="display:flex;gap:8px">
          <button type="submit" style="flex:1;padding:8px;background:#0052cc;color:#fff;border:0;border-radius:4px;font-size:14px;cursor:pointer">Create</button>
          <button type="button" id="cancelBtn" style="flex:1;padding:8px;background:#dfe1e6;border:0;border-radius:4px;font-size:14px;cursor:pointer">Cancel</button>
        </div>
      </form>
    </div>
  `;

  parent.appendChild(modal);
  const form = document.getElementById('taskForm');
  const cancelBtn = document.getElementById('cancelBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      title: document.getElementById('title').value,
      description: document.getElementById('description').value || null,
      category_id: parseInt(document.getElementById('category').value),
      column_id: parseInt(document.getElementById('column').value),
      priority: document.getElementById('priority').value,
    };
    try {
      const newTask = await createTask(payload);
      setState(s => ({ ...s, tasks: [...s.tasks, newTask] }));
      modal.remove();
    } catch (err) {
      alert('Failed to create task: ' + err.message);
    }
  });

  cancelBtn.addEventListener('click', () => modal.remove());
}
