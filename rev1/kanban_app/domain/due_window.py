from datetime import datetime, timedelta

def get_window_start(due_date, scope):
  """Calculate window start based on scope (3h/3d/1w/3mo before due)."""
  try:
    task_due = datetime.strptime(due_date, '%Y-%m-%d').date()
    if scope == 'day':
      return task_due - timedelta(hours=3)
    elif scope == 'week':
      return task_due - timedelta(days=3)
    elif scope == 'month':
      return task_due - timedelta(days=7)
    elif scope == 'year':
      return task_due - timedelta(days=90)
  except:
    pass
  return task_due

def get_due_status(due_date, scope=None):
  """Classify task: noDeadline, scheduled, due, or overdue."""
  if not due_date or not scope:
    return 'noDeadline'
  try:
    task_due = datetime.strptime(due_date, '%Y-%m-%d').date()
    now = datetime.now().date()

    if now > task_due:
      return 'overdue'

    window_start = get_window_start(due_date, scope)
    if now >= window_start:
      return 'due'

    return 'scheduled'
  except:
    return 'noDeadline'
