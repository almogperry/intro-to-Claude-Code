import { getState, setState } from '../store.js';
import { showSettingsDrawer } from './settings_drawer.js';

export function showIntroModal() {
  const state = getState();

  // Check if user has seen intro (has any non-example tasks)
  const hasRealTasks = state.tasks.some(t => !t.title.startsWith('[Example]'));
  if (hasRealTasks) return;

  const backdrop = document.createElement('div');
  backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:80;display:flex;align-items:center;justify-content:center';

  const modal = document.createElement('div');
  modal.style.cssText = 'background:#fff;padding:32px;border-radius:8px;max-width:500px;box-shadow:0 8px 24px rgba(0,0,0,0.2);text-align:center';

  const title = document.createElement('h2');
  title.textContent = 'Welcome to Kanban';
  title.style.cssText = 'margin:0 0 16px 0;font-size:24px';

  const desc = document.createElement('p');
  desc.textContent = 'Organize your tasks with a visual board. Edit columns to match your workflow.';
  desc.style.cssText = 'margin:0 0 24px 0;font-size:14px;color:#5e6c84';

  const btnGroup = document.createElement('div');
  btnGroup.style.cssText = 'display:flex;gap:12px;justify-content:center';

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit Columns';
  editBtn.style.cssText = 'padding:10px 16px;border:1px solid #0052cc;color:#0052cc;background:#fff;border-radius:4px;cursor:pointer;font-weight:500';
  editBtn.addEventListener('click', () => {
    document.body.removeChild(backdrop);
    let { backdrop: settingsBackdrop, drawer } = showSettingsDrawer(
      () => {
        document.body.removeChild(settingsBackdrop);
        document.body.removeChild(drawer);
      },
      () => {},
      () => {}
    );
  });

  const continueBtn = document.createElement('button');
  continueBtn.textContent = 'Continue';
  continueBtn.style.cssText = 'padding:10px 16px;background:#0052cc;color:#fff;border:0;border-radius:4px;cursor:pointer;font-weight:500';
  continueBtn.addEventListener('click', () => {
    removeExampleTasks();
    document.body.removeChild(backdrop);
  });

  btnGroup.appendChild(editBtn);
  btnGroup.appendChild(continueBtn);

  modal.appendChild(title);
  modal.appendChild(desc);
  modal.appendChild(btnGroup);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

function removeExampleTasks() {
  setState(s => ({
    ...s,
    tasks: s.tasks.filter(t => !t.title.startsWith('[Example]'))
  }));
}
