// ---------- Constants ----------
const API = '/api';
const STATUSES = ['applied', 'phone_screen', 'interview', 'offer', 'rejected'];
const STATUS_LABELS = {
    applied: 'Applied',
    phone_screen: 'Phone Screen',
    interview: 'Interview',
    offer: 'Offer',
    rejected: 'Rejected',
};
const EDITABLE_FIELDS = [
    { key: 'company', label: 'Company', type: 'text' },
    { key: 'role', label: 'Role', type: 'text' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'url', label: 'URL', type: 'url' },
    { key: 'status', label: 'Status', type: 'select', options: STATUSES },
    { key: 'applied_date', label: 'Applied', type: 'date' },
    { key: 'salary_min', label: 'Salary min', type: 'number' },
    { key: 'salary_max', label: 'Salary max', type: 'number' },
];

// ---------- State ----------
let applications = [];
let draggedId = null;
let currentApp = null;

// ---------- API helper ----------
async function apiFetch(path, options = {}) {
    const opts = { headers: { 'Content-Type': 'application/json' }, ...options };
    const res = await fetch(API + path, opts);
    if (!res.ok) {
        let msg = `Request failed (${res.status})`;
        try {
            const data = await res.json();
            if (data && data.detail) msg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
        } catch (_) {}
        throw new Error(msg);
    }
    if (res.status === 204) return null;
    return res.json();
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupBoardDnD();
    setupModal();
    setupDrawer();
    loadApplications().catch(err => toast(err.message, true));
}

async function loadApplications() {
    applications = await apiFetch('/applications');
    renderStats();
    renderBoard();
}

// ---------- Stats ----------
function renderStats() {
    const total = applications.length;
    const pipeline = applications.filter(a => ['applied', 'phone_screen', 'interview'].includes(a.status)).length;
    const offers = applications.filter(a => a.status === 'offer').length;
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-pipeline').textContent = pipeline;
    document.getElementById('stat-offers').textContent = offers;
}

// ---------- Board ----------
function renderBoard() {
    STATUSES.forEach(status => {
        const col = document.querySelector(`.column[data-status="${status}"]`);
        const cardsEl = col.querySelector('.cards');
        const emptyEl = col.querySelector('.empty-state');
        cardsEl.innerHTML = '';
        const apps = applications.filter(a => a.status === status);
        apps.forEach(a => cardsEl.appendChild(renderCard(a)));
        col.querySelector('.col-count').textContent = apps.length;
        emptyEl.classList.toggle('hidden', apps.length > 0);
    });
}

function renderCard(app) {
    const el = document.createElement('div');
    el.className = 'card';
    el.draggable = true;
    el.dataset.id = app.id;
    el.innerHTML = `
        <div class="card-company"></div>
        <div class="card-role"></div>
        <div class="card-meta">
            <span class="card-days"></span>
            <span class="card-counts"></span>
        </div>
    `;
    el.querySelector('.card-company').textContent = app.company;
    el.querySelector('.card-role').textContent = app.role;
    el.querySelector('.card-days').textContent = daysSinceText(app.applied_date);
    const counts = [];
    if (app.notes_count) counts.push(`${app.notes_count} note${app.notes_count === 1 ? '' : 's'}`);
    if (app.contacts_count) counts.push(`${app.contacts_count} contact${app.contacts_count === 1 ? '' : 's'}`);
    el.querySelector('.card-counts').textContent = counts.join(' · ');
    el.addEventListener('click', () => openDrawer(app.id));
    el.addEventListener('dragstart', e => {
        draggedId = app.id;
        el.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(app.id));
    });
    el.addEventListener('dragend', () => {
        draggedId = null;
        el.classList.remove('dragging');
    });
    return el;
}

function daysSinceText(dateStr) {
    if (!dateStr) return 'no date';
    const d = new Date(dateStr);
    if (isNaN(d)) return 'no date';
    const days = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (days <= 0) return 'today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
}

