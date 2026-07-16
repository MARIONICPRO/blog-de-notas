import app from './src/app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📝 API en http://localhost:${PORT}/api`);
});

console.log('✅ Backend de Quick Notes iniciado');