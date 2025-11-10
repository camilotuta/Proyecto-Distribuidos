import { useState, useEffect } from 'react';
import { getPersonas, deletePersona } from '../../services/personaService';
import PersonaForm from './PersonaForm';

export default function PersonaList() {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      const res = await getPersonas();
      setPersonas(res.data);
    } catch (err) {
      alert('Error al cargar personas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar esta persona?')) {
      await deletePersona(id);
      loadPersonas();
    }
  };

  const handleEdit = (id) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingId(null);
    loadPersonas();
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setShowForm(true)}>Nueva Persona</button>
      </div>

      {showForm && (
        <PersonaForm
          personaId={editingId}
          onSave={handleFormClose}
          onCancel={handleFormClose}
        />
      )}

      <table border="1" width="100%" style={{ marginTop: '20px' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {personas.map(p => (
            <tr key={p.pId}>
              <td>{p.pId}</td>
              <td>{p.pNombre}</td>
              <td>{p.pApellido}</td>
              <td>{p.pEmail}</td>
              <td>{p.pTelefono}</td>
              <td>
                <button onClick={() => handleEdit(p.pId)} style={{ marginRight: '5px' }}>
                  Editar
                </button>
                <button onClick={() => handleDelete(p.pId)} style={{ color: 'red' }}>
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