import { useState, useEffect } from 'react';
import { createProducto, updateProducto, getProducto } from '../../services/productoService';

export default function ProductoForm({ productoId, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    pNombre: '',
    pPrecio: '',
    pStock: '',
    pDescripcion: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const loadProducto = async () => {
    try {
      const res = await getProducto(productoId);
      setFormData({
        pNombre: res.data.pNombre,
        pPrecio: res.data.pPrecio,
        pStock: res.data.pStock,
        pDescripcion: res.data.pDescripcion || ''
      });
    } catch {
      alert('Error al cargar producto');
    }
  };

  useEffect(() => {
    if (productoId) {
      loadProducto();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productoId]);

  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'pNombre':
        if (!value.trim()) {
          error = 'El nombre del producto es obligatorio';
        } else if (value.trim().length < 2) {
          error = 'El nombre debe tener al menos 2 caracteres';
        } else if (value.trim().length > 200) {
          error = 'El nombre no puede exceder 200 caracteres';
        }
        break;
      
      case 'pPrecio':
        if (!value) {
          error = 'El precio es obligatorio';
        } else if (isNaN(value)) {
          error = 'El precio debe ser un número';
        } else if (parseFloat(value) < 0) {
          error = 'El precio no puede ser negativo';
        } else if (parseFloat(value) === 0) {
          error = 'El precio debe ser mayor a 0';
        } else if (parseFloat(value) > 999999999.99) {
          error = 'El precio máximo es 999,999,999.99';
        }
        break;
      
      case 'pStock':
        if (value === '') {
          error = 'El stock es obligatorio';
        } else if (isNaN(value)) {
          error = 'El stock debe ser un número entero';
        } else if (!Number.isInteger(parseFloat(value))) {
          error = 'El stock debe ser un número entero';
        } else if (parseInt(value) < 0) {
          error = 'El stock no puede ser negativo';
        } else if (parseInt(value) > 2147483647) {
          error = 'El stock máximo es 2,147,483,647';
        }
        break;
      
      case 'pDescripcion':
        if (value && value.length > 500) {
          error = 'La descripción no puede exceder 500 caracteres';
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
        pNombre: formData.pNombre.trim(),
        pPrecio: parseFloat(formData.pPrecio),
        pStock: parseInt(formData.pStock),
        pDescripcion: formData.pDescripcion.trim() || null
      };
      
      if (productoId) {
        await updateProducto(productoId, payload);
      } else {
        await createProducto(payload);
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
      <h3>{productoId ? 'Editar' : 'Crear'} Producto</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Nombre: *</label>
          <input
            type="text"
            name="pNombre"
            value={formData.pNombre}
            onChange={handleChange}
            maxLength="200"
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
          <label>Precio: *</label>
          <input
            type="number"
            name="pPrecio"
            value={formData.pPrecio}
            onChange={handleChange}
            required
            step="0.01"
            min="0.01"
            placeholder="Ej: 99.99"
            style={{ 
              width: '100%', 
              padding: '8px',
              borderColor: errors.pPrecio ? 'red' : '#ccc'
            }}
          />
          {errors.pPrecio && <span style={{ color: 'red', fontSize: '12px' }}>{errors.pPrecio}</span>}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Stock: *</label>
          <input
            type="number"
            name="pStock"
            value={formData.pStock}
            onChange={handleChange}
            required
            min="0"
            step="1"
            placeholder="Ej: 100"
            style={{ 
              width: '100%', 
              padding: '8px',
              borderColor: errors.pStock ? 'red' : '#ccc'
            }}
          />
          {errors.pStock && <span style={{ color: 'red', fontSize: '12px' }}>{errors.pStock}</span>}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Descripción:</label>
          <textarea
            name="pDescripcion"
            value={formData.pDescripcion}
            onChange={handleChange}
            maxLength="500"
            rows="3"
            placeholder="Descripción opcional del producto"
            style={{ 
              width: '100%', 
              padding: '8px',
              borderColor: errors.pDescripcion ? 'red' : '#ccc'
            }}
          />
          {errors.pDescripcion && <span style={{ color: 'red', fontSize: '12px' }}>{errors.pDescripcion}</span>}
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
