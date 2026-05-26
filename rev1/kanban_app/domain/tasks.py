# auto-position logic: new task gets position based on priority + due_date
from datetime import datetime, timedelta

def get_default_due_date(scope):
  """Get default due_date and due_time based on scope."""
  if not scope:
    return None, None

  days_map = {'day': 3, 'week': 21, 'month': 90, 'year': 365}
  days = days_map.get(scope, 0)

  if days == 0:
    return None, None

  due_date = (datetime.now() + timedelta(days=days)).strftime('%Y-%m-%d')
  due_time = '20:00'
  return due_date, due_time

def calc_insert_position(tasks_in_col, priority, due_date):
  """Calculate insertion position for a task in a column.

  Priority: high < med < low (numerically)
  Due date: earlier < later
  """
  prio_order = {'high': 0, 'med': 1, 'low': 2}
  new_prio = prio_order.get(priority, 1)

  for i, t in enumerate(tasks_in_col):
    t_prio = prio_order.get(t['priority'], 1)
    if t_prio > new_prio:
      return i
    if t_prio == new_prio:
      if due_date and t.get('due_date'):
        if due_date < t['due_date']:
          return i
      elif due_date and not t.get('due_date'):
        return i

  return len(tasks_in_col)
