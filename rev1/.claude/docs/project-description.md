# Kanban Board — Build Brief

## 1. Overview

Single-user localhost kanban for personal + work/study tasks. One shared board, user-defined columns and categories.

## 2. Glossary

See [../../CONTEXT.md](../../CONTEXT.md). Terms used below — *Board, Task, Column, Terminal column, Category, Subtask, Scope, Due-window, Overdue* — defined there.

## 3. Stack & constants

| | |
|---|---|
| Backend | FastAPI |
| DB | SQLite via stdlib `sqlite3` |
| Frontend | Vanilla JS, ES modules, no build |
| DnD | SortableJS via CDN |
| Viewport | Desktop ≥1024px only |
| Port | 8000 |
| DB file | `kanban_app/kanban.db` |
| Title max | 200 chars |
| Code root | `rev1/kanban_app/` |
| Auth | none |

## 4. Folder structure

```
kanban_app/
├── server.py              FastAPI app, CORS, static mount, lifespan
├── config.py              constants
├── requirements.txt
├── kanban.db              gitignored
├── api/                   HTTP layer
│   ├── tasks.py
│   ├── subtasks.py
│   ├── columns.py
│   ├── categories.py
│   └── _schemas.py        Pydantic models
├── domain/                business logic, no SQL/HTTP
│   ├── tasks.py           auto-position, cross-col reset, terminal warning
│   ├── columns.py         terminal flag, delete-disposition
│   ├── categories.py
│   ├── due_window.py      scope→window, is_upcoming/is_overdue
│   └── seed.py            defaults + intro examples
├── db/
│   ├── connection.py
│   ├── schema.sql
│   ├── init.py            run schema + seed on first launch
│   └── repos/             SQL only
│       ├── tasks.py       (incl. subtasks — same aggregate)
│       ├── columns.py
│       └── categories.py
└── static/
    ├── index.html
    ├── style.css
    └── js/
        ├── main.js
        ├── api.js
        ├── store.js       in-memory state + pub/sub
        ├── dnd.js         SortableJS init per column
        ├── filters.js     state + localStorage + predicates
        ├── visual.js      priority colour, frame, ✓, DD/MM
        └── components/
            ├── board.js
            ├── column.js
            ├── card.js
            ├── card_expanded.js
            ├── filter_bar.js
            ├── settings_drawer.js
            ├── intro_modal.js
            └── confirm_modal.js
```

**Layering contract — arrows downward only:**

| Layer | Imports from | Never imports |
|---|---|---|
| `api/` | `domain/`, `db/repos/` | — |
| `domain/` | `db/repos/` only | `api/`, FastAPI |
| `db/repos/` | `db/connection` | `domain/`, `api/` |
| frontend `components/` | `store`, `api`, `visual`, `dnd` | each other directly |

Postgres swap → touch `db/` only. Framework swap → touch `static/` only. New entity (e.g. labels) → add parallel files, don't edit existing.

## 5. Task model

**Required:** `title` (≤200), `category_id`, `column_id`, `priority` (Low/Med/High, default Med).
**Optional:** `description` (plain text, preserve line-breaks), `scope`+`due_date` (paired — both null or both set), `due_time` (optional even when date set), `subtasks[]`.
**Auto:** `id`, `position` (within column), `created_at`, `updated_at`.

**Subtask:** `body`, `checked`, `position`. Manual order via drag, click to edit inline.

## 6. Behaviour rules

- **Insert position:** new task auto-positioned by priority desc, then due-date asc. Manual drag thereafter wins forever within the column.
- **Cross-column drag:** destination re-runs auto-sort (resets manual position).
- **Completion** = task in a terminal column. No separate flag.
- **Terminal + open subtasks:** moving in → confirm prompt.
- **Column/category delete with tasks:** pop-up asks per-task disposition (move where / delete).
- **Task delete:** confirm. **Subtask delete:** no confirm.
- **Optimistic UI:** card moves instantly; snap back + toast on API failure.
- **Multi-tab:** last-write-wins; no live sync.
- **Filters:** OR within type, AND between types. State persisted in localStorage.

