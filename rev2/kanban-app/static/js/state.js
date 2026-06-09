// Normalizes the flat-with-IDs board payload into ID-keyed maps.

export function normalize(payload) {
  return {
    boardId: payload.id,
    terminalColumnId: payload.terminalColumnId,
    columns: byId(payload.columns),
    categories: byId(payload.categories),
    tasks: byId(payload.tasks),
    subtasks: byId(payload.subtasks),
  };
}

function byId(items) {
  const map = {};
  for (const item of items) map[item.id] = item;
  return map;
}

// Columns ordered left to right by position.
export function orderedColumns(state) {
  return Object.values(state.columns).sort((a, b) => a.position - b.position);
}

// Tasks for a column, sorted priority desc then sort_key asc.
const PRIORITY = { high: 2, medium: 1, low: 0 };
export function tasksForColumn(state, columnId) {
  return Object.values(state.tasks)
    .filter((t) => t.columnId === columnId)
    .sort((a, b) => {
      const pd = (PRIORITY[b.priority] ?? 1) - (PRIORITY[a.priority] ?? 1);
      return pd !== 0 ? pd : a.sortKey - b.sortKey;
    });
}
