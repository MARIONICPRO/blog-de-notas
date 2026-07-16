import { getCurrentUser, logout, requireAuth } from './auth.js';
import { 
    cargarNotas, 
    crearNota, 
    editarNota, 
    eliminarNota, 
    formatearFecha 
} from './notes.js';

const MAX_CARACTERES = 1000;
let notaEditandoId = null;
let usuarioActual = null;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    usuarioActual = getCurrentUser();
    
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userName = document.getElementById('userName');
    const noteInput = document.getElementById('noteInput');
    const addBtn = document.getElementById('addNoteBtn');
    
    if (!usuarioActual) {
        // Usuario no autenticado
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        userName.style.display = 'none';
        noteInput.disabled = true;
        addBtn.disabled = true;
        
        // Mostrar mensaje de login
        const container = document.getElementById('notesContainer');
        if (container) {
            container.innerHTML = `
                <div class="empty-state" style="min-height: 200px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">
                        <i class="fas fa-lock" style="color: #6B7280;"></i>
                    </div>
                    <h3>Inicia sesión para ver tus notas</h3>
                    <p>Haz clic en el botón "Iniciar Sesión" arriba</p>
                </div>
            `;
        }
        
        loginBtn.addEventListener('click', () => {
            requireAuth();
        });
        
        return;
    }
    
    // Usuario autenticado
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    userName.style.display = 'block';
    userName.innerHTML = `<i class="fas fa-user-circle"></i> ${usuarioActual.nombre || usuarioActual.usuario?.nombre || 'Usuario'}`;
    noteInput.disabled = false;
    addBtn.disabled = false;
    
    // Configurar logout
    logoutBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de cerrar sesión?')) {
            logout();
        }
    });
    
    // Inicializar la aplicación
    inicializarApp();
});

// ===== INICIALIZAR APP =====
function inicializarApp() {
    // Configurar eventos
    const input = document.getElementById('noteInput');
    const addBtn = document.getElementById('addNoteBtn');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editInput = document.getElementById('editNoteInput');

    // Evento Enter en input
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddNote();
            }
        });

        // Contador de caracteres
        input.addEventListener('input', () => {
            updateCharCounter('noteInput', 'charCounter');
        });
    }

    // Botón Agregar
    if (addBtn) {
        addBtn.addEventListener('click', handleAddNote);
    }

    // Edición
    if (editInput) {
        editInput.addEventListener('input', () => {
            updateCharCounter('editNoteInput', 'editCharCounter');
        });
    }

    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', handleSaveEdit);
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', closeEditModal);
    }

    // Cerrar modal con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeEditModal();
        }
    });

    // Cerrar modal clickeando fuera
    const editModal = document.getElementById('editModal');
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                closeEditModal();
            }
        });
    }

    // Cargar notas iniciales
    cargarYMostrarNotas();
}

// ===== ACTUALIZAR CONTADOR =====
function updateCharCounter(inputId, counterId) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(counterId);
    if (!input || !counter) return;
    
    const length = input.value.length;
    
    counter.textContent = `${length} / ${MAX_CARACTERES}`;
    
    if (length > MAX_CARACTERES) {
        counter.classList.add('exceeded');
    } else {
        counter.classList.remove('exceeded');
    }
}

// ===== ACTUALIZAR CONTADOR DE NOTAS =====
function updateNoteCounter(total) {
    const counter = document.getElementById('noteCounter');
    if (!counter) return;
    
    if (total === 0) {
        counter.style.display = 'none';
        return;
    }
    
    counter.style.display = 'inline-flex';
    counter.innerHTML = `
        <i class="fas fa-sticky-note" style="margin-right: 6px;"></i>
        <span class="number">${total}</span>
        ${total === 1 ? 'nota' : 'notas'}
    `;
}