## 7. Visual treatment

| Element | Rule |
|---|---|
| Card body colour | priority — green (High) → yellow (Med) → red (Low). *User-confirmed inverse of traffic-light.* |
| Card frame | bold = upcoming (within scope's due-window); bold dark-red = overdue |
| Completed card | sinks to column bottom + large ✓ overlay |
| Collapsed card | **no inline edits.** Only drag. |
| Expanded card | inline-grow in place, blurred board backdrop |
| Date display | `DD/MM`; add year when not current |
| Columns | fixed ~280px width; board scrolls horizontally |

## 8. Board controls

- Global `+ New task` button AND per-column `+`.
- Category chips (multi-select).
- Structured filters: priority, due-range, completed, column.
- No search. No stats. No export.
- Settings drawer manages columns + categories.

## 9. First-run

Intro page renders default columns (To Do / Doing / Completed) + example tasks. Pop-up: **Edit columns** | **Continue**. On Continue → examples vanish, board is empty.

## 10. API surface

```
GET    /api/state                          whole board, one round-trip
POST   /api/tasks
PATCH  /api/tasks/{id}
DELETE /api/tasks/{id}                     cascade subtasks
POST   /api/tasks/{id}/subtasks
PATCH  /api/subtasks/{id}
DELETE /api/subtasks/{id}
POST   /api/columns
PATCH  /api/columns/{id}                   rename, reorder, toggle terminal
DELETE /api/columns/{id}                   body: per-task disposition
POST   /api/categories
PATCH  /api/categories/{id}
DELETE /api/categories/{id}                body: per-task disposition
```

Mutations surgical. Single `GET /api/state` on boot, then optimistic local updates.

## 11. Schema sketch

```sql
columns(
  id            INTEGER PK,
  name          TEXT NOT NULL,
  position      INTEGER NOT NULL,
  is_terminal   INTEGER NOT NULL DEFAULT 0
);

categories(
  id            INTEGER PK,
  name          TEXT NOT NULL UNIQUE
);

tasks(
  id            INTEGER PK,
  title         TEXT NOT NULL,                       -- ≤200
  description   TEXT,
  category_id   INTEGER NOT NULL REFERENCES categories(id),
  column_id     INTEGER NOT NULL REFERENCES columns(id),
  priority      TEXT NOT NULL CHECK (priority IN ('low','med','high')),
  scope         TEXT CHECK (scope IN ('day','week','month','year')),
  due_date      TEXT,                                -- ISO; paired with scope
  due_time      TEXT,                                -- optional even when date set
  position      INTEGER NOT NULL,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  CHECK ((scope IS NULL) = (due_date IS NULL))      -- paired
);

subtasks(
  id            INTEGER PK,
  task_id       INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  body          TEXT NOT NULL,
  checked       INTEGER NOT NULL DEFAULT 0,
  position      INTEGER NOT NULL
);
```

## 12. Build order

Each step independently runnable.

1. `server.py` + `config.py` + `db/{connection,schema,init}.py` — empty board boots.
2. `db/repos/columns.py` + `api/columns.py` + render columns → 3 defaults visible.
3. `db/repos/tasks.py` + `api/tasks.py` + `card.js`/`column.js` — create + list.
4. `dnd.js` + `domain/tasks.py` positioning — drag works incl. cross-col rules.
5. `card_expanded.js` + subtasks endpoints — full edit.
6. `filter_bar.js` + `filters.js` + `domain/due_window.py` + `visual.js` — filters, frames, ✓.
7. `settings_drawer.js` + delete-disposition pop-ups — column/category management.
8. `intro_modal.js` + `domain/seed.py` — first-run flow.

## 13. Out of scope (v1)

Auth · mobile/responsive <1024px · export · full-text search · stats bar · notifications · recurrence · markdown · dark mode · undo · multi-board.

Do not reintroduce without explicit decision.

Rev01