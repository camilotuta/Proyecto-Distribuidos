const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ubicacion = sequelize.define('ubicacion', {
    uId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'u_id'
    },
    uNombre: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'u_nombre'
    }
}, {
    tableName: 'ubicacion',
    timestamps: false
});

module.exports = Ubicacion;