from datetime import datetime

def is_upcoming(due_date, due_time=None):
  """Task is upcoming if due_date is in the future and within reasonable window."""
  if not due_date:
    return False
  try:
    task_due = datetime.strptime(due_date, '%Y-%m-%d')
    now = datetime.now()
    # Upcoming: future date, but not overdue
    return task_due.date() > now.date()
  except:
    return False

def is_overdue(due_date, due_time=None):
  """Task is overdue if due_date is in the past."""
  if not due_date:
    return False
  try:
    task_due = datetime.strptime(due_date, '%Y-%m-%d')
    now = datetime.now()
    return task_due.date() < now.date()
  except:
    return False
