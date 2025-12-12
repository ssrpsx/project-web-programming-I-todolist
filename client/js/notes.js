document.addEventListener('DOMContentLoaded', () => {
    // 1. Gamification Sync
    let savedState = localStorage.getItem('bookback_gamestate');
    let gameState = savedState ? JSON.parse(savedState) : {
        currentXP: 0, maxXP: 100, level: 1, rankIndex: 0, 
        totalTasksDone: 0, streak: 0, achievements: { firstStep: false, king: false }
    };
    
    // [แก้ไข] Array ให้ตรงกับหน้าหลัก
    const ranks = ["Infant", "Toddler", "Kid", "Teenager", "Adult"];

    const xpText = document.querySelector('.exp-label span:last-child');
    const xpBar = document.querySelector('.progress-fill');
    const levelDisplay = document.querySelector('.profile-info .level');
    const rankDisplay = document.querySelector('.profile-info .rank .rank-name');
    const rankNum = document.querySelector('.rank-number');
    const badgeDisplay = document.querySelector('.badge'); // [ใหม่]
    const statValues = document.querySelectorAll('.stat-box .stat-value');

    function updateSidebarUI() {
        if (xpText) xpText.textContent = `${Math.floor(gameState.currentXP)}/${gameState.maxXP} XP`;
        if (xpBar) {
            let p = (gameState.currentXP / gameState.maxXP) * 100;
            if (p > 100) p = 100;
            xpBar.style.width = `${p}%`;
        }
        if (levelDisplay) levelDisplay.textContent = `Level ${gameState.level}`;
        if (rankDisplay) rankDisplay.textContent = ranks[gameState.rankIndex];
        if (rankNum) rankNum.textContent = gameState.rankIndex + 1;
        
        // [ใหม่] อัปเดต Badge
        if (badgeDisplay) badgeDisplay.textContent = gameState.level;

        if (statValues.length > 0) {
            statValues[0].textContent = gameState.streak;
            statValues[1].textContent = gameState.totalTasksDone;
        }

        const achFirstStep = document.getElementById('ach-first-step');
        if (achFirstStep && gameState.achievements.firstStep) achFirstStep.classList.add('unlocked');

        const achKing = document.getElementById('ach-king');
        if (achKing) {
            const kingText = achKing.querySelector('.king-progress-text');
            const kingBar = achKing.querySelector('.king-progress-bar');
            let kP = (gameState.level / 5) * 100;
            if (kP > 100) kP = 100;
            if (kingText) kingText.textContent = `${Math.min(gameState.level, 5)}/5`;
            if (kingBar) kingBar.style.width = `${kP}%`;
            if (gameState.achievements.king) achKing.classList.add('unlocked');
        }
    }

    updateSidebarUI();

    // 2. Notes Logic (เหมือนเดิม ไม่ต้องแก้)
    // ... (ส่วนล่างของไฟล์เหมือนเดิม) ...
    const addNoteBtn = document.getElementById('add-note-btn');
    const noteFormContainer = document.getElementById('note-form-container');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const cancelNoteBtn = document.getElementById('cancel-note-btn');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const notesGrid = document.getElementById('notes-grid');

    let savedNotes = localStorage.getItem('bookback_notes');
    let notes = savedNotes ? JSON.parse(savedNotes) : [
        { id: 1, title: 'Shopping List', content: 'Milk\nBread\nEggs\nFruits\nVegetables' },
        { id: 2, title: 'CSS233', content: 'How to make Tic Tac Toe using HTML, CSS and Javascript.' }
    ];
    let editingNoteId = null;

    renderNotes();

    function saveNotesToStorage() {
        localStorage.setItem('bookback_notes', JSON.stringify(notes));
    }

    addNoteBtn.addEventListener('click', () => { openForm(); });
    cancelNoteBtn.addEventListener('click', () => { closeForm(); });

    saveNoteBtn.addEventListener('click', () => {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();

        if (title || content) {
            if (editingNoteId) {
                const noteIndex = notes.findIndex(n => n.id === editingNoteId);
                if (noteIndex > -1) {
                    notes[noteIndex].title = title || 'Untitled';
                    notes[noteIndex].content = content;
                }
            } else {
                const newNote = {
                    id: Date.now(),
                    title: title || 'Untitled',
                    content: content
                };
                notes.unshift(newNote);
            }
            saveNotesToStorage();
            renderNotes();
            closeForm();
        }
    });

    notesGrid.addEventListener('click', (e) => {
        const target = e.target;
        const noteItem = target.closest('.note-item');
        if (!noteItem) return;
        const noteId = Number(noteItem.dataset.id);

        if (target.closest('.delete-btn')) {
            notes = notes.filter(n => n.id !== noteId);
            saveNotesToStorage();
            noteItem.style.opacity = '0';
            setTimeout(() => renderNotes(), 200);
        }

        if (target.closest('.edit-btn')) {
            const noteToEdit = notes.find(n => n.id === noteId);
            if (noteToEdit) {
                noteTitleInput.value = noteToEdit.title;
                noteContentInput.value = noteToEdit.content;
                editingNoteId = noteId;
                saveNoteBtn.textContent = 'Update';
                openForm();
            }
        }
    });

    function openForm() {
        noteFormContainer.classList.remove('hidden');
        noteTitleInput.focus();
        addNoteBtn.style.display = 'none';
    }

    function closeForm() {
        noteFormContainer.classList.add('hidden');
        addNoteBtn.style.display = 'flex';
        noteTitleInput.value = '';
        noteContentInput.value = '';
        editingNoteId = null;
        saveNoteBtn.textContent = 'Save';
    }

    function renderNotes() {
        notesGrid.innerHTML = '';
        notes.forEach(note => {
            const noteEl = document.createElement('article');
            noteEl.className = 'note-item';
            noteEl.dataset.id = note.id;
            noteEl.innerHTML = `
                <div class="note-actions">
                    <button class="action-btn edit-btn"><i class="fas fa-pen"></i></button>
                    <button class="action-btn delete-btn"><i class="fas fa-trash-alt"></i></button>
                </div>
                <h4>${note.title}</h4>
                <p>${note.content.replace(/\n/g, '<br>')}</p>
            `;
            notesGrid.appendChild(noteEl);
        });
    }
});