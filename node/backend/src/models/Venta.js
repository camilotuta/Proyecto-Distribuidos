const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Venta = sequelize.define('venta', {
    vId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'v_id'
    },
    vFecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'v_fecha'
    },
    pId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'p_id',
        references: {
            model: 'persona',
            key: 'p_id'
        }
    },
    pvId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'pv_id',
        references: {
            model: 'punto_de_venta',
            key: 'pv_id'
        }
    }
}, {
    tableName: 'venta',
    timestamps: false
});

module.exports = Venta;