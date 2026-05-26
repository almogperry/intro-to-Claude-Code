import { createTask } from '../api.js';
import { setState } from '../store.js';
import { animateCardExpand, animateCardCollapse } from '../modal_anim.js';
import { getCardClasses } from '../visual.js';

export function showTaskForm(parent, columns, categories) {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;z-index:1000;pointer-events:auto';
  modal.innerHTML = `
    <div style="position:absolute;inset:0;background:rgba(9,30,66,.4);backdrop-filter:blur(6px)" id="backdrop"></div>
    <div style="position:fixed;background:#fff;border-radius:8px;padding:24px;box-shadow:0 8px 32px rgba(0,0,0,.25);overflow-y:auto;z-index:1001;max-height:80vh" id="card">
      <button style="position:absolute;top:12px;right:12px;background:0;border:0;font-size:20px;cursor:pointer;color:#5e6c84" id="closeBtn">×</button>
      <input type="text" id="title" placeholder="Title" maxlength="200" style="width:100%;padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:16px;font-weight:600;margin-bottom:12px">
      <textarea id="desc" placeholder="Add description..." style="width:100%;padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:13px;min-height:60px;margin-bottom:12px;resize:vertical"></textarea>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <select id="cat" style="padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:13px">
          ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
        </select>
        <select id="col" style="padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:13px">
          ${columns.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
        </select>
        <select id="prio" style="padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:13px">
          <option value="high">High priority</option>
          <option value="med" selected>Medium priority</option>
          <option value="low">Low priority</option>
        </select>
        <select id="scope" style="padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:13px">
          <option value="">No deadline</option>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
        <input type="date" id="due" style="padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:13px">
        <input type="time" id="time" style="padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:13px">
      </div>

      <div style="display:flex;gap:8px">
        <button id="cancelBtn" style="flex:1;padding:8px;background:#dfe1e6;color:#172b4d;border:0;border-radius:4px;cursor:pointer">Cancel</button>
        <button id="createBtn" style="flex:1;padding:8px;background:#0052cc;color:#fff;border:0;border-radius:4px;cursor:pointer">Create</button>
      </div>
    </div>
  `;

  parent.appendChild(modal);
  animateCardExpand(null, modal);

  const closeBtn = document.getElementById('closeBtn');
  const backdrop = document.getElementById('backdrop');
  const cancelBtn = document.getElementById('cancelBtn');
  const createBtn = document.getElementById('createBtn');
  const scopeSelect = document.getElementById('scope');

  const close = async () => {
    const card = modal.querySelector('#card');
    await animateCardCollapse(card);
    modal.remove();
  };

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  cancelBtn.addEventListener('click', close);

  // Auto-populate due_date when scope changes
  scopeSelect.addEventListener('change', (e) => {
    const scope = e.target.value;
    const dueInput = document.getElementById('due');
    const timeInput = document.getElementById('time');

    if (!scope) {
      dueInput.value = '';
      timeInput.value = '';
    } else {
      const days = {day: 3, week: 21, month: 90, year: 365}[scope] || 0;
      if (days) {
        const d = new Date();
        d.setDate(d.getDate() + days);
        dueInput.value = d.toISOString().split('T')[0];
        timeInput.value = '20:00';
      }
    }
  });

  createBtn.addEventListener('click', async () => {
    const scope = document.getElementById('scope').value || null;
    const due_date = document.getElementById('due').value || null;
    const due_time = document.getElementById('time').value || null;

    // Validate: if scope is set, both due_date and due_time must be set
    if (scope && (!due_date || !due_time)) {
      alert('Invalid due date/time');
      // Auto-populate with default values
      const days = {day: 3, week: 21, month: 90, year: 365}[scope] || 0;
      if (days) {
        const d = new Date();
        d.setDate(d.getDate() + days);
        document.getElementById('due').value = d.toISOString().split('T')[0];
        document.getElementById('time').value = '20:00';
      }
      return;
    }

    const payload = {
      title: document.getElementById('title').value,
      description: document.getElementById('desc').value || null,
      category_id: parseInt(document.getElementById('cat').value),
      column_id: parseInt(document.getElementById('col').value),
      priority: document.getElementById('prio').value,
      scope: scope,
      due_date: due_date,
      due_time: due_time,
    };

    try {
      const newTask = await createTask(payload);
      setState(s => ({ ...s, tasks: [...s.tasks, newTask] }));
      await close();
    } catch (err) {
      alert('Failed to create task: ' + err.message);
    }
  });
}