// ---------- Drag-and-drop ----------
function setupBoardDnD() {
    document.querySelectorAll('.column').forEach(col => {
        col.addEventListener('dragover', e => {
            e.preventDefault();
            col.classList.add('drag-over');
        });
        col.addEventListener('dragleave', e => {
            if (!col.contains(e.relatedTarget)) col.classList.remove('drag-over');
        });
        col.addEventListener('drop', async e => {
            e.preventDefault();
            col.classList.remove('drag-over');
            const id = draggedId;
            if (id == null) return;
            const newStatus = col.dataset.status;
            const app = applications.find(a => a.id === id);
            if (!app || app.status === newStatus) return;
            const prevStatus = app.status;
            app.status = newStatus;
            renderBoard();
            renderStats();
            try {
                await apiFetch(`/applications/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: newStatus }),
                });
            } catch (err) {
                app.status = prevStatus;
                renderBoard();
                renderStats();
                toast(err.message, true);
            }
        });
    });
}

// ---------- Modal ----------
function setupModal() {
    const modal = document.getElementById('modal');
    const form = document.getElementById('add-form');
    const errorEl = document.getElementById('modal-error');
    const submitBtn = document.getElementById('modal-submit');

    document.getElementById('add-btn').addEventListener('click', () => {
        form.reset();
        errorEl.textContent = '';
        modal.classList.remove('hidden');
        form.querySelector('[name="company"]').focus();
    });
    document.getElementById('modal-close').addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

    form.addEventListener('submit', async e => {
        e.preventDefault();
        errorEl.textContent = '';
        const data = Object.fromEntries(new FormData(form).entries());
        if (!data.company.trim() || !data.role.trim()) {
            errorEl.textContent = 'Company and role are required.';
            return;
        }
        const payload = {};
        for (const [k, v] of Object.entries(data)) {
            if (v === '' || v == null) continue;
            if (k === 'salary_min' || k === 'salary_max') payload[k] = Number(v);
            else payload[k] = v;
        }
        setLoading(submitBtn, true);
        try {
            const created = await apiFetch('/applications', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            created.contacts_count = 0;
            created.notes_count = 0;
            applications.unshift(created);
            renderStats();
            renderBoard();
            modal.classList.add('hidden');
        } catch (err) {
            errorEl.textContent = err.message;
        } finally {
            setLoading(submitBtn, false);
        }
    });
}

// ---------- Drawer ----------
function setupDrawer() {
    document.getElementById('drawer-close').addEventListener('click', closeDrawer);
    document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeDrawer();
            document.getElementById('modal').classList.add('hidden');
        }
    });
}

async function openDrawer(id) {
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('drawer-overlay');
    const content = document.getElementById('drawer-content');
    overlay.classList.remove('hidden');
    drawer.classList.add('open');
    content.innerHTML = '<p class="skeleton-line"></p><p class="skeleton-line"></p><p class="skeleton-line"></p>';
    try {
        currentApp = await apiFetch(`/applications/${id}`);
        renderDrawer(currentApp);
    } catch (err) {
        content.innerHTML = `<p class="error-msg"></p>`;
        content.querySelector('.error-msg').textContent = err.message;
    }
}

function closeDrawer() {
    document.getElementById('drawer').classList.remove('open');
    document.getElementById('drawer-overlay').classList.add('hidden');
    currentApp = null;
}

function renderDrawer(app) {
    document.getElementById('drawer-title').textContent = `${app.company} — ${app.role}`;
    const content = document.getElementById('drawer-content');
    content.innerHTML = '';

    // Fields section
    const fieldsSec = document.createElement('section');
    fieldsSec.className = 'drawer-section';
    fieldsSec.innerHTML = '<h3>Details</h3>';
    const grid = document.createElement('div');
    grid.className = 'field-grid';
    EDITABLE_FIELDS.forEach(f => {
        const labelEl = document.createElement('span');
        labelEl.className = 'field-label';
        labelEl.textContent = f.label;
        const valueEl = document.createElement('span');
        valueEl.className = 'editable';
        valueEl.dataset.field = f.key;
        setEditableDisplay(valueEl, f, app[f.key]);
        valueEl.addEventListener('click', () => startEditField(valueEl, f));
        grid.appendChild(labelEl);
        grid.appendChild(valueEl);
    });
    fieldsSec.appendChild(grid);
    content.appendChild(fieldsSec);

    // Contacts section
    const contactsSec = document.createElement('section');
    contactsSec.className = 'drawer-section';
    contactsSec.innerHTML = '<h3>Contacts</h3>';
    const contactsList = document.createElement('div');
    contactsList.id = 'contacts-list';
    app.contacts.forEach(c => contactsList.appendChild(renderContactItem(c)));
    contactsSec.appendChild(contactsList);
    contactsSec.appendChild(renderContactForm(app.id));
    content.appendChild(contactsSec);

    // Notes section
    const notesSec = document.createElement('section');
    notesSec.className = 'drawer-section';
    notesSec.innerHTML = '<h3>Notes</h3>';
    notesSec.appendChild(renderNoteForm(app.id));
    const notesList = document.createElement('div');
    notesList.id = 'notes-list';
    app.notes.forEach(n => notesList.appendChild(renderNoteItem(n)));
    notesSec.appendChild(notesList);
    content.appendChild(notesSec);

    // Delete section
    const dangerSec = document.createElement('section');
    dangerSec.className = 'drawer-section';
    dangerSec.id = 'delete-section';
    const delBtn = document.createElement('button');
    delBtn.className = 'btn-danger';
    delBtn.textContent = 'Delete application';
    delBtn.addEventListener('click', () => showDeleteConfirm(app.id, dangerSec, delBtn));
    dangerSec.appendChild(delBtn);
    content.appendChild(dangerSec);
}

function setEditableDisplay(el, field, value) {
    if (value === null || value === undefined || value === '') {
        el.textContent = '—';
        el.classList.add('empty');
    } else if (field.type === 'select') {
        el.textContent = STATUS_LABELS[value] || value;
        el.classList.remove('empty');
    } else {
        el.textContent = value;
        el.classList.remove('empty');
    }
}

function startEditField(el, field) {
    if (el.querySelector('input, select')) return;
    const currentValue = currentApp[field.key];
    const original = el.innerHTML;
    let input;
    if (field.type === 'select') {
        input = document.createElement('select');
        field.options.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt;
            o.textContent = STATUS_LABELS[opt] || opt;
            if (opt === currentValue) o.selected = true;
            input.appendChild(o);
        });
    } else {
        input = document.createElement('input');
        input.type = field.type;
        input.value = currentValue == null ? '' : currentValue;
    }
    el.innerHTML = '';
    el.appendChild(input);
    input.focus();
    if (input.select) input.select();

    let done = false;
    const finish = async (commit) => {
        if (done) return;
        done = true;
        if (!commit) {
            el.innerHTML = original;
            return;
        }
        let raw = input.value;
        let newValue;
        if (raw === '' || raw == null) {
            newValue = null;
        } else if (field.type === 'number') {
            const n = Number(raw);
            if (Number.isNaN(n)) { el.innerHTML = original; toast('Invalid number', true); return; }
            newValue = n;
        } else {
            newValue = raw;
        }
        if (newValue === currentValue) { el.innerHTML = original; return; }
        if ((field.key === 'company' || field.key === 'role') && !newValue) {
            el.innerHTML = original;
            toast(`${field.label} cannot be empty`, true);
            return;
        }
        try {
            const updated = await apiFetch(`/applications/${currentApp.id}`, {
                method: 'PUT',
                body: JSON.stringify({ [field.key]: newValue }),
            });
            currentApp = { ...currentApp, ...updated };
            setEditableDisplay(el, field, updated[field.key]);
            const idx = applications.findIndex(a => a.id === currentApp.id);
            if (idx >= 0) {
                applications[idx] = {
                    ...applications[idx],
                    ...updated,
                    notes_count: applications[idx].notes_count,
                    contacts_count: applications[idx].contacts_count,
                };
            }
            if (field.key === 'company' || field.key === 'role') {
                document.getElementById('drawer-title').textContent = `${currentApp.company} — ${currentApp.role}`;
            }
            renderBoard();
            renderStats();
        } catch (err) {
            el.innerHTML = original;
            toast(err.message, true);
        }
    };

    input.addEventListener('blur', () => finish(true));
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
        else if (e.key === 'Escape') { e.preventDefault(); finish(false); }
    });
    if (field.type === 'select') {
        input.addEventListener('change', () => input.blur());
    }
}

// ---------- Notes ----------
function renderNoteItem(note) {
    const el = document.createElement('div');
    el.className = 'note';
    el.dataset.id = note.id;
    el.innerHTML = `
        <div>
            <div class="note-body"></div>
            <div class="note-time"></div>
        </div>
        <button class="icon-btn" title="Delete note">&times;</button>
    `;
    el.querySelector('.note-body').textContent = note.body;
    el.querySelector('.note-time').textContent = formatTime(note.created_at);
    el.querySelector('.icon-btn').addEventListener('click', async () => {
        try {
            await apiFetch(`/notes/${note.id}`, { method: 'DELETE' });
            el.remove();
            if (currentApp) {
                currentApp.notes = currentApp.notes.filter(n => n.id !== note.id);
                bumpListCount(currentApp.id, 'notes_count', -1);
            }
        } catch (err) { toast(err.message, true); }
    });
    return el;
}

function renderNoteForm(appId) {
    const form = document.createElement('form');
    form.className = 'inline-form';
    form.innerHTML = `
        <textarea name="body" placeholder="Add a note…" required></textarea>
        <button type="submit" class="btn-primary">Add note</button>
    `;
    const errEl = document.createElement('p');
    errEl.className = 'error-msg';
    form.appendChild(errEl);
    const submitBtn = form.querySelector('button');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        errEl.textContent = '';
        const body = form.body.value.trim();
        if (!body) { errEl.textContent = 'Note body required.'; return; }
        setLoading(submitBtn, true);
        try {
            const note = await apiFetch(`/applications/${appId}/notes`, {
                method: 'POST',
                body: JSON.stringify({ body }),
            });
            const list = document.getElementById('notes-list');
            list.prepend(renderNoteItem(note));
            form.reset();
            if (currentApp) {
                currentApp.notes.unshift(note);
                bumpListCount(appId, 'notes_count', 1);
            }
        } catch (err) {
            errEl.textContent = err.message;
        } finally {
            setLoading(submitBtn, false);
        }
    });
    return form;
}

// ---------- Contacts ----------
function renderContactItem(contact) {
    const el = document.createElement('div');
    el.className = 'contact';
    el.dataset.id = contact.id;
    const meta = [contact.title, contact.email, contact.linkedin].filter(Boolean).join(' · ');
    el.innerHTML = `
        <div>
            <div class="contact-name"></div>
            <div class="contact-meta"></div>
        </div>
        <button class="icon-btn" title="Delete contact">&times;</button>
    `;
    el.querySelector('.contact-name').textContent = contact.name;
    el.querySelector('.contact-meta').textContent = meta;
    el.querySelector('.icon-btn').addEventListener('click', async () => {
        try {
            await apiFetch(`/contacts/${contact.id}`, { method: 'DELETE' });
            el.remove();
            if (currentApp) {
                currentApp.contacts = currentApp.contacts.filter(c => c.id !== contact.id);
                bumpListCount(currentApp.id, 'contacts_count', -1);
            }
        } catch (err) { toast(err.message, true); }
    });
    return el;
}

function renderContactForm(appId) {
    const form = document.createElement('form');
    form.className = 'inline-form';
    form.innerHTML = `
        <div class="inline-form-row">
            <input name="name" placeholder="Name *" required>
            <input name="title" placeholder="Title">
        </div>
        <div class="inline-form-row">
            <input name="email" type="email" placeholder="Email">
            <input name="linkedin" placeholder="LinkedIn">
        </div>
        <button type="submit" class="btn-primary">Add contact</button>
    `;
    const errEl = document.createElement('p');
    errEl.className = 'error-msg';
    form.appendChild(errEl);
    const submitBtn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        errEl.textContent = '';
        const data = Object.fromEntries(new FormData(form).entries());
        if (!data.name.trim()) { errEl.textContent = 'Name required.'; return; }
        const payload = {};
        for (const [k, v] of Object.entries(data)) {
            if (v !== '' && v != null) payload[k] = v;
        }
        setLoading(submitBtn, true);
        try {
            const contact = await apiFetch(`/applications/${appId}/contacts`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            document.getElementById('contacts-list').appendChild(renderContactItem(contact));
            form.reset();
            if (currentApp) {
                currentApp.contacts.push(contact);
                bumpListCount(appId, 'contacts_count', 1);
            }
        } catch (err) {
            errEl.textContent = err.message;
        } finally {
            setLoading(submitBtn, false);
        }
    });
    return form;
}

// ---------- Delete confirmation ----------
function showDeleteConfirm(appId, sectionEl, triggerBtn) {
    if (sectionEl.querySelector('.confirm-box')) return;
    triggerBtn.style.display = 'none';
    const box = document.createElement('div');
    box.className = 'confirm-box';
    box.innerHTML = `
        <span>Delete this application?</span>
        <div class="confirm-actions">
            <button class="btn-secondary" data-act="cancel">Cancel</button>
            <button class="btn-danger" data-act="confirm">Delete</button>
        </div>
    `;
    sectionEl.appendChild(box);
    box.querySelector('[data-act="cancel"]').addEventListener('click', () => {
        box.remove();
        triggerBtn.style.display = '';
    });
    const confirmBtn = box.querySelector('[data-act="confirm"]');
    confirmBtn.addEventListener('click', async () => {
        setLoading(confirmBtn, true);
        try {
            await apiFetch(`/applications/${appId}`, { method: 'DELETE' });
            applications = applications.filter(a => a.id !== appId);
            renderBoard();
            renderStats();
            closeDrawer();
        } catch (err) {
            toast(err.message, true);
            setLoading(confirmBtn, false);
        }
    });
}

// ---------- Helpers ----------
function bumpListCount(appId, key, delta) {
    const idx = applications.findIndex(a => a.id === appId);
    if (idx >= 0) {
        applications[idx][key] = (applications[idx][key] || 0) + delta;
        renderBoard();
    }
}

function formatTime(s) {
    if (!s) return '';
    const d = new Date(s.includes('T') ? s : s.replace(' ', 'T') + 'Z');
    if (isNaN(d)) return s;
    return d.toLocaleString();
}

function setLoading(btn, on) {
    if (!btn) return;
    btn.classList.toggle('btn-loading', on);
    btn.disabled = on;
}

let toastTimer = null;
function toast(msg, isError = false) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.toggle('error', isError);
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 4000);
}
