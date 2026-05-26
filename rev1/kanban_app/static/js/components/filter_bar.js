function createCheckboxDropdown(label, options, selectedValues, onSelection) {
  const container = document.createElement('div');
  container.style.cssText = 'position:relative;display:inline-block';

  const btn = document.createElement('button');
  btn.style.cssText = 'padding:6px 8px;border:1px solid #dfe1e6;border-radius:4px;font-size:12px;background:#fff;cursor:pointer;white-space:nowrap';
  btn.textContent = label;

  const menu = document.createElement('div');
  menu.style.cssText = 'display:none;position:absolute;top:100%;left:0;background:#fff;border:1px solid #dfe1e6;border-radius:4px;z-index:10;min-width:150px;margin-top:2px;box-shadow:0 2px 8px rgba(0,0,0,0.1)';

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
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  });

  document.addEventListener('click', () => {
    menu.style.display = 'none';
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
    <div style="display:flex;gap:6px;flex-wrap:wrap" id="categoryChips"></div>
    <div id="priorityFilterContainer"></div>
    <div id="dueFilterContainer"></div>
    <div id="columnFilterContainer"></div>
    <button id="clearFilters" style="padding:6px 12px;background:#dfe1e6;border:0;border-radius:4px;font-size:12px;cursor:pointer;margin-left:auto">Clear all</button>
  `;

  parent.appendChild(filterEl);

  // Render category chips
  const chipsEl = filterEl.querySelector('#categoryChips');
  categories.forEach(cat => {
    const chip = document.createElement('button');
    chip.style.cssText = `
      padding:6px 10px;border-radius:16px;border:1px solid #dfe1e6;
      background:${filterState.categories.includes(cat.id) ? '#0052cc' : '#fff'};
      color:${filterState.categories.includes(cat.id) ? '#fff' : '#172b4d'};
      font-size:12px;cursor:pointer;
      ${filterState.categories.includes(cat.id) ? 'border-color:#0052cc' : ''}
    `;
    chip.textContent = cat.name;
    chip.addEventListener('click', () => {
      const newCategories = filterState.categories.includes(cat.id)
        ? filterState.categories.filter(id => id !== cat.id)
        : [...filterState.categories, cat.id];
      onFilterChange({ ...filterState, categories: newCategories });
    });
    chipsEl.appendChild(chip);
  });

  // Priority dropdown
  const priorityOptions = [
    { value: 'high', label: 'High' },
    { value: 'med', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];
  const priorityDropdown = createCheckboxDropdown('Priority', priorityOptions, filterState.priorities, () => {
    const selected = Array.from(priorityDropdown.menu.querySelectorAll('input:checked')).map(cb => cb.value);
    onFilterChange({ ...filterState, priorities: selected });
  });
  filterEl.querySelector('#priorityFilterContainer').appendChild(priorityDropdown.container);

  // Due date dropdown
  const dueOptions = [
    { value: 'overdue', label: 'Overdue' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'nodue', label: 'No deadline' },
  ];
  const dueDropdown = createCheckboxDropdown('Due', dueOptions, filterState.dueDates, () => {
    const selected = Array.from(dueDropdown.menu.querySelectorAll('input:checked')).map(cb => cb.value);
    onFilterChange({ ...filterState, dueDates: selected });
  });
  filterEl.querySelector('#dueFilterContainer').appendChild(dueDropdown.container);

  // Column dropdown
  const columnOptions = columns.map(c => ({ value: c.id.toString(), label: c.name }));
  const columnDropdown = createCheckboxDropdown('Columns', columnOptions, filterState.columns.map(c => c.toString()), () => {
    const selected = Array.from(columnDropdown.menu.querySelectorAll('input:checked')).map(cb => parseInt(cb.value));
    onFilterChange({ ...filterState, columns: selected });
  });
  filterEl.querySelector('#columnFilterContainer').appendChild(columnDropdown.container);

  filterEl.querySelector('#clearFilters').addEventListener('click', () => {
    onFilterChange({
      categories: [],
      priorities: [],
      dueDates: [],
      columns: [],
    });
  });

  return filterEl;
}
