const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Persona = sequelize.define('persona', {
    pId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'p_id'
    },
    pNombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'p_nombre'
    },
    pApellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'p_apellido'
    },
    pEmail: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        field: 'p_email'
    },
    pTelefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'p_telefono'
    }
}, {
    tableName: 'persona',
    timestamps: false
});

module.exports = Persona;