import { useState, useEffect } from 'react';
import { getUbicaciones, deleteUbicacion } from '../../services/ubicacionService';
import UbicacionForm from './UbicacionForm';

export default function UbicacionList() {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadUbicaciones();
  }, []);

  const loadUbicaciones = async () => {
    try {
      const res = await getUbicaciones();
      setUbicaciones(res.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar ubicaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar esta ubicación?')) {
      try {
        await deleteUbicacion(id);
        loadUbicaciones();
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
    loadUbicaciones();
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setShowForm(true)}>Nueva Ubicación</button>
      </div>

      {showForm && (
        <UbicacionForm
          ubicacionId={editingId}
          onSave={handleFormClose}
          onCancel={handleFormClose}
        />
      )}

      <table border="1" width="100%" style={{ marginTop: '20px' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ubicaciones.map(u => (
            <tr key={u.uId}>
              <td>{u.uId}</td>
              <td>{u.uNombre}</td>
              <td>
                <button onClick={() => handleEdit(u.uId)} style={{ marginRight: '5px' }}>
                  Editar
                </button>
                <button onClick={() => handleDelete(u.uId)} style={{ color: 'red' }}>
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
