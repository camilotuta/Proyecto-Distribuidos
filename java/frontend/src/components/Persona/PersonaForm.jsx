import { useState, useEffect } from 'react';
import { createPersona, updatePersona, getPersona } from '../../services/personaService';

export default function PersonaForm({ personaId, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    pNombre: '',
    pApellido: '',
    pEmail: '',
    pTelefono: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (personaId) {
      loadPersona();
    }
  }, [personaId]);

  const loadPersona = async () => {
    try {
      const res = await getPersona(personaId);
      setFormData({
        pNombre: res.data.pNombre,
        pApellido: res.data.pApellido,
        pEmail: res.data.pEmail,
        pTelefono: res.data.pTelefono || ''
      });
    } catch (err) {
      alert('Error al cargar persona');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (personaId) {
        await updatePersona(personaId, formData);
      } else {
        await createPersona(formData);
      }
      onSave();
    } catch (err) {
      alert('Error al guardar: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
      <h3>{personaId ? 'Editar' : 'Crear'} Persona</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Nombre:</label>
          <input
            type="text"
            name="pNombre"
            value={formData.pNombre}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Apellido:</label>
          <input
            type="text"
            name="pApellido"
            value={formData.pApellido}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input
            type="email"
            name="pEmail"
            value={formData.pEmail}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Teléfono:</label>
          <input
            type="text"
            name="pTelefono"
            value={formData.pTelefono}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div>
          <button type="submit" disabled={loading} style={{ marginRight: '10px' }}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}