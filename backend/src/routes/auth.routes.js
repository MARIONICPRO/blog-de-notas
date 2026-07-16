import express from 'express';
import { register, login } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/registro', register);
router.post('/login', login);

export default router;