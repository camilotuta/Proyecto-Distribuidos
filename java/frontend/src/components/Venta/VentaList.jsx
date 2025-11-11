import { useState, useEffect } from 'react';
import { getVentas } from '../../services/ventaService';
import VentaForm from './VentaForm';

export default function VentaList() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadVentas();
  }, []);

  const loadVentas = async () => {
    try {
      const res = await getVentas();
      setVentas(res.data);
    } catch (error) {
      console.error('Error cargando ventas:', error);
      alert('Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    loadVentas();
  };

  const calcularTotal = (venta) => {
    if (!venta.detalles || venta.detalles.length === 0) return 0;
    return venta.detalles.reduce((total, detalle) => {
      return total + (detalle.producto?.pPrecio || 0) * detalle.vdCantidad;
    }, 0);
  };

  const formatFecha = (fechaString) => {
    if (!fechaString) return 'N/A';
    try {
      let fecha;
      
      // Intento 1: Si es un array [año, mes, día, hora, minuto, segundo]
      if (Array.isArray(fechaString)) {
        // LocalDateTime de Java puede venir como array
        const [year, month, day, hour = 0, minute = 0, second = 0] = fechaString;
        fecha = new Date(year, month - 1, day, hour, minute, second);
      } 
      // Intento 2: String en formato ISO
      else if (typeof fechaString === 'string') {
        // Si tiene formato yyyy-MM-ddTHH:mm:ss o similar
        fecha = new Date(fechaString);
      }
      // Intento 3: Ya es un objeto Date
      else if (fechaString instanceof Date) {
        fecha = fechaString;
      }
      // Intento 4: Timestamp numérico
      else if (typeof fechaString === 'number') {
        fecha = new Date(fechaString);
      }
      
      // Verificar si la fecha es válida
      if (!fecha || isNaN(fecha.getTime())) {
        console.warn('Fecha inválida recibida:', fechaString);
        return 'Fecha inválida';
      }
      
      return fecha.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error, fechaString);
      return 'Error en fecha';
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setShowForm(true)}>Nueva Venta</button>
      </div>

      {showForm && (
        <VentaForm
          onSave={handleFormClose}
          onCancel={handleFormClose}
        />
      )}

      <table border="1" width="100%" style={{ marginTop: '20px' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Punto de Venta</th>
            <th>Total</th>
            <th>Productos</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map(v => (
            <tr key={v.vId || v.id}>
              <td>{v.vId || v.id}</td>
              <td>{formatFecha(v.vFecha ?? v.fecha ?? v.V_FECHA ?? (v.id && v.id.vFecha))}</td>
              <td>
                {v.persona ? `${v.persona.pNombre} ${v.persona.pApellido}` : 'N/A'}
              </td>
              <td>{v.puntoDeVenta?.pvNombre || 'N/A'}</td>
              <td>${calcularTotal(v).toLocaleString()}</td>
              <td>
                {v.detalles && v.detalles.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {v.detalles.map((d, idx) => (
                      <li key={idx}>
                        {d.producto?.pNombre || 'Producto N/A'} x {d.vdCantidad}
                      </li>
                    ))}
                  </ul>
                ) : (
                  'Sin detalles'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {ventas.length === 0 && (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          No hay ventas registradas
        </p>
      )}
    </div>
  );
}
