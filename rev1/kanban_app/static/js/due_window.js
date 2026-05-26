function getWindowStart(due_date, scope) {
  const taskDue = new Date(due_date);
  if (scope === 'day') return new Date(taskDue.getTime() - 3 * 60 * 60 * 1000);
  if (scope === 'week') return new Date(taskDue.getTime() - 3 * 24 * 60 * 60 * 1000);
  if (scope === 'month') return new Date(taskDue.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (scope === 'year') return new Date(taskDue.getTime() - 90 * 24 * 60 * 60 * 1000);
  return taskDue;
}

export function getDueStatus(due_date, scope) {
  if (!due_date) return 'noDeadline';

  const taskDue = new Date(due_date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  taskDue.setHours(0, 0, 0, 0);

  const todayTime = now.getTime();
  const taskTime = taskDue.getTime();

  if (taskTime < todayTime) return 'overdue';
  if (taskTime === todayTime) return 'due';

  const windowStart = getWindowStart(due_date, scope);
  windowStart.setHours(0, 0, 0, 0);
  if (now.getTime() >= windowStart.getTime()) return 'upcoming';

  return 'noDeadline';
}
