export function isUpcoming(due_date) {
  if (!due_date) return false;
  const taskDue = new Date(due_date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  taskDue.setHours(0, 0, 0, 0);
  return taskDue.getTime() > now.getTime();
}

export function isOverdue(due_date) {
  if (!due_date) return false;
  const taskDue = new Date(due_date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  taskDue.setHours(0, 0, 0, 0);
  return taskDue.getTime() < now.getTime();
}
