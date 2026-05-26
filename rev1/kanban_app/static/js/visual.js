import { getState } from './store.js';
import { getDueStatus } from './due_window.js';

export function getCardClasses(task) {
  const classes = [`prio-${task.priority}`];
  const state = getState();
  const col = state.columns.find(c => c.id === task.column_id);

  if (col && col.is_terminal) {
    classes.push('completed');
  }

  const dueStatus = getDueStatus(task.due_date, task.scope);
  if (dueStatus === 'overdue') {
    classes.push('overdue');
  } else if (dueStatus === 'due') {
    classes.push('due');
  } else if (dueStatus === 'scheduled') {
    classes.push('scheduled');
  }

  return classes;
}
