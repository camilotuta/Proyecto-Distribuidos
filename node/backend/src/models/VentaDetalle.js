const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VentaDetalle = sequelize.define('venta_detalle', {
    vdId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'vd_id'
    },
    vId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'v_id',
        references: {
            model: 'venta',
            key: 'v_id'
        }
    },
    pId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'p_id',
        references: {
            model: 'producto',
            key: 'p_id'
        }
    },
    vdCantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'vd_cantidad',
        validate: {
            min: 1
        }
    },
    vdPrecioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'vd_precio_unitario',
        validate: {
            min: 0
        }
    }
    // VD_SUBTOTAL es campo calculado, no lo incluimos
}, {
    tableName: 'venta_detalle',
    timestamps: false
});

module.exports = VentaDetalle;