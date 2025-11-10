// models/index.js
const sequelize = require("../config/database");
const Persona = require("./Persona");
const Producto = require("./Producto");
const Ubicacion = require("./Ubicacion");
const PuntoDeVenta = require("./PuntoDeVenta");
const Venta = require("./Venta");
const VentaDetalle = require("./VentaDetalle");

// RELACIONES
Ubicacion.hasMany(PuntoDeVenta, { foreignKey: "uId", as: "puntosDeVenta" });
PuntoDeVenta.belongsTo(Ubicacion, { foreignKey: "uId", as: "ubicacion" });

Persona.hasMany(Venta, { foreignKey: "pId", as: "ventas" });
Venta.belongsTo(Persona, { foreignKey: "pId", as: "persona" });

PuntoDeVenta.hasMany(Venta, { foreignKey: "pvId", as: "ventas" });
Venta.belongsTo(PuntoDeVenta, { foreignKey: "pvId", as: "puntoDeVenta" });

Venta.hasMany(VentaDetalle, { foreignKey: "vId", as: "detalles" });
VentaDetalle.belongsTo(Venta, { foreignKey: "vId", as: "venta" });

Producto.hasMany(VentaDetalle, { foreignKey: "pId", as: "ventasDetalle" });
VentaDetalle.belongsTo(Producto, { foreignKey: "pId", as: "producto" });

module.exports = {
  sequelize,
  Persona,
  Producto,
  Ubicacion,
  PuntoDeVenta,
  Venta,
  VentaDetalle,
};
