import { api } from './api.js';

let currentUser = null;

export function getCurrentUser() {
    const userData = localStorage.getItem('quicknotes_user');
    if (userData) {
        try {
            currentUser = JSON.parse(userData);
            return currentUser;
        } catch {
            return null;
        }
    }
    return null;
}

export function setCurrentUser(user) {
    currentUser = user;
    localStorage.setItem('quicknotes_user', JSON.stringify(user));
}

export function getToken() {
    const user = getCurrentUser();
    return user?.token || null;
}

export function logout() {
    currentUser = null;
    localStorage.removeItem('quicknotes_user');
    // Recargar la página para mostrar el estado de login
    window.location.reload();
}

export async function registerUser(nombre, correo, contraseña) {
    try {
        const result = await api.register(nombre, correo, contraseña);
        if (result.success) {
            setCurrentUser(result.data);
            return { success: true, user: result.data.usuario };
        }
        return { success: false, error: result.error };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function loginUser(correo, contraseña) {
    try {
        const result = await api.login(correo, contraseña);
        if (result.success) {
            setCurrentUser(result.data);
            return { success: true, user: result.data.usuario };
        }
        return { success: false, error: result.error };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        showLoginModal();
        return null;
    }
    return user;
}

// ===== FUNCIÓN PARA MOSTRAR MODAL DE LOGIN =====
function showLoginModal() {
    // Si ya existe un modal, no crear otro
    if (document.getElementById('loginModal')) return;

    const modal = document.createElement('div');
    modal.id = 'loginModal';
    modal.className = 'modal';
    modal.innerHTML = `
<div class="modal-content">

    <h2>
        <i class="fa-solid fa-right-to-bracket"></i>
        Iniciar Sesión
    </h2>

    <p style="color:#666; margin-bottom:20px;">
        Inicia sesión para administrar tus notas
    </p>

    <div id="loginAlert" class="alert" style="display:none;"></div>

    <form id="loginFormModal">

        <div class="form-group">
            <label for="loginEmail">
                <i class="fa-regular fa-envelope"></i>
                Correo
            </label>

            <input
                type="email"
                id="loginEmail"
                placeholder="tu@email.com"
                required
            >
        </div>

        <div class="form-group">
            <label for="loginPassword">
                <i class="fa-solid fa-lock"></i>
                Contraseña
            </label>

            <input
                type="password"
                id="loginPassword"
                placeholder="••••••••"
                required
            >
        </div>

        <button type="submit" class="btn btn-primary">
            <i class="fa-solid fa-right-to-bracket"></i>
            Iniciar Sesión
        </button>

    </form>

    <div style="text-align:center; margin-top:15px;">
        <a href="#" id="showRegisterLink">
            ¿No tienes cuenta? Regístrate
        </a>
    </div>

    <div
        id="registerFormContainer"
        style="display:none; margin-top:20px; padding-top:20px; border-top:1px solid #eee;"
    >

        <h3>
            <i class="fa-solid fa-user-plus"></i>
            Registrarse
        </h3>

        <form id="registerFormModal">

            <div class="form-group">
                <label for="registerName">
                    <i class="fa-regular fa-user"></i>
                    Nombre
                </label>

                <input
                    type="text"
                    id="registerName"
                    placeholder="Tu nombre"
                    required
                >
            </div>

            <div class="form-group">
                <label for="registerEmail">
                    <i class="fa-regular fa-envelope"></i>
                    Correo
                </label>

                <input
                    type="email"
                    id="registerEmail"
                    placeholder="tu@email.com"
                    required
                >
            </div>

            <div class="form-group">
                <label for="registerPassword">
                    <i class="fa-solid fa-lock"></i>
                    Contraseña
                </label>

                <input
                    type="password"
                    id="registerPassword"
                    placeholder="Mínimo 6 caracteres"
                    minlength="6"
                    required
                >
            </div>

            <button type="submit" class="btn btn-primary">
                <i class="fa-solid fa-user-plus"></i>
                Registrarse
            </button>

        </form>

    </div>

    <button
        id="closeLoginModal"
        class="btn btn-secondary"
        style="margin-top:10px;"
    >
        <i class="fa-solid fa-xmark"></i>
        Cerrar
    </button>

</div>
`;

    document.body.appendChild(modal);
    document.getElementById('loginModal').classList.add('active');

    // Eventos del modal
    document.getElementById('closeLoginModal').addEventListener('click', () => {
        document.getElementById('loginModal').classList.remove('active');
        setTimeout(() => document.getElementById('loginModal').remove(), 300);
    });

    // Mostrar registro
    document.getElementById('showRegisterLink').addEventListener('click', (e) => {
        e.preventDefault();
        const container = document.getElementById('registerFormContainer');
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
    });

    // Login
    document.getElementById('loginFormModal').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const alert = document.getElementById('loginAlert');

        alert.style.display = 'none';

        const result = await loginUser(email, password);

        if (result.success) {
            alert.className = 'alert alert-success';
            alert.textContent = '✅ ¡Inicio de sesión exitoso!';
            alert.style.display = 'block';
            setTimeout(() => {
                document.getElementById('loginModal').classList.remove('active');
                setTimeout(() => document.getElementById('loginModal').remove(), 300);
                window.location.reload();
            }, 1500);
        } else {
            alert.className = 'alert alert-error';
            alert.textContent = '❌ ' + (result.error || 'Error al iniciar sesión');
            alert.style.display = 'block';
        }
    });

    // Registro
    document.getElementById('registerFormModal').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const alert = document.getElementById('loginAlert');

        alert.style.display = 'none';

        if (password.length < 6) {
            alert.className = 'alert alert-error';
            alert.textContent = '❌ La contraseña debe tener al menos 6 caracteres';
            alert.style.display = 'block';
            return;
        }

        const result = await registerUser(nombre, email, password);

        if (result.success) {
            alert.className = 'alert alert-success';
            alert.textContent = '✅ ¡Registro exitoso!';
            alert.style.display = 'block';
            setTimeout(() => {
                document.getElementById('loginModal').classList.remove('active');
                setTimeout(() => document.getElementById('loginModal').remove(), 300);
                window.location.reload();
            }, 1500);
        } else {
            alert.className = 'alert alert-error';
            alert.textContent = '❌ ' + (result.error || 'Error al registrarse');
            alert.style.display = 'block';
        }
    });
}