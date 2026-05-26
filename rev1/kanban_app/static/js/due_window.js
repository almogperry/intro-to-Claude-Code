function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

function getWindowStart(due_date, scope) {
  const taskDue = parseDate(due_date);
  if (scope === 'day') return new Date(taskDue.getTime() - 3 * 60 * 60 * 1000);
  if (scope === 'week') return new Date(taskDue.getTime() - 3 * 24 * 60 * 60 * 1000);
  if (scope === 'month') return new Date(taskDue.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (scope === 'year') return new Date(taskDue.getTime() - 90 * 24 * 60 * 60 * 1000);
  return taskDue;
}

export function getDueStatus(due_date, scope) {
  if (!due_date || !scope) return 'noDeadline';

  const taskDue = parseDate(due_date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  taskDue.setHours(0, 0, 0, 0);

  const currentTime = now.getTime();
  const dueTime = taskDue.getTime();

  if (currentTime > dueTime) return 'overdue';

  const windowStart = getWindowStart(due_date, scope);
  windowStart.setHours(0, 0, 0, 0);

  if (currentTime >= windowStart.getTime()) return 'due';
  return 'scheduled';
}
