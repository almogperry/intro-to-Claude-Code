export function renderFilterBar(parent, categories, columns, filterState, onFilterChange) {
  const filterEl = document.createElement('div');
  filterEl.style.cssText = 'background:#fff;border-bottom:1px solid #dfe1e6;padding:12px 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap';

  filterEl.innerHTML = `
    <span style="font-size:12px;color:#5e6c84;font-weight:600">FILTERS:</span>

    <div style="display:flex;gap:6px;flex-wrap:wrap" id="categoryChips"></div>

    <select id="priorityFilter" style="padding:6px 8px;border:1px solid #dfe1e6;border-radius:4px;font-size:12px;max-width:120px">
      <option value="">Priority</option>
      <option value="high">High</option>
      <option value="med">Medium</option>
      <option value="low">Low</option>
    </select>

    <select id="dueFilter" style="padding:6px 8px;border:1px solid #dfe1e6;border-radius:4px;font-size:12px;max-width:120px">
      <option value="">Due date</option>
      <option value="overdue">Overdue</option>
      <option value="upcoming">Upcoming</option>
      <option value="nodue">No deadline</option>
    </select>

    <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
      <input type="checkbox" id="hideCompleted">
      <span>Hide completed</span>
    </label>

    <select id="columnFilter" style="padding:6px 8px;border:1px solid #dfe1e6;border-radius:4px;font-size:12px;max-width:120px">
      <option value="">All columns</option>
      ${columns.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
    </select>

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

  // Filter change handlers
  filterEl.querySelector('#priorityFilter').addEventListener('change', (e) => {
    const newPriorities = e.target.value
      ? [e.target.value]
      : [];
    onFilterChange({ ...filterState, priorities: newPriorities });
    e.target.value = ''; // reset dropdown
  });

  filterEl.querySelector('#dueFilter').addEventListener('change', (e) => {
    const newDueDates = e.target.value
      ? [e.target.value]
      : [];
    onFilterChange({ ...filterState, dueDates: newDueDates });
    e.target.value = ''; // reset dropdown
  });

  filterEl.querySelector('#hideCompleted').addEventListener('change', (e) => {
    onFilterChange({ ...filterState, hideCompleted: e.target.checked });
  });

  filterEl.querySelector('#columnFilter').addEventListener('change', (e) => {
    const newColumns = e.target.value
      ? [parseInt(e.target.value)]
      : [];
    onFilterChange({ ...filterState, columns: newColumns });
    e.target.value = ''; // reset dropdown
  });

  filterEl.querySelector('#clearFilters').addEventListener('click', () => {
    onFilterChange({
      categories: [],
      priorities: [],
      dueDates: [],
      hideCompleted: false,
      columns: [],
    });
  });

  return filterEl;
}
