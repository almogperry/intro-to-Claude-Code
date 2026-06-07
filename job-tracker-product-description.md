# Job Application Tracker — Product Documentation
---

## 1. SPEC (Technical Specification)

### 1.1 Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JS + HTML/CSS |
| Backend | Python + FastAPI |
| Database | SQLite via Python `sqlite3` (stdlib) |
| API Style | REST, JSON |
| Hosting | Local (localhost) |

### 1.2 Data Models

#### `applications`
| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `company` | TEXT | Required |
| `role` | TEXT | Required |
| `location` | TEXT | Optional |
| `url` | TEXT | Job posting URL |
| `status` | TEXT | Enum: applied, phone_screen, interview, offer, rejected |
| `applied_date` | DATE | ISO 8601 |
| `salary_min` | INTEGER | Optional |
| `salary_max` | INTEGER | Optional |
| `created_at` | DATETIME | Auto |
| `updated_at` | DATETIME | Auto |

#### `contacts`
| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `application_id` | INTEGER FK | → applications.id ON DELETE CASCADE |
| `name` | TEXT | Required |
| `title` | TEXT | Optional |
| `email` | TEXT | Optional |
| `linkedin` | TEXT | Optional |

#### `notes`
| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `application_id` | INTEGER FK | → applications.id ON DELETE CASCADE |
| `body` | TEXT | Required |
| `created_at` | DATETIME | Auto |

### 1.3 REST API Endpoints

```
GET    /api/applications          — list all, with status filter support
POST   /api/applications          — create new application
GET    /api/applications/{id}     — get single application with contacts + notes
PUT    /api/applications/{id}     — update fields (including status)
DELETE /api/applications/{id}     — delete application

POST   /api/applications/{id}/notes       — add a note
DELETE /api/notes/{id}                    — delete a note

POST   /api/applications/{id}/contacts    — add a contact
DELETE /api/contacts/{id}                 — delete a contact
```

### 1.4 Frontend Views

- **Board View** — Kanban with 5 columns (one per status). Each card shows company, role, days since applied. Drag-and-drop to change status (or status button on card).
- **Detail Drawer/Modal** — Opens on card click. Shows all fields, notes timeline, contacts list. Inline editing.
- **Add Application Form** — Modal triggered by a prominent "+" button. Requires company + role; all other fields optional.
- **Stats Bar** — Top of page. Shows total applications, active pipeline count, and offer count.

### 1.5 Non-Functional Requirements

- Runs entirely on localhost, no auth required
- Database file persists between server restarts
- No external API calls
- Backend must allow CORS from localhost frontend origin (FastAPI `CORSMiddleware`)
- Responsive down to 1024px width
- Operations complete in under 300ms
- `updated_at` field updated via SQLite trigger or application-level logic on every PUT

---

## 2. PRD (Product Requirements Document)

### 2.1 Overview

**Product Name:** Job Application Tracker (JAT)  
**Version:** 1.0 MVP  
**Owner:** Solo job seeker / individual user  
**Platform:** Web (localhost, single user)

### 2.2 Problem Statement

Job seekers managing multiple applications across different companies lose track of where each application stands, forget to follow up, and have no single place to log recruiter contacts or interview notes. Spreadsheets work but have no visual pipeline view and require manual discipline to maintain.

### 2.3 Goals

| Goal | Success Metric |
|---|---|
| Reduce cognitive overhead of tracking | All applications visible in one board view |
| Never forget a contact again | Every application can store ≥1 contact with email |
| Log interview notes instantly | Note added in <10 seconds from board view |
| See pipeline health at a glance | Stats bar shows counts per stage without clicking |

### 2.4 Non-Goals (MVP)

- Email or calendar integration
- Resume version tracking
- Multi-user / auth
- Mobile app
- Reminders or notifications
- AI-assisted features

### 2.5 User Stories

**Core Flow**

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| US-01 | Job seeker | Add a new application with company and role | I have a record the moment I apply |
| US-02 | Job seeker | See all applications grouped by stage on a kanban board | I can assess my pipeline at a glance |
| US-03 | Job seeker | Move an application to a new stage | The board reflects my real-world progress |
| US-04 | Job seeker | Open an application and read all its notes | I can prepare for a call by reviewing history |
| US-05 | Job seeker | Add a timestamped note to any application | I can log what happened after an interview |
| US-06 | Job seeker | Store a recruiter's name and email on an application | I can find contact info without leaving the app |
| US-07 | Job seeker | Delete an application | I can remove irrelevant entries |
| US-08 | Job seeker | See how many applications are in each stage | I know if I need to apply more |

### 2.6 Functional Requirements

#### Board
- **FR-01** Kanban board with exactly 5 columns: Applied, Phone Screen, Interview, Offer, Rejected
- **FR-02** Each card displays: company name, role title, days since applied
- **FR-03** Status can be changed via drag-and-drop OR a dropdown on the card
- **FR-04** Columns show a count badge of cards within them

#### Application Management
- **FR-05** "Add Application" button opens a form modal
- **FR-06** Required fields: Company, Role. Optional: Location, Job URL, Salary range, Applied date (defaults to today)
- **FR-07** All fields editable after creation from the detail view
- **FR-08** Deleting an application requires a confirmation step; notes and contacts delete immediately (no confirmation)

#### Detail View
- **FR-09** Opens as a side drawer or modal on card click
- **FR-10** Displays all application fields with inline edit capability
- **FR-11** Notes section shows entries in reverse-chronological order with timestamps
- **FR-12** "Add Note" is a textarea + submit button; no page reload required
- **FR-13** Contacts section lists name, title, email, LinkedIn per contact
- **FR-14** Contacts can be added and deleted from the detail view

#### Stats
- **FR-15** Header/top bar shows: Total Applications, In Pipeline (all except Rejected), Offers

### 2.7 UX Requirements

- **UX-01** Empty state: each empty kanban column shows a prompt ("No applications yet — drag one here or add a new one")
- **UX-02** Loading states on all async operations
- **UX-03** Error messages surface inline (not browser alert())
- **UX-04** Optimistic UI updates on status change (don't wait for API before moving card)

### 2.8 Modular Growth Path

The MVP is intentionally minimal. The following features are explicitly scoped OUT of v1.0 but the data model and API should not foreclose them:

| Feature | Notes for future sprint |
|---|---|
| Follow-up reminders | Add `next_action_date` to applications table |
| Interview rounds tracking | New `interviews` table linked to applications |
| Document attachments | Add `documents` table with file paths |
| Offer comparison | Salary fields already in schema; add benefits fields |
| Analytics dashboard | Separate `/analytics` route reading from existing tables |
| Export to CSV | New `GET /api/export` endpoint, no schema change needed |
| Dark mode | CSS variable architecture supports it from day one |

### 2.9 Acceptance Criteria

The MVP is considered complete when:

- [ ] A new application can be created and appears immediately on the board
- [ ] Dragging a card (or using the status control) persists the new status after page refresh
- [ ] A note added in the detail view appears without a page reload
- [ ] A contact (name + email) can be added and retrieved
- [ ] Deleting an application removes it and all associated notes/contacts
- [ ] The stats bar reflects accurate counts across all stages
- [ ] The SQLite database file survives a server restart with all data intact

---

*MVP scope only*
