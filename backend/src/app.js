import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import notesRoutes from './routes/notes.routes.js';

dotenv.config();

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Quick Notes API funcionando',
        timestamp: new Date().toISOString()
    });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada'
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
    });
});

export default app;