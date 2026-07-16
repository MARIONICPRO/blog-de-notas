import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// ===== REGISTRO =====
export const register = async (req, res) => {
    try {
        const { nombre, correo, contraseña } = req.body;

        // Validaciones básicas
        if (!nombre || !correo || !contraseña) {
            return res.status(400).json({
                success: false,
                error: 'Todos los campos son requeridos'
            });
        }

        if (contraseña.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // Verificar si el email ya existe
        const { data: existingUser } = await supabase
            .from('usuario')
            .select('id_usuario')
            .eq('correo', correo)
            .single();

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'El email ya está registrado'
            });
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contraseña, salt);

        // Crear usuario
        const { data, error } = await supabase
            .from('usuario')
            .insert([
                {
                    nombre: nombre.trim(),
                    correo: correo.toLowerCase().trim(),
                    contraseña: hashedPassword
                }
            ])
            .select('id_usuario, nombre, correo');

        if (error) {
            console.error('Error al crear usuario:', error);
            return res.status(500).json({
                success: false,
                error: 'Error al registrar usuario'
            });
        }

        // Generar JWT
        const token = jwt.sign(
            { 
                id: data[0].id_usuario,
                nombre: data[0].nombre,
                correo: data[0].correo
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            data: {
                usuario: data[0],
                token
            }
        });

    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// ===== LOGIN =====
export const login = async (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        if (!correo || !contraseña) {
            return res.status(400).json({
                success: false,
                error: 'Email y contraseña son requeridos'
            });
        }

        // Buscar usuario
        const { data: user, error } = await supabase
            .from('usuario')
            .select('id_usuario, nombre, correo, contraseña')
            .eq('correo', correo.toLowerCase().trim())
            .single();

        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        // Generar JWT
        const token = jwt.sign(
            {
                id: user.id_usuario,
                nombre: user.nombre,
                correo: user.correo
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        delete user.contraseña;

        res.json({
            success: true,
            data: {
                usuario: user,
                token
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};