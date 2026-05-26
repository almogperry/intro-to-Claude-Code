import { getState } from './store.js';

export function getCardClasses(task) {
  const classes = [`prio-${task.priority}`];
  const state = getState();
  const col = state.columns.find(c => c.id === task.column_id);

  // Check if task is in terminal column (completed)
  if (col && col.is_terminal) {
    classes.push('completed');
  }

  // Check if task is upcoming or overdue
  if (task.due_date) {
    const taskDue = new Date(task.due_date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    taskDue.setHours(0, 0, 0, 0);

    if (taskDue.getTime() < now.getTime()) {
      classes.push('overdue');
    } else if (taskDue.getTime() > now.getTime()) {
      classes.push('upcoming');
    }
  }

  return classes;
}
