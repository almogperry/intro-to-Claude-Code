# Kanban Board

A single-user kanban board for tracking both personal tasks and work/study tasks together in one view.

## Language

**Board**:
The single shared workspace containing all tasks. There is exactly one board; the app is not multi-board.

**Task**:
A unit of work tracked on the board. Each task belongs to exactly one [[column]] (its current stage), carries a [[category]], and has a [[priority]]. A task is considered finished when it sits in a [[terminal column]].
_Avoid_: Card, item, ticket, todo

**Priority**:
A three-level urgency classification on a task. Enum: low / medium / high. Affects visual prominence on the board (e.g., high-priority tasks may be highlighted or sorted higher within a column).
_Avoid_: Importance, severity, level

**Column**:
A stage on the board representing where a task currently sits in its workflow (e.g. "To Do", "Doing", "Completed"). Columns are user-defined and ordered. The board seeds three defaults — To Do, Doing, Completed — on first use. The rightmost seeded column ("Completed") is flagged as the [[terminal column]].
_Avoid_: Stage, lane, status, list

**Terminal column**:
The rightmost column on the board, representing completion. Exactly one, fixed in position, immutable except for rename. A task in the terminal column is considered finished — it moves to the top of the terminal column and is marked with a large ✓. The board seeds "Completed" as the terminal column on first use. Moving a task into the terminal column while it has open [[subtask]]s triggers a confirmation prompt.
_Avoid_: Done column, finish column, completed flag

**Category**:
A user-defined classification on a task that distinguishes its life-domain (e.g. personal vs work/study). Each task has exactly one category. The board seeds two defaults — personal and work/study — on first use.
_Avoid_: Type, tag, label

**Subtask**:
A checkable sub-item belonging to exactly one parent [[task]]. Subtasks do not have categories, columns, or due dates of their own — they exist only inside their parent.
_Avoid_: Step, child task, todo


**Scope**:
An optional time-granularity on a task. Enum: day / week / month / year. Sets the [[due-window]]: 3h / 3d / 1w / 3mo before due. Scope and due date are paired — both null or both set. About deadline-granularity, not duration of effort.
_Avoid_: Timeframe, granularity, window

**no-deadline-task**:
A task without a [[scope]] and without due-date. a no-deadline task don't have a [[due-window]] and treated as [[upcoming]].
_Avoid_: Lead time, warning period

**Due-window**:
The period before a task's due date during which the task is visually framed as "due-window". Width is determined by the task's [[scope]] (3h / 3d / 1w / 3mo for day / week / month / year).
_Avoid_: Lead time, warning period

**Upcoming**:
The period before beginnig of a task's due window.
_Avoid_: Future task

**Overdue**:
Any time past a task's due date. Displayed with the bold dark-red frame regardless of scope.
_Avoid_: Late, missed

## Example dialogue

> **Dev**: When I drag a card into "Completed"...
>
> **PM**: That's a [[terminal column]] by default, so the card sinks to the top of Completed and gets a large ✓ on it. If it has open [[subtask]]s, you get a confirm prompt first.
>
> **Dev**: What if I rename "Completed" to "Shipped"?
>
> **PM**: That's fine — the terminal column always stays rightmost. You can only rename it, not move or remove it. Everything else can be rearranged.
>
> **Dev**: And the [[category]] — that's like a tag?
>
> **PM**: No — one category per [[task]], picked from a user-defined list. Tags are multi-select; categories aren't. User can add, remove, and rename categories. Defaults are "personal" and "work/study".

Rev02
