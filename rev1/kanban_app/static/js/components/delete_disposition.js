import { getState, setState } from '../store.js';

export function showDeleteDisposition(type, item, tasks) {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:70';

  const dialog = document.createElement('div');
  dialog.style.cssText = 'background:#fff;padding:24px;border-radius:8px;max-width:500px;box-shadow:0 8px 24px rgba(0,0,0,0.2)';

  const title = document.createElement('h3');
  title.style.cssText = 'margin:0 0 16px 0;font-size:16px';
  title.textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''} in "${item.name}"`;

  const taskList = document.createElement('div');
  taskList.style.cssText = 'background:#f4f5f7;border-radius:4px;padding:12px;margin-bottom:16px;max-height:200px;overflow-y:auto';

  const state = getState();
  tasks.slice(0, 5).forEach(task => {
    const taskEl = document.createElement('div');
    taskEl.style.cssText = 'padding:6px 0;font-size:12px;border-bottom:1px solid #dfe1e6';
    taskEl.textContent = `• ${task.title}`;
    taskList.appendChild(taskEl);
  });

  if (tasks.length > 5) {
    const more = document.createElement('div');
    more.style.cssText = 'padding:6px 0;font-size:12px;color:#5e6c84';
    more.textContent = `... and ${tasks.length - 5} more`;
    taskList.appendChild(more);
  }

  const options = document.createElement('div');
  options.style.cssText = 'margin-bottom:20px';

  if (type === 'column') {
    // For columns: show other columns as move-to options
    state.columns.filter(c => c.id !== item.id).forEach(col => {
      const label = document.createElement('label');
      label.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px;margin-bottom:8px;cursor:pointer;border-radius:4px;border:1px solid #dfe1e6';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'disposition';
      radio.value = `move:${col.id}`;
      radio.style.cssText = 'cursor:pointer';

      const text = document.createElement('span');
      text.style.cssText = 'font-size:12px';
      text.textContent = `Move all tasks to "${col.name}"`;

      label.appendChild(radio);
      label.appendChild(text);
      options.appendChild(label);
    });
  } else {
    // For categories: show other categories as move-to options
    state.categories.filter(c => c.id !== item.id).forEach(cat => {
      const label = document.createElement('label');
      label.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px;margin-bottom:8px;cursor:pointer;border-radius:4px;border:1px solid #dfe1e6';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'disposition';
      radio.value = `move:${cat.id}`;
      radio.style.cssText = 'cursor:pointer';

      const text = document.createElement('span');
      text.style.cssText = 'font-size:12px';
      text.textContent = `Move all tasks to "${cat.name}"`;

      label.appendChild(radio);
      label.appendChild(text);
      options.appendChild(label);
    });
  }

  // Delete option
  const deleteLabel = document.createElement('label');
  deleteLabel.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px;cursor:pointer;border-radius:4px;border:1px solid #dc3545;background:#fff5f5';

  const deleteRadio = document.createElement('input');
  deleteRadio.type = 'radio';
  deleteRadio.name = 'disposition';
  deleteRadio.value = 'delete';
  deleteRadio.style.cssText = 'cursor:pointer';

  const deleteText = document.createElement('span');
  deleteText.style.cssText = 'font-size:12px;color:#dc3545;font-weight:500';
  deleteText.textContent = 'Delete all tasks';

  deleteLabel.appendChild(deleteRadio);
  deleteLabel.appendChild(deleteText);
  options.appendChild(deleteLabel);

  // Buttons
  const btnGroup = document.createElement('div');
  btnGroup.style.cssText = 'display:flex;gap:8px;justify-content:flex-end';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = 'padding:8px 16px;border:1px solid #dfe1e6;border-radius:4px;cursor:pointer;background:#fff';
  cancelBtn.addEventListener('click', () => document.body.removeChild(modal));

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Confirm';
  confirmBtn.style.cssText = 'padding:8px 16px;background:#dc3545;color:#fff;border:0;border-radius:4px;cursor:pointer';
  confirmBtn.addEventListener('click', async () => {
    const selected = document.querySelector('input[name="disposition"]:checked');
    if (!selected) {
      alert('Please select an option');
      return;
    }

    const disposition = selected.value;
    document.body.removeChild(modal);

    if (type === 'column') {
      const resp = await fetch(`/api/columns/${item.id}?disposition=${disposition}`, { method: 'DELETE' });
      if (resp.ok) {
        const stateResp = await fetch('/api/state');
        const newState = await stateResp.json();
        setState(s => ({ ...s, columns: newState.columns, tasks: newState.tasks }));
      }
    } else {
      const resp = await fetch(`/api/categories/${item.id}?disposition=${disposition}`, { method: 'DELETE' });
      if (resp.ok) {
        const stateResp = await fetch('/api/state');
        const newState = await stateResp.json();
        setState(s => ({ ...s, categories: newState.categories, tasks: newState.tasks }));
      }
    }
  });

  btnGroup.appendChild(cancelBtn);
  btnGroup.appendChild(confirmBtn);

  dialog.appendChild(title);
  dialog.appendChild(taskList);
  dialog.appendChild(options);
  dialog.appendChild(btnGroup);

  modal.appendChild(dialog);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  });

  document.body.appendChild(modal);
}
