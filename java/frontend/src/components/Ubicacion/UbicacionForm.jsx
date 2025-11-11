import { useState, useEffect } from 'react';
import { createUbicacion, updateUbicacion } from '../../services/ubicacionService';
import api from '../../api/client';

export default function UbicacionForm({ ubicacionId, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    uNombre: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const loadUbicacion = async () => {
    try {
      const res = await api.get(`/ubicaciones/${ubicacionId}`);
      setFormData({
        uNombre: res.data.uNombre
      });
    } catch {
      alert('Error al cargar ubicación');
    }
  };

  useEffect(() => {
    if (ubicacionId) {
      loadUbicacion();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ubicacionId]);

  const validateField = (name, value) => {
    let error = '';
    
    if (name === 'uNombre') {
      if (!value.trim()) {
        error = 'El nombre de la ubicación es obligatorio';
      } else if (value.trim().length < 2) {
        error = 'El nombre debe tener al menos 2 caracteres';
      } else if (value.trim().length > 200) {
        error = 'El nombre no puede exceder 200 caracteres';
      } else if (!/^[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s,.-]+$/.test(value)) {
        error = 'El nombre solo puede contener letras, números, espacios y . , -';
      }
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Validar en tiempo real
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar todos los campos antes de enviar
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        uNombre: formData.uNombre.trim()
      };
      
      if (ubicacionId) {
        await updateUbicacion(ubicacionId, payload);
      } else {
        await createUbicacion(payload);
      }
      onSave();
    } catch (err) {
      alert('Error al guardar: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
      <h3>{ubicacionId ? 'Editar' : 'Crear'} Ubicación</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Nombre: *</label>
          <input
            type="text"
            name="uNombre"
            value={formData.uNombre}
            onChange={handleChange}
            maxLength="200"
            required
            placeholder="Ej: Bogotá - Centro, Medellín - Norte"
            style={{ 
              width: '100%', 
              padding: '8px',
              borderColor: errors.uNombre ? 'red' : '#ccc'
            }}
          />
          {errors.uNombre && <span style={{ color: 'red', fontSize: '12px' }}>{errors.uNombre}</span>}
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
