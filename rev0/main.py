import sqlite3
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from database import get_db, init_db

STATIC_DIR = Path(__file__).parent / "static"

APPLICATION_COLUMNS = {
    "company", "role", "location", "url", "status",
    "applied_date", "salary_min", "salary_max",
}
VALID_STATUSES = {"applied", "phone_screen", "interview", "offer", "rejected"}


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


# ---------- Pydantic models ----------

class ApplicationCreate(BaseModel):
    company: str = Field(min_length=1)
    role: str = Field(min_length=1)
    location: Optional[str] = None
    url: Optional[str] = None
    applied_date: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    status: Optional[str] = None


class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    url: Optional[str] = None
    status: Optional[str] = None
    applied_date: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None


class NoteCreate(BaseModel):
    body: str = Field(min_length=1)


class ContactCreate(BaseModel):
    name: str = Field(min_length=1)
    title: Optional[str] = None
    email: Optional[str] = None
    linkedin: Optional[str] = None


# ---------- Helpers ----------

def row_to_dict(row: sqlite3.Row) -> dict:
    return {k: row[k] for k in row.keys()}


def get_application_or_404(db: sqlite3.Connection, app_id: int) -> sqlite3.Row:
    row = db.execute("SELECT * FROM applications WHERE id = ?", (app_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return row


# ---------- Static / SPA ----------

@app.get("/")
def root():
    return FileResponse(STATIC_DIR / "index.html")


# ---------- Applications ----------

@app.get("/api/applications")
def list_applications(db: sqlite3.Connection = Depends(get_db)):
    rows = db.execute("SELECT * FROM applications ORDER BY created_at DESC").fetchall()
    results = []
    for r in rows:
        d = row_to_dict(r)
        d["contacts_count"] = db.execute(
            "SELECT COUNT(*) AS c FROM contacts WHERE application_id = ?", (r["id"],)
        ).fetchone()["c"]
        d["notes_count"] = db.execute(
            "SELECT COUNT(*) AS c FROM notes WHERE application_id = ?", (r["id"],)
        ).fetchone()["c"]
        results.append(d)
    return results


@app.post("/api/applications", status_code=status.HTTP_201_CREATED)
def create_application(payload: ApplicationCreate, db: sqlite3.Connection = Depends(get_db)):
    if payload.status is not None and payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    data = payload.model_dump(exclude_none=True)
    cols = list(data.keys())
    placeholders = ",".join(["?"] * len(cols))
    col_sql = ",".join(cols)
    cur = db.execute(
        f"INSERT INTO applications ({col_sql}) VALUES ({placeholders})",
        tuple(data[c] for c in cols),
    )
    db.commit()
    new_id = cur.lastrowid
    row = db.execute("SELECT * FROM applications WHERE id = ?", (new_id,)).fetchone()
    return row_to_dict(row)


@app.get("/api/applications/{app_id}")
def get_application(app_id: int, db: sqlite3.Connection = Depends(get_db)):
    row = get_application_or_404(db, app_id)
    app_dict = row_to_dict(row)
    contacts = [row_to_dict(r) for r in db.execute(
        "SELECT * FROM contacts WHERE application_id = ? ORDER BY id ASC", (app_id,)
    ).fetchall()]
    notes = [row_to_dict(r) for r in db.execute(
        "SELECT * FROM notes WHERE application_id = ? ORDER BY created_at DESC, id DESC",
        (app_id,),
    ).fetchall()]
    app_dict["contacts"] = contacts
    app_dict["notes"] = notes
    return app_dict


@app.put("/api/applications/{app_id}")
def update_application(
    app_id: int,
    payload: ApplicationUpdate,
    db: sqlite3.Connection = Depends(get_db),
):
    get_application_or_404(db, app_id)
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields provided")
    if "status" in data and data["status"] not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    safe_cols = [c for c in data.keys() if c in APPLICATION_COLUMNS]
    if not safe_cols:
        raise HTTPException(status_code=400, detail="No valid fields")
    set_sql = ",".join(f"{c} = ?" for c in safe_cols)
    values = [data[c] for c in safe_cols] + [app_id]
    db.execute(f"UPDATE applications SET {set_sql} WHERE id = ?", values)
    db.commit()
    row = db.execute("SELECT * FROM applications WHERE id = ?", (app_id,)).fetchone()
    return row_to_dict(row)


@app.delete("/api/applications/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(app_id: int, db: sqlite3.Connection = Depends(get_db)):
    get_application_or_404(db, app_id)
    db.execute("DELETE FROM applications WHERE id = ?", (app_id,))
    db.commit()
    return None


# ---------- Notes ----------

@app.post("/api/applications/{app_id}/notes", status_code=status.HTTP_201_CREATED)
def create_note(app_id: int, payload: NoteCreate, db: sqlite3.Connection = Depends(get_db)):
    get_application_or_404(db, app_id)
    cur = db.execute(
        "INSERT INTO notes (application_id, body) VALUES (?, ?)",
        (app_id, payload.body),
    )
    db.commit()
    row = db.execute("SELECT * FROM notes WHERE id = ?", (cur.lastrowid,)).fetchone()
    return row_to_dict(row)


@app.delete("/api/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT id FROM notes WHERE id = ?", (note_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Note not found")
    db.execute("DELETE FROM notes WHERE id = ?", (note_id,))
    db.commit()
    return None


# ---------- Contacts ----------

@app.post("/api/applications/{app_id}/contacts", status_code=status.HTTP_201_CREATED)
def create_contact(app_id: int, payload: ContactCreate, db: sqlite3.Connection = Depends(get_db)):
    get_application_or_404(db, app_id)
    cur = db.execute(
        "INSERT INTO contacts (application_id, name, title, email, linkedin) "
        "VALUES (?, ?, ?, ?, ?)",
        (app_id, payload.name, payload.title, payload.email, payload.linkedin),
    )
    db.commit()
    row = db.execute("SELECT * FROM contacts WHERE id = ?", (cur.lastrowid,)).fetchone()
    return row_to_dict(row)


@app.delete("/api/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(contact_id: int, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT id FROM contacts WHERE id = ?", (contact_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    db.execute("DELETE FROM contacts WHERE id = ?", (contact_id,))
    db.commit()
    return None
