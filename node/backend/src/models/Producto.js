const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('producto', {
    pId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'p_id'
    },
    pNombre: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'p_nombre'
    },
    pDescripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'p_descripcion'
    },
    pPrecio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'p_precio',
        validate: {
            min: 0
        }
    },
    pStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'p_stock',
        validate: {
            min: 0
        }
    }
}, {
    tableName: 'producto',
    timestamps: false
});

module.exports = Producto;