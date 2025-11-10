const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

// IMPORTAR TODAS LAS RUTAS
const personaRoutes = require('./routes/personaRoutes');
const productoRoutes = require('./routes/productoRoutes');
const ubicacionRoutes = require('./routes/ubicacionRoutes');
const puntoDeVentaRoutes = require('./routes/puntoDeVentaRoutes'); // ← AÑADIDA
const ventaRoutes = require('./routes/ventaRoutes');

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// RUTA RAÍZ
app.get('/', (req, res) => {
    res.json({
        mensaje: 'API Tienda - Backend Node.js',
        version: '1.0.0',
        endpoints: {
            personas: '/api/personas',
            productos: '/api/productos',
            ubicaciones: '/api/ubicaciones',
            'puntos-de-venta': '/api/puntos-de-venta', // ← AÑADIDO
            ventas: '/api/ventas'
        }
    });
});

// REGISTRAR RUTAS
app.use('/api/personas', personaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ubicaciones', ubicacionRoutes);
app.use('/api/puntos-de-venta', puntoDeVentaRoutes); // ← AQUÍ ESTABA FALTANDO
app.use('/api/ventas', ventaRoutes);

// MANEJO DE ERRORES
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Error interno del servidor',
        mensaje: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// RUTA NO ENCONTRADA
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.path
    });
});

// PROBAR CONEXIÓN A LA BASE DE DATOS
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a PostgreSQL establecida correctamente');
    } catch (error) {
        console.error('Error al conectar a PostgreSQL:', error.message);
        process.exit(1);
    }
};

module.exports = { app, testConnection };