import { api } from './api.js';
import { getCurrentUser } from './auth.js';

const MAX_CARACTERES = 1000;

// ===== VALIDAR TEXTO =====
export function validarTexto(texto) {
    if (!texto || texto.trim().length === 0) {
        return { valido: false, mensaje: 'El texto no puede estar vacío' };
    }
    if (texto.length > MAX_CARACTERES) {
        return { 
            valido: false, 
            mensaje: `El texto excede el límite de ${MAX_CARACTERES} caracteres (actual: ${texto.length})` 
        };
    }
    return { valido: true };
}

// ===== OBTENER TODAS LAS NOTAS =====
export async function cargarNotas() {
    try {
        const result = await api.getNotas();
        if (result.success) {
            return result.data || [];
        }
        return [];
    } catch (error) {
        console.error('Error al cargar notas:', error);
        return [];
    }
}

// ===== CREAR NOTA =====
export async function crearNota(texto) {
    const validacion = validarTexto(texto);
    if (!validacion.valido) {
        return { success: false, error: validacion.mensaje };
    }

    try {
        const result = await api.createNota(texto.trim());
        if (result.success) {
            return { success: true, nota: result.data };
        }
        return { success: false, error: result.error || 'Error al crear nota' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ===== EDITAR NOTA =====
export async function editarNota(notaId, texto) {
    const validacion = validarTexto(texto);
    if (!validacion.valido) {
        return { success: false, error: validacion.mensaje };
    }

    try {
        const result = await api.updateNota(notaId, texto.trim());
        if (result.success) {
            return { success: true, nota: result.data };
        }
        return { success: false, error: result.error || 'Error al editar nota' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ===== ELIMINAR NOTA =====
export async function eliminarNota(notaId) {
    try {
        const result = await api.deleteNota(notaId);
        if (result.success) {
            return { success: true };
        }
        return { success: false, error: result.error || 'Error al eliminar nota' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ===== FORMATEAR FECHA =====
export function formatearFecha(fecha) {
    const date = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Hace un momento';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHoras < 24) return `Hace ${diffHoras} h`;
    if (diffDias === 1) return 'Ayer';
    if (diffDias < 7) return `Hace ${diffDias} días`;
    
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}