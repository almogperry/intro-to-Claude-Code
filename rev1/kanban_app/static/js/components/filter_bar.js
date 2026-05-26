function createCheckboxDropdown(label, options, selectedValues, onSelection, isOpen, onMenuToggle) {
  const container = document.createElement('div');
  container.style.cssText = 'position:relative;display:inline-block';

  const btn = document.createElement('button');
  btn.style.cssText = 'padding:6px 8px;border:1px solid #dfe1e6;border-radius:4px;font-size:12px;background:#fff;cursor:pointer;white-space:nowrap';
  btn.textContent = label;

  const menu = document.createElement('div');
  menu.style.cssText = `display:${isOpen ? 'block' : 'none'};position:absolute;top:100%;left:0;background:#fff;border:1px solid #dfe1e6;border-radius:4px;z-index:10;min-width:150px;margin-top:2px;box-shadow:0 2px 8px rgba(0,0,0,0.1)`;

  options.forEach(opt => {
    const label = document.createElement('label');
    label.style.cssText = 'display:flex;align-items:center;gap:6px;padding:8px 12px;font-size:12px;cursor:pointer;white-space:nowrap';
    label.addEventListener('click', (e) => e.stopPropagation());

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = opt.value;
    checkbox.checked = selectedValues.includes(opt.value);
    checkbox.addEventListener('change', () => onSelection());

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(opt.label));
    menu.appendChild(label);
  });

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    onMenuToggle(!isOpen);
  });

  document.addEventListener('click', () => {
    if (isOpen) onMenuToggle(false);
  });

  container.appendChild(btn);
  container.appendChild(menu);
  return { container, menu, btn };
}

export function renderFilterBar(parent, categories, columns, filterState, onFilterChange) {
  const filterEl = document.createElement('div');
  filterEl.style.cssText = 'background:#fff;border-bottom:1px solid #dfe1e6;padding:12px 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap';

  filterEl.innerHTML = `
    <span style="font-size:12px;color:#5e6c84;font-weight:600">FILTERS:</span>
    <div id="categoryFilterContainer"></div>
    <div id="priorityFilterContainer"></div>
    <div id="dueFilterContainer"></div>
    <button id="clearFilters" style="padding:6px 12px;background:#dfe1e6;border:0;border-radius:4px;font-size:12px;cursor:pointer;margin-left:auto">Clear all</button>
  `;

  parent.appendChild(filterEl);

  // Helper to toggle menu (closes others, allows toggle of same)
  const toggleMenu = (menuKey, isOpen) => {
    const newOpenMenus = {};
    if (isOpen) {
      newOpenMenus[menuKey] = true;
    }
    onFilterChange({ ...filterState, openMenus: newOpenMenus });
  };

  // Category dropdown
  const categoryOptions = categories.map(c => ({ value: c.id.toString(), label: c.name }));
  const categoryDropdown = createCheckboxDropdown('Categories', categoryOptions, filterState.categories.map(c => c.toString()), () => {
    const selected = Array.from(categoryDropdown.menu.querySelectorAll('input:checked')).map(cb => parseInt(cb.value));
    const newCategories = selected.length === categoryOptions.length ? [] : selected;
    onFilterChange({ ...filterState, categories: newCategories });
  }, filterState.openMenus?.category, (isOpen) => {
    toggleMenu('category', isOpen);
  });
  filterEl.querySelector('#categoryFilterContainer').appendChild(categoryDropdown.container);

  // Priority dropdown
  const priorityOptions = [
    { value: 'high', label: 'High' },
    { value: 'med', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];
  const priorityDropdown = createCheckboxDropdown('Priority', priorityOptions, filterState.priorities, () => {
    const selected = Array.from(priorityDropdown.menu.querySelectorAll('input:checked')).map(cb => cb.value);
    const newPriorities = selected.length === priorityOptions.length ? [] : selected;
    onFilterChange({ ...filterState, priorities: newPriorities });
  }, filterState.openMenus?.priority, (isOpen) => {
    toggleMenu('priority', isOpen);
  });
  filterEl.querySelector('#priorityFilterContainer').appendChild(priorityDropdown.container);

  // Due date dropdown
  const dueOptions = [
    { value: 'overdue', label: 'Overdue' },
    { value: 'due', label: 'Due' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'noDeadline', label: 'No deadline' },
  ];
  const dueDropdown = createCheckboxDropdown('Due', dueOptions, filterState.dueDates, () => {
    const selected = Array.from(dueDropdown.menu.querySelectorAll('input:checked')).map(cb => cb.value);
    const newDueDates = selected.length === dueOptions.length ? [] : selected;
    onFilterChange({ ...filterState, dueDates: newDueDates });
  }, filterState.openMenus?.due, (isOpen) => {
    toggleMenu('due', isOpen);
  });
  filterEl.querySelector('#dueFilterContainer').appendChild(dueDropdown.container);

  filterEl.querySelector('#clearFilters').addEventListener('click', () => {
    onFilterChange({
      categories: [],
      priorities: [],
      dueDates: [],
    });
  });

  return filterEl;
}
