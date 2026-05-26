export function applyFilters(tasks, filterState, columns, isOverdue, isUpcoming) {
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
      let matchesDue = false;
      for (const dueOption of filterState.dueDates) {
        if (dueOption === 'upcoming' && isUpcoming(task.due_date)) {
          matchesDue = true;
          break;
        }
        if (dueOption === 'overdue' && isOverdue(task.due_date)) {
          matchesDue = true;
          break;
        }
        if (dueOption === 'nodue' && !task.due_date) {
          matchesDue = true;
          break;
        }
      }
      if (!matchesDue) return false;
    }

    // Completed filter (show/hide completed tasks)
    if (filterState.hideCompleted) {
      const col = columns.find(c => c.id === task.column_id);
      if (col && col.is_terminal) {
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
    dueDates: [],       // empty = show all (upcoming, overdue, nodue)
    hideCompleted: false,
    columns: [],        // empty = show all
  };
}
