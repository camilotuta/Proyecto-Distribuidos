import { useState, useEffect } from 'react';
import { createPuntoDeVenta, updatePuntoDeVenta, getPuntoDeVenta } from '../../services/PuntoDeVentaService';
import { getUbicaciones } from '../../services/ubicacionService';

export default function PuntoDeVentaForm({ puntoDeVentaId, onSave, onCancel }) {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [formData, setFormData] = useState({
    pvNombre: '',
    uId: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const loadUbicaciones = async () => {
    try {
      const res = await getUbicaciones();
      setUbicaciones(res.data);
    } catch {
      alert('Error al cargar ubicaciones');
    }
  };

  const loadPuntoDeVenta = async () => {
    try {
      const res = await getPuntoDeVenta(puntoDeVentaId);
      setFormData({
        pvNombre: res.data.pvNombre,
        uId: res.data.uId || ''
      });
    } catch {
      alert('Error al cargar punto de venta');
    }
  };

  useEffect(() => {
    loadUbicaciones();
    if (puntoDeVentaId) {
      loadPuntoDeVenta();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puntoDeVentaId]);

  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'pvNombre':
        if (!value.trim()) {
          error = 'El nombre del punto de venta es obligatorio';
        } else if (value.trim().length < 2) {
          error = 'El nombre debe tener al menos 2 caracteres';
        } else if (value.trim().length > 200) {
          error = 'El nombre no puede exceder 200 caracteres';
        }
        break;
      
      case 'uId':
        if (!value || value === '') {
          error = 'Debe seleccionar una ubicación';
        } else if (isNaN(value)) {
          error = 'La ubicación seleccionada no es válida';
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
      const payload = {
        pvNombre: formData.pvNombre.trim(),
        uId: parseInt(formData.uId)
      };
      
      if (puntoDeVentaId) {
        await updatePuntoDeVenta(puntoDeVentaId, payload);
      } else {
        await createPuntoDeVenta(payload);
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
      <h3>{puntoDeVentaId ? 'Editar' : 'Crear'} Punto de Venta</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Nombre: *</label>
          <input
            type="text"
            name="pvNombre"
            value={formData.pvNombre}
            onChange={handleChange}
            maxLength="200"
            required
            placeholder="Ej: Tienda Principal, Sucursal Norte"
            style={{ 
              width: '100%', 
              padding: '8px',
              borderColor: errors.pvNombre ? 'red' : '#ccc'
            }}
          />
          {errors.pvNombre && <span style={{ color: 'red', fontSize: '12px' }}>{errors.pvNombre}</span>}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Ubicación: *</label>
          <select
            name="uId"
            value={formData.uId}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '8px',
              borderColor: errors.uId ? 'red' : '#ccc'
            }}
          >
            <option value="">Seleccione una ubicación</option>
            {ubicaciones.map(u => (
              <option key={u.uId} value={u.uId}>
                {u.uNombre}
              </option>
            ))}
          </select>
          {errors.uId && <span style={{ color: 'red', fontSize: '12px' }}>{errors.uId}</span>}
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
