import { useState, useEffect } from 'react';
import { getPuntosDeVenta, deletePuntoDeVenta } from '../../services/PuntoDeVentaService';
import PuntoDeVentaForm from './PuntoDeVentaForm';

export default function PuntoDeVentaList() {
  const [puntosDeVenta, setPuntosDeVenta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadPuntosDeVenta();
  }, []);

  const loadPuntosDeVenta = async () => {
    try {
      const res = await getPuntosDeVenta();
      setPuntosDeVenta(res.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar puntos de venta');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este punto de venta?')) {
      try {
        await deletePuntoDeVenta(id);
        loadPuntosDeVenta();
      } catch (err) {
        alert('Error al eliminar: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleEdit = (id) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingId(null);
    loadPuntosDeVenta();
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setShowForm(true)}>Nuevo Punto de Venta</button>
      </div>

      {showForm && (
        <PuntoDeVentaForm
          puntoDeVentaId={editingId}
          onSave={handleFormClose}
          onCancel={handleFormClose}
        />
      )}

      <table border="1" width="100%" style={{ marginTop: '20px' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Ubicación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {puntosDeVenta.map(pv => (
            <tr key={pv.pvId}>
              <td>{pv.pvId}</td>
              <td>{pv.pvNombre}</td>
              <td>{pv.ubicacionNombre || 'N/A'}</td>
              <td>
                <button onClick={() => handleEdit(pv.pvId)} style={{ marginRight: '5px' }}>
                  Editar
                </button>
                <button onClick={() => handleDelete(pv.pvId)} style={{ color: 'red' }}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
