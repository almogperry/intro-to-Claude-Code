import { getState, setState, subscribe } from '../store.js';
import { showDeleteDisposition } from './delete_disposition.js';

export function showSettingsDrawer(onClose, onColumnsChange, onCategoriesChange) {
  const backdrop = document.createElement('div');
  backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:40';
  backdrop.addEventListener('click', onClose);

  const drawer = document.createElement('div');
  drawer.style.cssText = 'position:fixed;right:0;top:0;bottom:0;width:350px;background:#fff;z-index:50;box-shadow:-2px 0 8px rgba(0,0,0,0.15);overflow-y:auto;display:flex;flex-direction:column';
  drawer.addEventListener('click', (e) => e.stopPropagation());

  const header = document.createElement('div');
  header.style.cssText = 'padding:16px;border-bottom:1px solid #dfe1e6;display:flex;justify-content:space-between;align-items:center';
  header.innerHTML = `<h2 style="margin:0;font-size:16px">Settings</h2>`;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = 'background:none;border:none;font-size:24px;cursor:pointer;padding:0 4px';
  closeBtn.addEventListener('click', onClose);
  header.appendChild(closeBtn);

  const content = document.createElement('div');
  content.style.cssText = 'flex:1;overflow-y:auto';

  const columnsSection = document.createElement('div');
  columnsSection.style.cssText = 'padding:16px;border-bottom:1px solid #dfe1e6';

  const categoriesSection = document.createElement('div');
  categoriesSection.style.cssText = 'padding:16px';

  function renderColumns() {
    columnsSection.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3 style="margin:0;font-size:13px;font-weight:600;color:#5e6c84">COLUMNS</h3></div>';
    const columnsHeader = columnsSection.querySelector('div');
    const addColBtn = document.createElement('button');
    addColBtn.textContent = '+ Add';
    addColBtn.style.cssText = 'padding:4px 8px;font-size:11px;border:1px solid #0052cc;color:#0052cc;border-radius:3px;cursor:pointer;background:#fff';
    addColBtn.addEventListener('click', () => showCreateColumnForm(onClose));
    columnsHeader.appendChild(addColBtn);

    const state = getState();
    state.columns.forEach(col => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px;margin-bottom:8px;background:#f4f5f7;border-radius:4px';

      const nameSpan = document.createElement('span');
      nameSpan.textContent = col.name;
      nameSpan.style.cssText = 'flex:1;font-size:12px';
      if (col.is_terminal) {
        nameSpan.style.fontWeight = '600';
        nameSpan.textContent += ' (terminal)';
      }

      const btnGroup = document.createElement('div');
      btnGroup.style.cssText = 'display:flex;gap:4px';

      const terminalBtn = document.createElement('button');
      terminalBtn.textContent = col.is_terminal ? 'unset' : 'terminal';
      terminalBtn.style.cssText = 'padding:4px 8px;font-size:11px;border:1px solid #dfe1e6;border-radius:3px;cursor:pointer;background:#fff';
      terminalBtn.addEventListener('click', async () => {
        const resp = await fetch(`/api/columns/${col.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_terminal: col.is_terminal ? 0 : 1 })
        });
        if (resp.ok) {
          const data = await resp.json();
          setState(s => ({
            ...s,
            columns: s.columns.map(c => c.id === col.id ? data : c)
          }));
        }
      });

      const editBtn = document.createElement('button');
      editBtn.textContent = 'edit';
      editBtn.style.cssText = 'padding:4px 8px;font-size:11px;border:1px solid #dfe1e6;border-radius:3px;cursor:pointer;background:#fff';
      editBtn.addEventListener('click', () => showColumnEditForm(col));

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'delete';
      deleteBtn.style.cssText = 'padding:4px 8px;font-size:11px;border:1px solid #dc3545;color:#dc3545;border-radius:3px;cursor:pointer;background:#fff';
      deleteBtn.addEventListener('click', () => deleteColumn(col));

      btnGroup.appendChild(terminalBtn);
      btnGroup.appendChild(editBtn);
      btnGroup.appendChild(deleteBtn);

      item.appendChild(nameSpan);
      item.appendChild(btnGroup);
      columnsSection.appendChild(item);
    });
  }

  function renderCategories() {
    categoriesSection.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3 style="margin:0;font-size:13px;font-weight:600;color:#5e6c84">CATEGORIES</h3></div>';
    const categoriesHeader = categoriesSection.querySelector('div');
    const addCatBtn = document.createElement('button');
    addCatBtn.textContent = '+ Add';
    addCatBtn.style.cssText = 'padding:4px 8px;font-size:11px;border:1px solid #0052cc;color:#0052cc;border-radius:3px;cursor:pointer;background:#fff';
    addCatBtn.addEventListener('click', () => showCreateCategoryForm(onClose));
    categoriesHeader.appendChild(addCatBtn);

    const state = getState();
    state.categories.forEach(cat => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:8px;margin-bottom:8px;background:#f4f5f7;border-radius:4px';

      const nameSpan = document.createElement('span');
      nameSpan.textContent = cat.name;
      nameSpan.style.cssText = 'flex:1;font-size:12px';

      const btnGroup = document.createElement('div');
      btnGroup.style.cssText = 'display:flex;gap:4px';

      const editBtn = document.createElement('button');
      editBtn.textContent = 'edit';
      editBtn.style.cssText = 'padding:4px 8px;font-size:11px;border:1px solid #dfe1e6;border-radius:3px;cursor:pointer;background:#fff';
      editBtn.addEventListener('click', () => showCategoryEditForm(cat));

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'delete';
      deleteBtn.style.cssText = 'padding:4px 8px;font-size:11px;border:1px solid #dc3545;color:#dc3545;border-radius:3px;cursor:pointer;background:#fff';
      deleteBtn.addEventListener('click', () => deleteCategory(cat));

      btnGroup.appendChild(editBtn);
      btnGroup.appendChild(deleteBtn);

      item.appendChild(nameSpan);
      item.appendChild(btnGroup);
      categoriesSection.appendChild(item);
    });
  }

  renderColumns();
  renderCategories();

  content.appendChild(columnsSection);
  content.appendChild(categoriesSection);

  drawer.appendChild(header);
  drawer.appendChild(content);

  const unsubscribe = subscribe(() => {
    renderColumns();
    renderCategories();
  });

  const origOnClose = onClose;
  onClose = () => {
    unsubscribe();
    origOnClose();
  };

  document.body.appendChild(backdrop);
  document.body.appendChild(drawer);

  return { backdrop, drawer };
}

function showColumnEditForm(column) {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:60';

  const form = document.createElement('div');
  form.style.cssText = 'background:#fff;padding:20px;border-radius:6px;min-width:300px;box-shadow:0 4px 12px rgba(0,0,0,0.15)';
  form.innerHTML = `<h3 style="margin:0 0 16px 0">Edit Column</h3>`;

  const input = document.createElement('input');
  input.type = 'text';
  input.value = column.name;
  input.style.cssText = 'width:100%;padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:13px;margin-bottom:16px';
  input.maxLength = 100;

  const btnGroup = document.createElement('div');
  btnGroup.style.cssText = 'display:flex;gap:8px;justify-content:flex-end';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = 'padding:8px 12px;border:1px solid #dfe1e6;border-radius:4px;cursor:pointer;background:#fff';
  cancelBtn.addEventListener('click', () => document.body.removeChild(modal));

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.style.cssText = 'padding:8px 12px;background:#0052cc;color:#fff;border:0;border-radius:4px;cursor:pointer';
  saveBtn.addEventListener('click', async () => {
    if (!input.value.trim()) {
      alert('Column name cannot be empty');
      return;
    }
    try {
      const payload = { name: input.value.trim() };
      const resp = await fetch(`/api/columns/${column.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (resp.ok) {
        setState(s => ({
          ...s,
          columns: s.columns.map(c => c.id === column.id ? data : c)
        }));
        document.body.removeChild(modal);
      } else {
        alert(`Error: ${data.detail || 'Failed to update column'}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      alert(`Error: ${err.message}`);
    }
  });

  btnGroup.appendChild(cancelBtn);
  btnGroup.appendChild(saveBtn);

  form.appendChild(input);
  form.appendChild(btnGroup);
  modal.appendChild(form);
  document.body.appendChild(modal);

  input.focus();
  input.select();
}

function showCategoryEditForm(category) {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:60';

  const form = document.createElement('div');
  form.style.cssText = 'background:#fff;padding:20px;border-radius:6px;min-width:300px;box-shadow:0 4px 12px rgba(0,0,0,0.15)';
  form.innerHTML = `<h3 style="margin:0 0 16px 0">Edit Category</h3>`;

  const input = document.createElement('input');
  input.type = 'text';
  input.value = category.name;
  input.style.cssText = 'width:100%;padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:13px;margin-bottom:16px';
  input.maxLength = 100;

  const btnGroup = document.createElement('div');
  btnGroup.style.cssText = 'display:flex;gap:8px;justify-content:flex-end';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = 'padding:8px 12px;border:1px solid #dfe1e6;border-radius:4px;cursor:pointer;background:#fff';
  cancelBtn.addEventListener('click', () => document.body.removeChild(modal));

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.style.cssText = 'padding:8px 12px;background:#0052cc;color:#fff;border:0;border-radius:4px;cursor:pointer';
  saveBtn.addEventListener('click', async () => {
    if (!input.value.trim()) {
      alert('Category name cannot be empty');
      return;
    }
    try {
      const payload = { name: input.value.trim() };
      const resp = await fetch(`/api/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (resp.ok) {
        setState(s => ({
          ...s,
          categories: s.categories.map(c => c.id === category.id ? data : c)
        }));
        document.body.removeChild(modal);
      } else {
        alert(`Error: ${data.detail || 'Failed to update category'}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      alert(`Error: ${err.message}`);
    }
  });

  btnGroup.appendChild(cancelBtn);
  btnGroup.appendChild(saveBtn);

  form.appendChild(input);
  form.appendChild(btnGroup);
  modal.appendChild(form);
  document.body.appendChild(modal);

  input.focus();
  input.select();
}

function deleteColumn(column) {
  if (!confirm(`Delete column "${column.name}"?`)) return;

  const state = getState();
  const tasksInColumn = state.tasks.filter(t => t.column_id === column.id);

  if (tasksInColumn.length === 0) {
    deleteColumnDirect(column.id);
  } else {
    showDeleteDisposition('column', column, tasksInColumn);
  }
}

function deleteCategory(category) {
  if (!confirm(`Delete category "${category.name}"?`)) return;

  const state = getState();
  const tasksInCategory = state.tasks.filter(t => t.category_id === category.id);

  if (tasksInCategory.length === 0) {
    deleteCategoryDirect(category.id);
  } else {
    showDeleteDisposition('category', category, tasksInCategory);
  }
}

async function deleteColumnDirect(columnId) {
  const resp = await fetch(`/api/columns/${columnId}?disposition=delete`, { method: 'DELETE' });
  if (resp.ok) {
    const stateResp = await fetch('/api/state');
    const newState = await stateResp.json();
    setState(s => ({ ...s, columns: newState.columns, tasks: newState.tasks }));
  }
}

async function deleteCategoryDirect(categoryId) {
  const resp = await fetch(`/api/categories/${categoryId}?disposition=delete`, { method: 'DELETE' });
  if (resp.ok) {
    const stateResp = await fetch('/api/state');
    const newState = await stateResp.json();
    setState(s => ({ ...s, categories: newState.categories, tasks: newState.tasks }));
  }
}

function showCreateColumnForm(onClose) {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:60';

  const form = document.createElement('div');
  form.style.cssText = 'background:#fff;padding:20px;border-radius:6px;min-width:300px;box-shadow:0 4px 12px rgba(0,0,0,0.15)';
  form.innerHTML = `<h3 style="margin:0 0 16px 0">Add Column</h3>`;

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Column name';
  input.style.cssText = 'width:100%;padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:13px;margin-bottom:16px';
  input.maxLength = 100;

  const btnGroup = document.createElement('div');
  btnGroup.style.cssText = 'display:flex;gap:8px;justify-content:flex-end';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = 'padding:8px 12px;border:1px solid #dfe1e6;border-radius:4px;cursor:pointer;background:#fff';
  cancelBtn.addEventListener('click', () => document.body.removeChild(modal));

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Create';
  saveBtn.style.cssText = 'padding:8px 12px;background:#0052cc;color:#fff;border:0;border-radius:4px;cursor:pointer';
  saveBtn.addEventListener('click', async () => {
    if (!input.value.trim()) {
      alert('Column name is required');
      return;
    }
    const resp = await fetch('/api/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: input.value.trim() })
    });
    if (resp.ok) {
      const colsResp = await fetch('/api/columns');
      const cols = await colsResp.json();
      setState(s => ({ ...s, columns: cols }));
      document.body.removeChild(modal);
    } else {
      alert('Failed to create column');
    }
  });

  btnGroup.appendChild(cancelBtn);
  btnGroup.appendChild(saveBtn);

  form.appendChild(input);
  form.appendChild(btnGroup);
  modal.appendChild(form);
  document.body.appendChild(modal);

  input.focus();
}

function showCreateCategoryForm(onClose) {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:60';

  const form = document.createElement('div');
  form.style.cssText = 'background:#fff;padding:20px;border-radius:6px;min-width:300px;box-shadow:0 4px 12px rgba(0,0,0,0.15)';
  form.innerHTML = `<h3 style="margin:0 0 16px 0">Add Category</h3>`;

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Category name';
  input.style.cssText = 'width:100%;padding:8px;border:1px solid #dfe1e6;border-radius:4px;font-size:13px;margin-bottom:16px';
  input.maxLength = 100;

  const btnGroup = document.createElement('div');
  btnGroup.style.cssText = 'display:flex;gap:8px;justify-content:flex-end';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = 'padding:8px 12px;border:1px solid #dfe1e6;border-radius:4px;cursor:pointer;background:#fff';
  cancelBtn.addEventListener('click', () => document.body.removeChild(modal));

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Create';
  saveBtn.style.cssText = 'padding:8px 12px;background:#0052cc;color:#fff;border:0;border-radius:4px;cursor:pointer';
  saveBtn.addEventListener('click', async () => {
    if (!input.value.trim()) {
      alert('Category name is required');
      return;
    }
    const resp = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: input.value.trim() })
    });
    if (resp.ok) {
      const catsResp = await fetch('/api/categories');
      const cats = await catsResp.json();
      setState(s => ({ ...s, categories: cats }));
      document.body.removeChild(modal);
    } else {
      alert('Failed to create category');
    }
  });

  btnGroup.appendChild(cancelBtn);
  btnGroup.appendChild(saveBtn);

  form.appendChild(input);
  form.appendChild(btnGroup);
  modal.appendChild(form);
  document.body.appendChild(modal);

  input.focus();
}
