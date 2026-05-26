function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

export function isWithinDueWindow(due_date, scope) {
  if (!due_date || !scope) return false;

  const taskDue = parseDate(due_date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  taskDue.setHours(0, 0, 0, 0);

  if (scope === 'day') {
    const windowStart = new Date(taskDue.getTime() - 3 * 60 * 60 * 1000);
    windowStart.setHours(0, 0, 0, 0);
    return now.getTime() >= windowStart.getTime() && now.getTime() < taskDue.getTime();
  }
  if (scope === 'week') {
    const windowStart = new Date(taskDue.getTime() - 3 * 24 * 60 * 60 * 1000);
    windowStart.setHours(0, 0, 0, 0);
    return now.getTime() >= windowStart.getTime() && now.getTime() < taskDue.getTime();
  }
  if (scope === 'month') {
    const windowStart = new Date(taskDue.getTime() - 7 * 24 * 60 * 60 * 1000);
    windowStart.setHours(0, 0, 0, 0);
    return now.getTime() >= windowStart.getTime() && now.getTime() < taskDue.getTime();
  }
  if (scope === 'year') {
    const windowStart = new Date(taskDue.getTime() - 90 * 24 * 60 * 60 * 1000);
    windowStart.setHours(0, 0, 0, 0);
    return now.getTime() >= windowStart.getTime() && now.getTime() < taskDue.getTime();
  }
  return false;
}

export function getDueStatus(due_date, scope) {
  if (!due_date) return 'noDeadline';

  const taskDue = parseDate(due_date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  taskDue.setHours(0, 0, 0, 0);

  const todayTime = now.getTime();
  const taskTime = taskDue.getTime();

  if (taskTime < todayTime) return 'overdue';
  if (taskTime === todayTime) return 'due';
  return 'upcoming';
}
