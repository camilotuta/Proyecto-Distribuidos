import { useState, useEffect } from 'react';
import { createPersona, updatePersona, getPersona } from '../../services/personaService';

export default function PersonaForm({ personaId, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    pNombre: '',
    pApellido: '',
    pEmail: '',
    pTelefono: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const loadPersona = async () => {
    try {
      const res = await getPersona(personaId);
      setFormData({
        pNombre: res.data.pNombre,
        pApellido: res.data.pApellido,
        pEmail: res.data.pEmail,
        pTelefono: res.data.pTelefono || ''
      });
    } catch {
      alert('Error al cargar persona');
    }
  };

  useEffect(() => {
    if (personaId) {
      loadPersona();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personaId]);

  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'pNombre':
        if (!value.trim()) {
          error = 'El nombre es obligatorio';
        } else if (value.trim().length < 2) {
          error = 'El nombre debe tener al menos 2 caracteres';
        } else if (value.trim().length > 100) {
          error = 'El nombre no puede exceder 100 caracteres';
        } else if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(value)) {
          error = 'El nombre solo puede contener letras';
        }
        break;
      
      case 'pApellido':
        if (!value.trim()) {
          error = 'El apellido es obligatorio';
        } else if (value.trim().length < 2) {
          error = 'El apellido debe tener al menos 2 caracteres';
        } else if (value.trim().length > 100) {
          error = 'El apellido no puede exceder 100 caracteres';
        } else if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(value)) {
          error = 'El apellido solo puede contener letras';
        }
        break;
      
      case 'pEmail':
        if (!value.trim()) {
          error = 'El email es obligatorio';
        } else if (value.length > 150) {
          error = 'El email no puede exceder 150 caracteres';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Email inválido (ejemplo: usuario@dominio.com)';
        }
        break;
      
      case 'pTelefono':
        if (value && value.length > 20) {
          error = 'El teléfono no puede exceder 20 caracteres';
        } else if (value && !/^[\d\s\-+()]+$/.test(value)) {
          error = 'Formato de teléfono inválido (solo números, espacios, +, -, (), )';
        }
        break;
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
          <label>Nombre: *</label>
          <input
            type="text"
            name="pNombre"
            value={formData.pNombre}
            onChange={handleChange}
            maxLength="100"
            required
            style={{ 
              width: '100%', 
              padding: '8px',
              borderColor: errors.pNombre ? 'red' : '#ccc'
            }}
          />
          {errors.pNombre && <span style={{ color: 'red', fontSize: '12px' }}>{errors.pNombre}</span>}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Apellido: *</label>
          <input
            type="text"
            name="pApellido"
            value={formData.pApellido}
            onChange={handleChange}
            maxLength="100"
            required
            style={{ 
              width: '100%', 
              padding: '8px',
              borderColor: errors.pApellido ? 'red' : '#ccc'
            }}
          />
          {errors.pApellido && <span style={{ color: 'red', fontSize: '12px' }}>{errors.pApellido}</span>}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Email: *</label>
          <input
            type="email"
            name="pEmail"
            value={formData.pEmail}
            onChange={handleChange}
            maxLength="150"
            required
            style={{ 
              width: '100%', 
              padding: '8px',
              borderColor: errors.pEmail ? 'red' : '#ccc'
            }}
          />
          {errors.pEmail && <span style={{ color: 'red', fontSize: '12px' }}>{errors.pEmail}</span>}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Teléfono:</label>
          <input
            type="text"
            name="pTelefono"
            value={formData.pTelefono}
            onChange={handleChange}
            maxLength="20"
            placeholder="Ej: +57 300 1234567"
            style={{ 
              width: '100%', 
              padding: '8px',
              borderColor: errors.pTelefono ? 'red' : '#ccc'
            }}
          />
          {errors.pTelefono && <span style={{ color: 'red', fontSize: '12px' }}>{errors.pTelefono}</span>}
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