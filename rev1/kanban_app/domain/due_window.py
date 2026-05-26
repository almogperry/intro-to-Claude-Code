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
  """Classify task: noDeadline, upcoming, due, or overdue."""
  if not due_date:
    return 'noDeadline'
  try:
    task_due = datetime.strptime(due_date, '%Y-%m-%d').date()
    today = datetime.now().date()

    if task_due < today:
      return 'overdue'
    elif task_due == today:
      return 'due'

    if scope:
      window_start = get_window_start(due_date, scope)
      if today >= window_start:
        return 'upcoming'

    return 'noDeadline'
  except:
    return 'noDeadline'
