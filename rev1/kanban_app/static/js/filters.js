export function applyFilters(tasks, filterState, columns, getDueStatus) {
  return tasks.filter(task => {
    // Category filter (OR: match ANY selected)
    if (filterState.categories.length > 0) {
      if (!filterState.categories.includes(task.category_id)) {
        return false;
      }
    }

    // Priority filter (OR: match ANY selected)
    if (filterState.priorities.length > 0) {
      if (!filterState.priorities.includes(task.priority)) {
        return false;
      }
    }

    // Due-date filter (OR: match ANY selected option)
    if (filterState.dueDates.length > 0) {
      const taskStatus = getDueStatus(task.due_date, task.scope);
      if (!filterState.dueDates.includes(taskStatus)) {
        return false;
      }
    }

    // Column filter (OR: match ANY selected)
    if (filterState.columns.length > 0) {
      if (!filterState.columns.includes(task.column_id)) {
        return false;
      }
    }

    return true;
  });
}

export function getDefaultFilterState() {
  return {
    categories: [],     // empty = show all
    priorities: [],     // empty = show all
    dueDates: [],       // empty = show all (scheduled, due, overdue, noDeadline)
    columns: [],        // empty = show all
  };
}
