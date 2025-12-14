const API_NOTE = "http://localhost:3000";

const addNoteBtn = document.getElementById('add-note-btn');
const noteFormContainer = document.getElementById('note-form-container');
const saveNoteBtn = document.getElementById('save-note-btn');
const cancelNoteBtn = document.getElementById('cancel-note-btn');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const notesGrid = document.getElementById('notes-grid');

let editingNoteId = null;

async function getNotes() {
    const res = await authFetchData(`${API_NOTE}/api/get_note`, {
        method: "GET"
    });
    if (!res) return false;
    return await res.json();
}

async function postNote(title, content) {
    const res = await authFetchData(`${API_NOTE}/api/post_note`, {
        method: "POST",
        body: JSON.stringify({
            TITLE: title,
            CONTENT: content
        })
    });
    if (!res) return;
    return await res.json();
}

async function updateNote(id, title, content) {
    const res = await authFetchData(`${API_NOTE}/api/put_note/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            TITLE: title,
            CONTENT: content
        })
    });
    if (!res) return;
    return await res.json();
}

async function deleteNote(id) {
    console.log(`${API_NOTE}/delete_note/${id}`)

    const res = await authFetchData(`${API_NOTE}/api/delete_note/${id}`, {
        method: "DELETE"
    });
    if (!res) return;
    return await res.json();
}

async function renderNotes() {
    notesGrid.innerHTML = "";
    const notes = await getNotes();

    if (notes) {
        notes.forEach(note => {
            const noteEl = document.createElement("article");
            noteEl.className = "note-item";
            noteEl.dataset.id = note.ID;

            noteEl.innerHTML = `
            <div class="note-actions">
            <button class="action-btn edit-btn"><i class="fas fa-pen"></i></button>
            <button class="action-btn delete-btn"><i class="fas fa-trash-alt"></i></button>
            </div>
            <h4>${note.TITLE}</h4>
            <p>${note.CONTENT.replace(/\n/g, "<br>")}</p>
            `;

            notesGrid.appendChild(noteEl);
        });
    }
}

addNoteBtn.addEventListener("click", openForm);
cancelNoteBtn.addEventListener("click", closeForm);

saveNoteBtn.addEventListener("click", async () => {
    const title = noteTitleInput.value.trim() || "Untitled";
    const content = noteContentInput.value.trim();

    if (!content) return;

    if (editingNoteId) {
        await updateNote(editingNoteId, title, content);
    }
    else {
        await postNote(title, content);
    }

    closeForm();
    renderNotes();
});

notesGrid.addEventListener("click", async (e) => {
    const noteItem = e.target.closest(".note-item");
    if (!noteItem) return;

    const id = noteItem.dataset.id;

    if (e.target.closest(".delete-btn")) {
        noteItem.style.opacity = "0";
        setTimeout(async () => {
            await deleteNote(id);
            renderNotes();
        }, 200);
    }

    if (e.target.closest(".edit-btn")) {
        const title = noteItem.querySelector("h4").textContent;
        const content = noteItem.querySelector("p").innerHTML.replace(/<br>/g, "\n");

        noteTitleInput.value = title;
        noteContentInput.value = content;
        editingNoteId = id;
        saveNoteBtn.textContent = "Update";
        openForm();
    }
});

function openForm() {
    noteFormContainer.classList.remove("hidden");
    addNoteBtn.style.display = "none";
    noteTitleInput.focus();
}

function closeForm() {
    noteFormContainer.classList.add("hidden");
    addNoteBtn.style.display = "flex";
    noteTitleInput.value = "";
    noteContentInput.value = "";
    editingNoteId = null;
    saveNoteBtn.textContent = "Save";
}
document.addEventListener("DOMContentLoaded", renderNotes);