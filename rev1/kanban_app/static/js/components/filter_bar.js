export function renderFilterBar(parent, categories, columns, filterState, onFilterChange) {
  const filterEl = document.createElement('div');
  filterEl.style.cssText = 'background:#fff;border-bottom:1px solid #dfe1e6;padding:12px 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap';

  filterEl.innerHTML = `
    <span style="font-size:12px;color:#5e6c84;font-weight:600">FILTERS:</span>

    <div style="display:flex;gap:6px;flex-wrap:wrap" id="categoryChips"></div>

    <select id="priorityFilter" multiple style="padding:6px 8px;border:1px solid #dfe1e6;border-radius:4px;font-size:12px;min-width:120px;min-height:60px">
      <option value="high" ${filterState.priorities.includes('high') ? 'selected' : ''}>High</option>
      <option value="med" ${filterState.priorities.includes('med') ? 'selected' : ''}>Medium</option>
      <option value="low" ${filterState.priorities.includes('low') ? 'selected' : ''}>Low</option>
    </select>

    <select id="dueFilter" multiple style="padding:6px 8px;border:1px solid #dfe1e6;border-radius:4px;font-size:12px;min-width:130px;min-height:60px">
      <option value="overdue" ${filterState.dueDates.includes('overdue') ? 'selected' : ''}>Overdue</option>
      <option value="upcoming" ${filterState.dueDates.includes('upcoming') ? 'selected' : ''}>Upcoming</option>
      <option value="nodue" ${filterState.dueDates.includes('nodue') ? 'selected' : ''}>No deadline</option>
    </select>

    <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
      <input type="checkbox" id="hideCompleted" ${filterState.hideCompleted ? 'checked' : ''}>
      <span>Hide completed</span>
    </label>

    <select id="columnFilter" multiple style="padding:6px 8px;border:1px solid #dfe1e6;border-radius:4px;font-size:12px;min-width:130px;min-height:60px">
      ${columns.map(c => `<option value="${c.id}" ${filterState.columns.includes(c.id) ? 'selected' : ''}>${c.name}</option>`).join('')}
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
    const newPriorities = Array.from(e.target.selectedOptions).map(opt => opt.value);
    onFilterChange({ ...filterState, priorities: newPriorities });
  });

  filterEl.querySelector('#dueFilter').addEventListener('change', (e) => {
    const newDueDates = Array.from(e.target.selectedOptions).map(opt => opt.value);
    onFilterChange({ ...filterState, dueDates: newDueDates });
  });

  filterEl.querySelector('#hideCompleted').addEventListener('change', (e) => {
    onFilterChange({ ...filterState, hideCompleted: e.target.checked });
  });

  filterEl.querySelector('#columnFilter').addEventListener('change', (e) => {
    const newColumns = Array.from(e.target.selectedOptions).map(opt => parseInt(opt.value));
    onFilterChange({ ...filterState, columns: newColumns });
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
