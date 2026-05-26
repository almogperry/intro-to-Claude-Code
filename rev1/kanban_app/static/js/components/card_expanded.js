import { updateTask, deleteTask, createSubtask, updateSubtask, deleteSubtask } from '../api.js';
import { setState, getState } from '../store.js';
import { animateCardExpand, animateCardCollapse } from '../modal_anim.js';

export function showCardExpanded(parent, taskId, sourceEl) {
  const state = getState();
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  const cats = state.categories;
  const cols = state.columns;

  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;z-index:1000;pointer-events:auto';
  modal.innerHTML = `
    <div style="position:absolute;inset:0;background:rgba(9,30,66,.4);backdrop-filter:blur(6px)" id="backdrop"></div>
    <div style="position:fixed;background:#fff;border-radius:8px;padding:24px;box-shadow:0 8px 32px rgba(0,0,0,.25);overflow-y:auto;z-index:1001;max-height:80vh" id="card">
      <button style="position:absolute;top:12px;right:12px;background:0;border:0;font-size:20px;cursor:pointer;color:#5e6c84" id="closeBtn">×</button>
      <input type="text" id="title" value="${task.title}" maxlength="200" style="width:100%;padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:16px;font-weight:600;margin-bottom:12px">
      <textarea id="desc" placeholder="Add description..." style="width:100%;padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:13px;min-height:60px;margin-bottom:12px;resize:vertical">${task.description || ''}</textarea>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <select id="cat" style="padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:13px">
          ${cats.map(c => `<option value="${c.id}" ${c.id === task.category_id ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
        <select id="col" style="padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:13px">
          ${cols.map(c => `<option value="${c.id}" ${c.id === task.column_id ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
        <select id="prio" style="padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:13px">
          <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High priority</option>
          <option value="med" ${task.priority === 'med' ? 'selected' : ''}>Medium priority</option>
          <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low priority</option>
        </select>
        <select id="scope" style="padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:13px">
          <option value="">No deadline</option>
          <option value="day" ${task.scope === 'day' ? 'selected' : ''}>Day</option>
          <option value="week" ${task.scope === 'week' ? 'selected' : ''}>Week</option>
          <option value="month" ${task.scope === 'month' ? 'selected' : ''}>Month</option>
          <option value="year" ${task.scope === 'year' ? 'selected' : ''}>Year</option>
        </select>
        <input type="date" id="due" value="${task.due_date || ''}" style="padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:13px">
        <input type="time" id="time" value="${task.due_time || ''}" style="padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:13px">
      </div>

      <div style="border-top:1px solid #dfe1e6;padding-top:12px;margin-bottom:12px">
        <strong style="font-size:12px;color:#5e6c84">SUBTASKS</strong>
        <div id="subs" style="margin-top:8px;display:flex;flex-direction:column;gap:6px">
          ${task.subtasks.map(s => `
            <div style="display:flex;gap:8px;align-items:center">
              <input type="checkbox" data-sub-id="${s.id}" ${s.checked ? 'checked' : ''} style="cursor:pointer">
              <span>${s.body}</span>
              <button data-del-sub="${s.id}" style="margin-left:auto;background:0;border:0;color:#dc3545;cursor:pointer;font-size:12px">del</button>
            </div>
          `).join('')}
        </div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <input type="text" id="newSubBody" placeholder="Add subtask..." style="flex:1;padding:6px;border:1px solid #dfe1e6;border-radius:4px;font-size:12px">
          <button id="addSubBtn" style="padding:6px 12px;background:#0052cc;color:#fff;border:0;border-radius:4px;cursor:pointer;font-size:12px">+</button>
        </div>
      </div>

      <div style="display:flex;gap:8px">
        <button id="delBtn" style="flex:1;padding:8px;background:#dc3545;color:#fff;border:0;border-radius:4px;cursor:pointer">Delete task</button>
        <button id="saveBtn" style="flex:1;padding:8px;background:#0052cc;color:#fff;border:0;border-radius:4px;cursor:pointer">Save</button>
      </div>
    </div>
    <style>
      @keyframes blurIn { from { backdrop-filter: blur(0px); } to { backdrop-filter: blur(6px); } }
    </style>
  `;

  parent.appendChild(modal);
  animateCardExpand(sourceEl, modal);

  const closeBtn = document.getElementById('closeBtn');
  const backdrop = document.getElementById('backdrop');
  const delBtn = document.getElementById('delBtn');
  const saveBtn = document.getElementById('saveBtn');
  const addSubBtn = document.getElementById('addSubBtn');
  const subsContainer = document.getElementById('subs');

  const attachSubListeners = (checkbox, deleteBtn) => {
    checkbox.addEventListener('change', async (e) => {
      const subId = parseInt(e.target.dataset.subId);
      try {
        await updateSubtask(subId, { checked: e.target.checked ? 1 : 0 });
        setState(s => ({
          ...s,
          tasks: s.tasks.map(t =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.map(sb => sb.id === subId ? { ...sb, checked: e.target.checked ? 1 : 0 } : sb) }
              : t
          )
        }));
      } catch (e) {
        console.error('subtask toggle failed:', e);
        e.target.checked = !e.target.checked;
      }
    });

    deleteBtn.addEventListener('click', async (e) => {
      const subId = parseInt(e.target.dataset.delSub);
      try {
        await deleteSubtask(subId);
        setState(s => ({
          ...s,
          tasks: s.tasks.map(t =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.filter(sb => sb.id !== subId) }
              : t
          )
        }));
        e.target.closest('div').remove();
      } catch (e) {
        alert('Delete subtask failed: ' + e.message);
      }
    });
  };

  // Attach listeners to initial subtasks
  modal.querySelectorAll('input[data-sub-id]').forEach(cb => {
    const btn = cb.parentElement.querySelector('button[data-del-sub]');
    attachSubListeners(cb, btn);
  });

  const close = async () => {
    const card = modal.querySelector('#card');
    await animateCardCollapse(card);
    modal.remove();
  };

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);

  saveBtn.addEventListener('click', async () => {
    const updates = {
      title: document.getElementById('title').value,
      description: document.getElementById('desc').value || null,
      category_id: parseInt(document.getElementById('cat').value),
      column_id: parseInt(document.getElementById('col').value),
      priority: document.getElementById('prio').value,
      scope: document.getElementById('scope').value || null,
      due_date: document.getElementById('due').value || null,
      due_time: document.getElementById('time').value || null,
    };
    try {
      await updateTask(taskId, updates);
      setState(s => ({
        ...s,
        tasks: s.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
      }));
      await close();
    } catch (e) {
      alert('Save failed: ' + e.message);
    }
  });

  delBtn.addEventListener('click', async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== taskId) }));
      await close();
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  });

  addSubBtn.addEventListener('click', async () => {
    const bodyInput = document.getElementById('newSubBody');
    const body = bodyInput.value.trim();
    if (!body) return;

    const tempId = Math.random();
    const subEl = document.createElement('div');
    subEl.style.cssText = 'display:flex;gap:8px;align-items:center';
    subEl.innerHTML = `
      <input type="checkbox" data-sub-id="${tempId}" style="cursor:pointer">
      <span>${body}</span>
      <button data-del-sub="${tempId}" style="margin-left:auto;background:0;border:0;color:#dc3545;cursor:pointer;font-size:12px">del</button>
    `;
    subsContainer.appendChild(subEl);
    bodyInput.value = '';

    const checkbox = subEl.querySelector(`[data-sub-id="${tempId}"]`);
    const delBtn = subEl.querySelector(`[data-del-sub="${tempId}"]`);
    attachSubListeners(checkbox, delBtn);

    try {
      const sub = await createSubtask(taskId, body);
      setState(s => ({
        ...s,
        tasks: s.tasks.map(t =>
          t.id === taskId
            ? { ...t, subtasks: [...t.subtasks, sub] }
            : t
        )
      }));
      checkbox.dataset.subId = sub.id;
      delBtn.dataset.delSub = sub.id;
    } catch (e) {
      alert('Add subtask failed: ' + e.message);
      subEl.remove();
    }
  });
}
