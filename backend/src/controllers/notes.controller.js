import { supabase } from '../config/supabase.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// ===== VERIFICAR TOKEN =====
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
};

// ===== OBTENER USUARIO DE LA PETICIÓN =====
const getUserId = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    
    const decoded = verifyToken(token);
    return decoded ? decoded.id : null;
};

// ===== OBTENER TODAS LAS NOTAS =====
export const getNotes = async (req, res) => {
    try {
        const userId = getUserId(req);
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'No autorizado'
            });
        }

        const { data, error } = await supabase
            .from('nota')
            .select('*')
            .eq('id_usuario', userId)
            .order('fecha_actualizacion', { ascending: false });

        if (error) {
            console.error('Error al obtener notas:', error);
            return res.status(500).json({
                success: false,
                error: 'Error al obtener las notas'
            });
        }

        res.json({
            success: true,
            data: data || []
        });

    } catch (error) {
        console.error('Error en getNotes:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// ===== CREAR NOTA =====
export const createNote = async (req, res) => {
    try {
        const userId = getUserId(req);
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'No autorizado'
            });
        }

        const { texto } = req.body;

        if (!texto || texto.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'El texto no puede estar vacío'
            });
        }

        if (texto.length > 1000) {
            return res.status(400).json({
                success: false,
                error: 'El texto no puede exceder los 1000 caracteres'
            });
        }

        const { data, error } = await supabase
            .from('nota')
            .insert([
                {
                    texto: texto.trim(),
                    id_usuario: userId,
                    fecha_creacion: new Date().toISOString(),
                    fecha_actualizacion: new Date().toISOString()
                }
            ])
            .select('*');

        if (error) {
            console.error('Error al crear nota:', error);
            return res.status(500).json({
                success: false,
                error: 'Error al crear la nota'
            });
        }

        res.status(201).json({
            success: true,
            data: data[0]
        });

    } catch (error) {
        console.error('Error en createNote:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// ===== ACTUALIZAR NOTA =====
export const updateNote = async (req, res) => {
    try {
        const userId = getUserId(req);
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'No autorizado'
            });
        }

        const { id } = req.params;
        const { texto } = req.body;

        if (!texto || texto.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'El texto no puede estar vacío'
            });
        }

        if (texto.length > 1000) {
            return res.status(400).json({
                success: false,
                error: 'El texto no puede exceder los 1000 caracteres'
            });
        }

        // Verificar que la nota existe y pertenece al usuario
        const { data: existingNote } = await supabase
            .from('nota')
            .select('id_nota')
            .eq('id_nota', id)
            .eq('id_usuario', userId)
            .single();

        if (!existingNote) {
            return res.status(404).json({
                success: false,
                error: 'Nota no encontrada o no tienes permiso'
            });
        }

        // Actualizar nota
        const { data, error } = await supabase
            .from('nota')
            .update({
                texto: texto.trim(),
                fecha_actualizacion: new Date().toISOString()
            })
            .eq('id_nota', id)
            .eq('id_usuario', userId)
            .select('*');

        if (error) {
            console.error('Error al actualizar nota:', error);
            return res.status(500).json({
                success: false,
                error: 'Error al actualizar la nota'
            });
        }

        res.json({
            success: true,
            data: data[0]
        });

    } catch (error) {
        console.error('Error en updateNote:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// ===== ELIMINAR NOTA =====
export const deleteNote = async (req, res) => {
    try {
        const userId = getUserId(req);
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'No autorizado'
            });
        }

        const { id } = req.params;

        // Verificar que la nota existe y pertenece al usuario
        const { data: existingNote } = await supabase
            .from('nota')
            .select('id_nota')
            .eq('id_nota', id)
            .eq('id_usuario', userId)
            .single();

        if (!existingNote) {
            return res.status(404).json({
                success: false,
                error: 'Nota no encontrada o no tienes permiso'
            });
        }

        // Eliminar nota
        const { error } = await supabase
            .from('nota')
            .delete()
            .eq('id_nota', id)
            .eq('id_usuario', userId);

        if (error) {
            console.error('Error al eliminar nota:', error);
            return res.status(500).json({
                success: false,
                error: 'Error al eliminar la nota'
            });
        }

        res.json({
            success: true,
            message: 'Nota eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error en deleteNote:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};