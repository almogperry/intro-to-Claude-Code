import { getState } from './store.js';
import { isOverdue, isUpcoming } from './due_window.js';

export function getCardClasses(task) {
  const classes = [`prio-${task.priority}`];
  const state = getState();
  const col = state.columns.find(c => c.id === task.column_id);

  // Check if task is in terminal column (completed)
  if (col && col.is_terminal) {
    classes.push('completed');
  }

  // Check if task is upcoming or overdue
  if (isOverdue(task.due_date)) {
    classes.push('overdue');
  } else if (isUpcoming(task.due_date)) {
    classes.push('upcoming');
  }

  return classes;
}
