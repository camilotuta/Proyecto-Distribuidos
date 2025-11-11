import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:3000/api";

const FIELD_LABELS = {
  pNombre: "Nombre",
  pApellido: "Apellido",
  pEmail: "Email",
  pPrecio: "Precio ($)",
  pStock: "Stock",
  uNombre: "Ubicación",
  pvNombre: "Nombre del Punto"
};

function App() {
  const [activeTab, setActiveTab] = useState("personas");
  const [data, setData] = useState({});
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [errors, setErrors] = useState({});
  const limit = 10;

  const entities = [
    { key: "personas", name: "Personas", id: "pId", fields: ["pNombre", "pApellido", "pEmail"] },
    { key: "productos", name: "Productos", id: "pId", fields: ["pNombre", "pPrecio", "pStock"] },
    { key: "ubicaciones", name: "Ubicaciones", id: "uId", fields: ["uNombre"] },
    { key: "puntos-de-venta", name: "Puntos de Venta", id: "pvId", fields: ["pvNombre"], select: { field: "uId", options: "ubicaciones", label: "uNombre" } },
    { key: "ventas", name: "Ventas", id: "vId", fields: [], venta: true }
  ];

  useEffect(() => {
    const loadAll = async () => {
      for (const e of entities) {
        try {
          const res = await axios.get(`${API}/${e.key}`);
          setData(prev => ({ ...prev, [e.key]: res.data }));
        } catch (err) {
          console.error(`Error cargando ${e.key}:`, err.response?.data || err.message);
        }
      }
    };
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadCurrent = async () => {
      try {
        const res = await axios.get(`${API}/${activeTab}`);
        setData(prev => ({ ...prev, [activeTab]: res.data }));
        setPage(1);
        setSearch("");
        setErrors({});
      } catch (err) {
        console.error(`Error recargando ${activeTab}:`, err.response?.data || err.message);
      }
    };
    loadCurrent();
  }, [activeTab]);

  // ========== VALIDACIONES ==========
  const validateField = (fieldName, value) => {
    if (!value || value.toString().trim() === "") {
      return "Este campo es obligatorio";
    }

    switch (fieldName) {
      // VALIDACIÓN DE NOMBRES (personas, productos, ubicaciones, puntos de venta)
      case "pNombre":
      case "pApellido":
      case "uNombre":
      case "pvNombre": {
        if (value.length < 2) {
          return "Debe tener al menos 2 caracteres";
        }
        if (value.length > 100) {
          return "No puede exceder 100 caracteres";
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value)) {
          return "Solo se permiten letras y espacios";
        }
        break;
      }

      // VALIDACIÓN DE EMAIL
      case "pEmail": {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Formato de email inválido (ej: usuario@dominio.com)";
        }
        if (value.length > 100) {
          return "El email no puede exceder 100 caracteres";
        }
        break;
      }

      // VALIDACIÓN DE PRECIO
      case "pPrecio": {
        const precio = parseFloat(value);
        if (isNaN(precio)) {
          return "Debe ser un número válido";
        }
        if (precio <= 0) {
          return "El precio debe ser mayor a 0";
        }
        if (precio > 999999999) {
          return "El precio es demasiado alto";
        }
        if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          return "Formato inválido (máximo 2 decimales)";
        }
        break;
      }

      // VALIDACIÓN DE STOCK
      case "pStock": {
        const stock = parseInt(value);
        if (isNaN(stock)) {
          return "Debe ser un número entero";
        }
        if (stock < 0) {
          return "El stock no puede ser negativo";
        }
        if (stock > 999999) {
          return "El stock es demasiado alto";
        }
        if (!/^\d+$/.test(value)) {
          return "Debe ser un número entero sin decimales";
        }
        break;
      }

      // VALIDACIÓN DE SELECTS (ubicación para puntos de venta)
      case "uId":
        if (!value || value === "") {
          return "Debe seleccionar una ubicación";
        }
        break;

      // VALIDACIÓN DE VENTAS
      case "pId":
        if (activeTab === "ventas" && (!value || value === "")) {
          return "Debe seleccionar un cliente";
        }
        break;

      case "pvId":
        if (activeTab === "ventas" && (!value || value === "")) {
          return "Debe seleccionar un punto de venta";
        }
        break;

      default:
        break;
    }

    return null;
  };

  const validateForm = (formData, entityKey) => {
    const newErrors = {};
    const entity = entities.find(e => e.key === entityKey);

    // Validar campos normales
    entity.fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Validar select (ubicación para puntos de venta)
    if (entity.select && entityKey === "puntos-de-venta") {
      const error = validateField("uId", formData.uId);
      if (error) {
        newErrors.uId = error;
      }
    }

    // Validar ventas
    if (entity.venta) {
      const pIdError = validateField("pId", formData.pId);
      if (pIdError) newErrors.pId = pIdError;

      const pvIdError = validateField("pvId", formData.pvId);
      if (pvIdError) newErrors.pvId = pvIdError;

      if (!formData.detalles || formData.detalles.length === 0) {
        newErrors.detalles = "Debe agregar al menos un producto";
      } else {
        // Validar cada detalle
        formData.detalles.forEach((detalle, index) => {
          if (!detalle.pId || detalle.pId === "") {
            newErrors[`detalle_${index}_pId`] = "Seleccione un producto";
          }
          if (!detalle.vdCantidad || detalle.vdCantidad <= 0) {
            newErrors[`detalle_${index}_cantidad`] = "La cantidad debe ser mayor a 0";
          }

          // Validar stock disponible
          const producto = (data.productos || []).find(p => p.pId == detalle.pId);
          if (producto && detalle.vdCantidad > producto.pStock) {
            newErrors[`detalle_${index}_cantidad`] = `Stock insuficiente (disponible: ${producto.pStock})`;
          }
        });
      }
    }

    return newErrors;
  };

  const handleFieldChange = (fieldName, value) => {
    setForm({ ...form, [fieldName]: value });
    
    // Validar el campo en tiempo real
    const error = validateField(fieldName, value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ent = activeTab;
    const entity = entities.find(x => x.key === ent);
    const id = form[entity.id];

    // Validar formulario completo
    const validationErrors = validateForm(form, ent);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert("Por favor corrige los errores en el formulario antes de continuar");
      return;
    }

    try {
      if (id) {
        await axios.put(`${API}/${ent}/${id}`, form);
      } else {
        await axios.post(`${API}/${ent}`, form);
      }
      setForm({});
      setErrors({});
      const res = await axios.get(`${API}/${ent}`);
      setData(prev => ({ ...prev, [ent]: res.data }));
      alert("¡Operación exitosa!");
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const eliminar = async (ent, id) => {
    if (!confirm("¿Eliminar?")) return;
    try {
      await axios.delete(`${API}/${ent}/${id}`);
      const res = await axios.get(`${API}/${ent}`);
      setData(prev => ({ ...prev, [ent]: res.data }));
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const getFiltered = () => {
    const items = data[activeTab] || [];
    return items.filter(item =>
      Object.values(item).some(v =>
        v && v.toString().toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  const getPaginated = () => {
    const filtered = getFiltered();
    return filtered.slice((page - 1) * limit, page * limit);
  };

  const totalPages = Math.ceil(getFiltered().length / limit);
  const entity = entities.find(e => e.key === activeTab);
  const getLabel = (field) => FIELD_LABELS[field] || field;

  return (
    <div className="app-container">
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <header className="app-header">
          <h1 className="app-title">Sistema de Ventas</h1>
          <p className="app-subtitle">Backend: Node.js + Express | Frontend: React + Vite</p>
        </header>

        <div className="tabs-container">
          {entities.map(e => (
            <button
              key={e.key}
              onClick={() => { setActiveTab(e.key); setForm({}); setErrors({}); }}
              className={`tab-button ${activeTab === e.key ? 'active' : 'inactive'}`}
            >
              {e.name}
            </button>
          ))}
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="🔎 Buscar en registros..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="search-input"
          />
        </div>

        <div className="card">
          <h2 className="card-title">
            {form[entity.id] ? "Editar" : "Crear"} {entity.name.slice(0, -1)}
          </h2>

          <form onSubmit={handleSubmit} className="form-grid">
            {entity.fields.map(f => (
              <div key={f} className="form-group">
                <label className="form-label">
                  {getLabel(f)}
                </label>
                <input
                  type={f === "pPrecio" || f === "pStock" ? "number" : "text"}
                  step={f === "pPrecio" ? "0.01" : undefined}
                  value={form[f] || ""}
                  onChange={e => handleFieldChange(f, e.target.value)}
                  className={`form-input ${errors[f] ? 'error' : ''}`}
                  required={f !== "pEmail"}
                />
                {errors[f] && (
                  <span className="error-message">
                    ⚠ {errors[f]}
                  </span>
                )}
              </div>
            ))}

            {entity.select && (
              <div className="form-group">
                <label className="form-label">
                  Ubicación
                </label>
                <select
                  value={form.uId || ""}
                  onChange={e => handleFieldChange("uId", e.target.value)}
                  className={`form-select ${errors.uId ? 'error' : ''}`}
                  required
                >
                  <option value="">Seleccionar Ubicación</option>
                  {(data.ubicaciones || []).map(u => (
                    <option key={u.uId} value={u.uId}>
                      {u.uNombre}
                    </option>
                  ))}
                </select>
                {errors.uId && (
                  <span className="error-message">
                    ⚠ {errors.uId}
                  </span>
                )}
              </div>
            )}

            {entity.venta && (
              <>
                <div className="form-group">
                  <label className="form-label">Cliente</label>
                  <select
                    value={form.pId || ""}
                    onChange={e => handleFieldChange("pId", e.target.value)}
                    className={`form-select ${errors.pId ? 'error' : ''}`}
                    required
                  >
                    <option value="">Seleccionar Cliente</option>
                    {(data.personas || []).map(p => (
                      <option key={p.pId} value={p.pId}>{p.pNombre} {p.pApellido}</option>
                    ))}
                  </select>
                  {errors.pId && (
                    <span className="error-message">
                      ⚠ {errors.pId}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Punto de Venta</label>
                  <select
                    value={form.pvId || ""}
                    onChange={e => handleFieldChange("pvId", e.target.value)}
                    className={`form-select ${errors.pvId ? 'error' : ''}`}
                    required
                  >
                    <option value="">Seleccionar Punto</option>
                    {(data["puntos-de-venta"] || []).map(pv => (
                      <option key={pv.pvId} value={pv.pvId}>
                        {pv.pvNombre} ({pv.ubicacion?.uNombre || "Sin ubicación"})
                      </option>
                    ))}
                  </select>
                  {errors.pvId && (
                    <span className="error-message">
                      ⚠ {errors.pvId}
                    </span>
                  )}
                </div>

                <div style={{ gridColumn: "1 / -1", marginTop: "20px" }}>
                  <label className="form-label">
                    Productos
                  </label>
                  {errors.detalles && (
                    <span className="error-message" style={{ marginBottom: "12px" }}>
                      ⚠ {errors.detalles}
                    </span>
                  )}
                  {(form.detalles || []).map((d, i) => (
                    <div key={i} style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                          <select
                            value={d.pId || ""}
                            onChange={e => {
                              const newDetalles = [...(form.detalles || [])];
                              newDetalles[i].pId = e.target.value;
                              setForm({ ...form, detalles: newDetalles });
                              
                              const newErrors = { ...errors };
                              delete newErrors[`detalle_${i}_pId`];
                              delete newErrors.detalles;
                              setErrors(newErrors);
                            }}
                            className={`form-select ${errors[`detalle_${i}_pId`] ? 'error' : ''}`}
                          >
                            <option value="">Seleccionar Producto</option>
                            {(data.productos || []).map(p => (
                              <option key={p.pId} value={p.pId}>{p.pNombre} - ${p.pPrecio} (Stock: {p.pStock})</option>
                            ))}
                          </select>
                          {errors[`detalle_${i}_pId`] && (
                            <span className="error-message">
                              ⚠ {errors[`detalle_${i}_pId`]}
                            </span>
                          )}
                        </div>
                        <div style={{ width: "120px" }}>
                          <input
                            type="number"
                            min="1"
                            placeholder="Cant."
                            value={d.vdCantidad || ""}
                            onChange={e => {
                              const newDetalles = [...(form.detalles || [])];
                              newDetalles[i].vdCantidad = parseInt(e.target.value) || 1;
                              setForm({ ...form, detalles: newDetalles });
                              
                              const newErrors = { ...errors };
                              delete newErrors[`detalle_${i}_cantidad`];
                              setErrors(newErrors);
                            }}
                            className={`form-input ${errors[`detalle_${i}_cantidad`] ? 'error' : ''}`}
                          />
                          {errors[`detalle_${i}_cantidad`] && (
                            <span className="error-message" style={{ fontSize: "0.8rem" }}>
                              ⚠ {errors[`detalle_${i}_cantidad`]}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newDetalles = (form.detalles || []).filter((_, idx) => idx !== i);
                            setForm({ ...form, detalles: newDetalles });
                            
                            const newErrors = { ...errors };
                            delete newErrors[`detalle_${i}_pId`];
                            delete newErrors[`detalle_${i}_cantidad`];
                            if (newDetalles.length > 0) {
                              delete newErrors.detalles;
                            }
                            setErrors(newErrors);
                          }}
                          className="btn btn-danger"
                          style={{ minWidth: "50px", padding: "16px" }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, detalles: [...(form.detalles || []), { pId: "", vdCantidad: 1 }] });
                      const newErrors = { ...errors };
                      delete newErrors.detalles;
                      setErrors(newErrors);
                    }}
                    className="btn btn-secondary"
                  >
                    + Agregar Producto
                  </button>
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                gridColumn: entity.venta ? "1 / -1" : "auto",
                marginTop: "20px"
              }}
            >
              {form[entity.id] ? "✓ Actualizar" : "✓ Crear"}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="card-title">
            Lista de {entity.name}
          </h2>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  {entity.fields.map(f => (
                    <th key={f}>
                      {getLabel(f)}
                    </th>
                  ))}
                  {entity.select && (
                    <th>
                      Ubicación
                    </th>
                  )}
                  {entity.venta && (
                    <th>
                      Cliente / Punto de Venta
                    </th>
                  )}
                  <th>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {getPaginated().length > 0 ? (
                  getPaginated().map(item => (
                    <tr key={item[entity.id]}>
                      <td className="table-id">{item[entity.id]}</td>
                      {entity.fields.map(f => (
                        <td key={f}>
                          {item[f] || "-"}
                        </td>
                      ))}
                      {entity.select && (
                        <td>
                          {item.ubicacion?.uNombre || "Sin ubicación"}
                        </td>
                      )}
                      {entity.venta && (
                        <td>
                          <div style={{ fontWeight: "700" }}>
                            {data.personas?.find(p => p.pId === item.pId)?.pNombre || "—"} {data.personas?.find(p => p.pId === item.pId)?.pApellido || ""}
                          </div>
                          <div style={{ fontSize: "0.9em", color: "#60a5fa", marginTop: "4px" }}>
                            {data["puntos-de-venta"]?.find(pv => pv.pvId === item.pvId)?.pvNombre || "—"}
                          </div>
                        </td>
                      )}
                      <td>
                        <button
                          onClick={() => { setForm(item); setErrors({}); }}
                          className="btn btn-edit"
                          style={{ marginRight: "12px" }}
                        >
                          ✎ Editar
                        </button>
                        <button
                          onClick={() => eliminar(activeTab, item[entity.id])}
                          className="btn btn-danger"
                        >
                          ✕ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="empty-state">
                      No hay registros para mostrar
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary"
                style={{ opacity: page === 1 ? 0.5 : 1 }}
              >
                ← Anterior
              </button>
              <span className="pagination-info">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-secondary"
                style={{ opacity: page === totalPages ? 0.5 : 1 }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
