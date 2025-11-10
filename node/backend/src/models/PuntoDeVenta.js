// models/PuntoDeVenta.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PuntoDeVenta = sequelize.define(
  "punto_de_venta",
  {
    pvId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "pv_id",
    },
    pvNombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: "pv_nombre",
    },
    uId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "u_id",
    },
  },
  {
    tableName: "punto_de_venta",
    timestamps: false,
  }
);

// ELIMINA ESTAS LÍNEAS
// PuntoDeVenta.belongsTo(...)
// Ubicacion.hasMany(...)

module.exports = PuntoDeVenta;
