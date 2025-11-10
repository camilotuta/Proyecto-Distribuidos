require('dotenv').config();
const { app, testConnection } = require('./src/app');

const PORT = process.env.PORT || 3000;

// Iniciar el servidor
const startServer = async () => {
    try {
        // Probar conexión a la base de datos
        await testConnection();
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('=================================');
            console.log(`🚀 Servidor Node.js corriendo`);
            console.log(`📡 Puerto: ${PORT}`);
            console.log(`🌍 URL: http://localhost:${PORT}`);
            console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
            console.log('=================================');
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();