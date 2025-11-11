import { useState, useEffect } from 'react';
import { createVenta } from '../../services/ventaService';
import { getPersonas } from '../../services/personaService';
import { getProductos } from '../../services/productoService';
import { getPuntosDeVenta } from '../../services/PuntoDeVentaService';

export default function VentaForm({ onSave, onCancel }) {
  const [personas, setPersonas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [puntosDeVenta, setPuntosDeVenta] = useState([]);
  const [formData, setFormData] = useState({
    pId: '',
    pvId: '',
    detalles: []
  });
  const [selectedProducto, setSelectedProducto] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [personasRes, productosRes, puntosRes] = await Promise.all([
        getPersonas(),
        getProductos(),
        getPuntosDeVenta()
      ]);
      setPersonas(personasRes.data);
      setProductos(productosRes.data);
      setPuntosDeVenta(puntosRes.data);
    } catch {
      alert('Error al cargar los datos necesarios');
    }
  };

  const handleAddDetalle = () => {
    // Validaciones
    if (!selectedProducto) {
      alert('Debe seleccionar un producto');
      return;
    }
    
    if (!cantidad || cantidad < 1) {
      alert('La cantidad debe ser al menos 1');
      return;
    }

    const producto = productos.find(p => p.pId === parseInt(selectedProducto));
    if (!producto) {
      alert('Producto no encontrado');
      return;
    }

    // Validar stock disponible
    const cantidadActual = formData.detalles
      .filter(d => d.pId === parseInt(selectedProducto))
      .reduce((sum, d) => sum + d.vdCantidad, 0);
    
    if (cantidadActual + cantidad > producto.pStock) {
      alert(`Stock insuficiente. Disponible: ${producto.pStock}, En carrito: ${cantidadActual}`);
      return;
    }

    const detalleExistente = formData.detalles.find(d => d.pId === parseInt(selectedProducto));
    
    if (detalleExistente) {
      // Actualizar cantidad si ya existe
      setFormData({
        ...formData,
        detalles: formData.detalles.map(d => 
          d.pId === parseInt(selectedProducto) 
            ? { ...d, vdCantidad: d.vdCantidad + cantidad }
            : d
        )
      });
    } else {
      // Agregar nuevo detalle
      setFormData({
        ...formData,
        detalles: [
          ...formData.detalles,
          {
            pId: parseInt(selectedProducto),
            vdCantidad: cantidad,
            productoNombre: producto.pNombre,
            productoPrecio: producto.pPrecio,
            stockDisponible: producto.pStock
          }
        ]
      });
    }

    setSelectedProducto('');
    setCantidad(1);
  };

  const handleRemoveDetalle = (pId) => {
    setFormData({
      ...formData,
      detalles: formData.detalles.filter(d => d.pId !== pId)
    });
  };

  const calcularTotal = () => {
    return formData.detalles.reduce((total, detalle) => {
      return total + (detalle.productoPrecio * detalle.vdCantidad);
    }, 0);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.pId) {
      newErrors.pId = 'Debe seleccionar un cliente';
    }
    
    if (!formData.pvId) {
      newErrors.pvId = 'Debe seleccionar un punto de venta';
    }
    
    if (formData.detalles.length === 0) {
      newErrors.detalles = 'Debe agregar al menos un producto a la venta';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        pId: parseInt(formData.pId),
        pvId: parseInt(formData.pvId),
        detalles: formData.detalles.map(d => ({
          pId: d.pId,
          vdCantidad: d.vdCantidad
        }))
      };
      
      await createVenta(payload);
      alert('Venta creada exitosamente');
      onSave();
    } catch (err) {
      alert('Error al guardar venta: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
      <h3>Crear Venta</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Cliente: *</label>
          <select
            value={formData.pId}
            onChange={(e) => {
              setFormData({ ...formData, pId: e.target.value });
              setErrors({ ...errors, pId: '' });
            }}
            required
            style={{ 
              width: '100%', 
              padding: '8px',
              borderColor: errors.pId ? 'red' : '#ccc'
            }}
          >
            <option value="">Seleccione un cliente</option>
            {personas.map(p => (
              <option key={p.pId} value={p.pId}>
                {p.pNombre} {p.pApellido} - {p.pEmail}
              </option>
            ))}
          </select>
          {errors.pId && <span style={{ color: 'red', fontSize: '12px' }}>{errors.pId}</span>}
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Punto de Venta: *</label>
          <select
            value={formData.pvId}
            onChange={(e) => {
              setFormData({ ...formData, pvId: e.target.value });
              setErrors({ ...errors, pvId: '' });
            }}
            required
            style={{ 
              width: '100%', 
              padding: '8px',
              borderColor: errors.pvId ? 'red' : '#ccc'
            }}
          >
            <option value="">Seleccione un punto de venta</option>
            {puntosDeVenta.map(pv => (
              <option key={pv.pvId} value={pv.pvId}>
                {pv.pvNombre} - {pv.ubicacionNombre || 'Sin ubicación'}
              </option>
            ))}
          </select>
          {errors.pvId && <span style={{ color: 'red', fontSize: '12px' }}>{errors.pvId}</span>}
        </div>

        <div style={{ 
          border: '1px solid #ddd', 
          padding: '15px', 
          marginBottom: '10px', 
          borderRadius: '5px',
          backgroundColor: '#f9f9f9'
        }}>
          <h4>Agregar Productos</h4>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: '2 1 200px', minWidth: '200px' }}>
              <label>Producto:</label>
              <select
                value={selectedProducto}
                onChange={(e) => setSelectedProducto(e.target.value)}
                style={{ width: '100%', padding: '8px' }}
              >
                <option value="">Seleccione un producto</option>
                {productos.map(p => (
                  <option key={p.pId} value={p.pId} disabled={p.pStock === 0}>
                    {p.pNombre} - ${p.pPrecio?.toLocaleString()} (Stock: {p.pStock})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: '1 1 100px', minWidth: '100px' }}>
              <label>Cantidad:</label>
              <input
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                min="1"
                max="9999"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                type="button" 
                onClick={handleAddDetalle} 
                style={{ padding: '8px 16px', cursor: 'pointer' }}
              >
                + Agregar
              </button>
            </div>
          </div>

          {errors.detalles && (
            <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>
              {errors.detalles}
            </div>
          )}

          {formData.detalles.length > 0 && (
            <div>
              <h4>Productos en la venta:</h4>
              <table border="1" width="100%" style={{ marginTop: '10px', backgroundColor: 'white' }}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio Unit.</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.detalles.map(d => (
                    <tr key={d.pId}>
                      <td>{d.productoNombre}</td>
                      <td>${d.productoPrecio?.toLocaleString()}</td>
                      <td>{d.vdCantidad}</td>
                      <td>${(d.productoPrecio * d.vdCantidad).toLocaleString()}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleRemoveDetalle(d.pId)}
                          style={{ color: 'red', cursor: 'pointer' }}
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                    <td colSpan="3" style={{ textAlign: 'right' }}>TOTAL:</td>
                    <td>${calcularTotal().toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              marginRight: '10px', 
              padding: '10px 20px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Guardando...' : 'Crear Venta'}
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            style={{ padding: '10px 20px', cursor: 'pointer' }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
