// ===== CONFIGURACIÓN =====
const API_URL = 'https://blog-de-notas-q5f3.onrender.com';

// ===== OBTENER TOKEN =====
function getToken() {
    const userData = localStorage.getItem('quicknotes_user');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            return user.token;
        } catch {
            return null;
        }
    }
    return null;
}

// ===== CLIENTE API =====
export const api = {
    // ===== AUTENTICACIÓN =====
    async register(nombre, correo, contraseña) {
        const response = await fetch(`${API_URL}/auth/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, correo, contraseña })
        });
        return response.json();
    },

    async login(correo, contraseña) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, contraseña })
        });
        return response.json();
    },

    // ===== NOTAS =====
    async getNotas() {
        const token = getToken();
        const response = await fetch(`${API_URL}/notes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    },

    async createNota(texto) {
        const token = getToken();
        const response = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ texto })
        });
        return response.json();
    },

    async updateNota(notaId, texto) {
        const token = getToken();
        const response = await fetch(`${API_URL}/notes/${notaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ texto })
        });
        return response.json();
    },

    async deleteNota(notaId) {
        const token = getToken();
        const response = await fetch(`${API_URL}/notes/${notaId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    }
};