// ===== MANEJAR AGREGAR NOTA =====
async function handleAddNote() {
    const input = document.getElementById('noteInput');
    if (!input) return;
    
    const texto = input.value.trim();
    
    if (!texto) {
        input.focus();
        input.style.borderColor = '#EF4444';
        setTimeout(() => {
            input.style.borderColor = '';
        }, 2000);
        return;
    }

    if (texto.length > MAX_CARACTERES) {
        alert(`El texto excede el límite de ${MAX_CARACTERES} caracteres`);
        return;
    }

    const addBtn = document.getElementById('addNoteBtn');
    if (addBtn) {
        addBtn.disabled = true;
        addBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agregando...';
    }

    const result = await crearNota(texto);

    if (result.success) {
        input.value = '';
        updateCharCounter('noteInput', 'charCounter');
        await cargarYMostrarNotas();
    } else {
        alert('❌ ' + (result.error || 'Error al crear nota'));
    }

    if (addBtn) {
        addBtn.disabled = false;
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Agregar';
    }
    input.focus();
}

// ===== CARGAR Y MOSTRAR NOTAS =====
async function cargarYMostrarNotas() {
    const notas = await cargarNotas();
    const container = document.getElementById('notesContainer');
    const emptyState = document.getElementById('emptyState');
    const grid = document.getElementById('notesGrid');

    if (!container) return;

    // Actualizar contador de notas
    updateNoteCounter(notas.length);

    if (notas.length === 0) {
        if (emptyState) emptyState.style.display = 'flex';
        if (grid) grid.style.display = 'none';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (grid) grid.style.display = 'grid';
    
    grid.innerHTML = notas.map(nota => `
        <div class="note-card" data-id="${nota.id_nota}">
            <div class="note-card-content">
                <div class="note-text">${escapeHtml(nota.texto)}</div>
                <div class="note-actions">
                    <button class="btn-icon btn-icon-edit" onclick="editarNotaHandler(${nota.id_nota}, '${escapeHtml(nota.texto)}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-icon btn-icon-delete" onclick="eliminarNotaHandler(${nota.id_nota})">
                        <i class="fas fa-trash-alt"></i> Eliminar
                    </button>
                </div>
            </div>
            <div class="note-meta">
                <span class="note-date"><i class="far fa-calendar-alt"></i> ${formatearFecha(nota.fecha_creacion)}</span>
                ${nota.fecha_actualizacion && nota.fecha_actualizacion !== nota.fecha_creacion ? 
                    `<span class="note-date-edit"><i class="fas fa-edit"></i> Editada ${formatearFecha(nota.fecha_actualizacion)}</span>` : 
                    ''
                }
            </div>
        </div>
    `).join('');
}

// ===== ESCAPE HTML =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== EDITAR NOTA =====
window.editarNotaHandler = function(idNota, texto) {
    notaEditandoId = idNota;
    const editInput = document.getElementById('editNoteInput');
    if (!editInput) return;
    
    editInput.value = texto;
    updateCharCounter('editNoteInput', 'editCharCounter');
    document.getElementById('editModal').classList.add('active');
    editInput.focus();
};

// ===== GUARDAR EDICIÓN =====
async function handleSaveEdit() {
    const editInput = document.getElementById('editNoteInput');
    if (!editInput) return;
    
    const texto = editInput.value.trim();
    
    if (!texto) {
        alert('El texto no puede estar vacío');
        return;
    }

    if (texto.length > MAX_CARACTERES) {
        alert(`El texto excede el límite de ${MAX_CARACTERES} caracteres`);
        return;
    }

    const result = await editarNota(notaEditandoId, texto);
    
    if (result.success) {
        closeEditModal();
        await cargarYMostrarNotas();
    } else {
        alert('❌ ' + (result.error || 'Error al editar nota'));
    }
}

// ===== CERRAR MODAL =====
function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    notaEditandoId = null;
}

// ===== ELIMINAR NOTA =====
window.eliminarNotaHandler = async function(idNota) {
    if (!confirm('¿Estás seguro de eliminar esta nota?')) return;
    
    const result = await eliminarNota(idNota);
    
    if (result.success) {
        await cargarYMostrarNotas();
    } else {
        alert('❌ ' + (result.error || 'Error al eliminar nota'));
    }
};

// ===== EXPONER FUNCIONES GLOBALES =====
window.editarNotaHandler = window.editarNotaHandler;
window.eliminarNotaHandler = window.eliminarNotaHandler;