import { useState, useEffect } from "react";
import axios from "axios";

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
  }, []);

  useEffect(() => {
    const loadCurrent = async () => {
      try {
        const res = await axios.get(`${API}/${activeTab}`);
        setData(prev => ({ ...prev, [activeTab]: res.data }));
        setPage(1);
        setSearch("");
      } catch (err) {
        console.error(`Error recargando ${activeTab}:`, err.response?.data || err.message);
      }
    };
    loadCurrent();
  }, [activeTab]);

  // ========== VALIDACIONES ==========
  const validateField = (fieldName, value, allFormData = {}) => {
    if (!value || value.toString().trim() === "") {
      return "Este campo es obligatorio";
    }

    switch (fieldName) {
      // VALIDACIÓN DE NOMBRES (personas, productos, ubicaciones, puntos de venta)
      case "pNombre":
      case "pApellido":
      case "uNombre":
      case "pvNombre":
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

      // VALIDACIÓN DE EMAIL
      case "pEmail":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Formato de email inválido (ej: usuario@dominio.com)";
        }
        if (value.length > 100) {
          return "El email no puede exceder 100 caracteres";
        }
        break;

      // VALIDACIÓN DE PRECIO
      case "pPrecio":
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

      // VALIDACIÓN DE STOCK
      case "pStock":
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
      const error = validateField(field, formData[field], formData);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Validar select (ubicación para puntos de venta)
    if (entity.select && entityKey === "puntos-de-venta") {
      const error = validateField("uId", formData.uId, formData);
      if (error) {
        newErrors.uId = error;
      }
    }

    // Validar ventas
    if (entity.venta) {
      const pIdError = validateField("pId", formData.pId, formData);
      if (pIdError) newErrors.pId = pIdError;

      const pvIdError = validateField("pvId", formData.pvId, formData);
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
    const error = validateField(fieldName, value, { ...form, [fieldName]: value });
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
    <div style={{ padding: "20px", fontFamily: "Arial", background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ color: "#4f46e5", textAlign: "center", marginBottom: "24px", fontSize: "2rem" }}>
          Sistema de Ventas - 100% FUNCIONAL
        </h1>

        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap", justifyContent: "center" }}>
          {entities.map(e => (
            <button
              key={e.key}
              onClick={() => { setActiveTab(e.key); setForm({}); }}
              style={{
                padding: "10px 16px",
                background: activeTab === e.key ? "#4f46e5" : "#e5e7eb",
                color: activeTab === e.key ? "white" : "#1f2937",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {e.name}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "1rem"
          }}
        />

        <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: "24px" }}>
          <h2 style={{ color: "#4f46e5", marginBottom: "16px" }}>{entity.name}</h2>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            {entity.fields.map(f => (
              <div key={f}>
                <input
                  placeholder={getLabel(f)}
                  type={f === "pPrecio" || f === "pStock" ? "number" : "text"}
                  step={f === "pPrecio" ? "0.01" : undefined}
                  value={form[f] || ""}
                  onChange={e => handleFieldChange(f, e.target.value)}
                  style={{ 
                    padding: "10px", 
                    borderRadius: "8px", 
                    border: errors[f] ? "2px solid #ef4444" : "1px solid #d1d5db",
                    width: "100%"
                  }}
                  required={f !== "pEmail"}
                />
                {errors[f] && (
                  <span style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "4px", display: "block" }}>
                    {errors[f]}
                  </span>
                )}
              </div>
            ))}

            {entity.select && (
              <div>
                <select
                  value={form.uId || ""}
                  onChange={e => handleFieldChange("uId", e.target.value)}
                  style={{ 
                    padding: "10px", 
                    borderRadius: "8px", 
                    border: errors.uId ? "2px solid #ef4444" : "1px solid #d1d5db",
                    width: "100%"
                  }}
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
                  <span style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "4px", display: "block" }}>
                    {errors.uId}
                  </span>
                )}
              </div>
            )}

            {entity.venta && (
              <>
                <div>
                  <select
                    value={form.pId || ""}
                    onChange={e => handleFieldChange("pId", e.target.value)}
                    style={{ 
                      padding: "10px", 
                      borderRadius: "8px", 
                      border: errors.pId ? "2px solid #ef4444" : "1px solid #d1d5db",
                      width: "100%"
                    }}
                    required
                  >
                    <option value="">Cliente</option>
                    {(data.personas || []).map(p => (
                      <option key={p.pId} value={p.pId}>{p.pNombre} {p.pApellido}</option>
                    ))}
                  </select>
                  {errors.pId && (
                    <span style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "4px", display: "block" }}>
                      {errors.pId}
                    </span>
                  )}
                </div>

                <div>
                  <select
                    value={form.pvId || ""}
                    onChange={e => handleFieldChange("pvId", e.target.value)}
                    style={{ 
                      padding: "10px", 
                      borderRadius: "8px", 
                      border: errors.pvId ? "2px solid #ef4444" : "1px solid #d1d5db",
                      width: "100%"
                    }}
                    required
                  >
                    <option value="">Punto de Venta</option>
                    {(data["puntos-de-venta"] || []).map(pv => (
                      <option key={pv.pvId} value={pv.pvId}>
                        {pv.pvNombre} ({pv.ubicacion?.uNombre || "Sin ubicación"})
                      </option>
                    ))}
                  </select>
                  {errors.pvId && (
                    <span style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "4px", display: "block" }}>
                      {errors.pvId}
                    </span>
                  )}
                </div>

                <div style={{ gridColumn: "1 / -1", marginTop: "16px" }}>
                  <h4 style={{ marginBottom: "8px" }}>Productos</h4>
                  {errors.detalles && (
                    <span style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "8px", display: "block" }}>
                      {errors.detalles}
                    </span>
                  )}
                  {(form.detalles || []).map((d, i) => (
                    <div key={i} style={{ marginBottom: "12px" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                          <select
                            value={d.pId || ""}
                            onChange={e => {
                              const newDetalles = [...(form.detalles || [])];
                              newDetalles[i].pId = e.target.value;
                              setForm({ ...form, detalles: newDetalles });
                              
                              // Limpiar error
                              const newErrors = { ...errors };
                              delete newErrors[`detalle_${i}_pId`];
                              setErrors(newErrors);
                            }}
                            style={{ 
                              width: "100%",
                              padding: "8px", 
                              borderRadius: "6px", 
                              border: errors[`detalle_${i}_pId`] ? "2px solid #ef4444" : "1px solid #d1d5db" 
                            }}
                          >
                            <option value="">Producto</option>
                            {(data.productos || []).map(p => (
                              <option key={p.pId} value={p.pId}>{p.pNombre} - ${p.pPrecio} (Stock: {p.pStock})</option>
                            ))}
                          </select>
                          {errors[`detalle_${i}_pId`] && (
                            <span style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "4px", display: "block" }}>
                              {errors[`detalle_${i}_pId`]}
                            </span>
                          )}
                        </div>
                        <div style={{ width: "100px" }}>
                          <input
                            type="number"
                            min="1"
                            placeholder="Cant."
                            value={d.vdCantidad || ""}
                            onChange={e => {
                              const newDetalles = [...(form.detalles || [])];
                              newDetalles[i].vdCantidad = parseInt(e.target.value) || 1;
                              setForm({ ...form, detalles: newDetalles });
                              
                              // Limpiar error
                              const newErrors = { ...errors };
                              delete newErrors[`detalle_${i}_cantidad`];
                              setErrors(newErrors);
                            }}
                            style={{ 
                              width: "100%",
                              padding: "8px", 
                              borderRadius: "6px", 
                              border: errors[`detalle_${i}_cantidad`] ? "2px solid #ef4444" : "1px solid #d1d5db" 
                            }}
                          />
                          {errors[`detalle_${i}_cantidad`] && (
                            <span style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>
                              {errors[`detalle_${i}_cantidad`]}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newDetalles = (form.detalles || []).filter((_, idx) => idx !== i);
                            setForm({ ...form, detalles: newDetalles });
                            
                            // Limpiar errores de este detalle
                            const newErrors = { ...errors };
                            delete newErrors[`detalle_${i}_pId`];
                            delete newErrors[`detalle_${i}_cantidad`];
                            setErrors(newErrors);
                          }}
                          style={{ background: "#ef4444", color: "white", padding: "8px 12px", borderRadius: "6px", minWidth: "40px" }}
                        >
                          X
                        </button>
                      </div>
                    </div>
                  ))}
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        placeholder="Cant."
                        value={d.vdCantidad || ""}
                        onChange={e => {
                          const newDetalles = [...(form.detalles || [])];
                          newDetalles[i].vdCantidad = parseInt(e.target.value) || 1;
                          setForm({ ...form, detalles: newDetalles });
                        }}
                        style={{ width: "80px", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newDetalles = (form.detalles || []).filter((_, idx) => idx !== i);
                          setForm({ ...form, detalles: newDetalles });
                        }}
                        style={{ background: "#ef4444", color: "white", padding: "8px", borderRadius: "6px" }}
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, detalles: [...(form.detalles || []), { pId: "", vdCantidad: 1 }] })}
                    style={{ background: "#10b981", color: "white", padding: "8px 16px", borderRadius: "6px" }}
                  >
                    + Agregar Producto
                  </button>
                </div>
              </>
            )}

            <button
              type="submit"
              style={{
                gridColumn: entity.venta ? "1 / -1" : "auto",
                background: "#4f46e5",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                fontWeight: "600",
                marginTop: "16px"
              }}
            >
              {form[entity.id] ? "Actualizar" : "Crear"}
            </button>
          </form>
        </div>

        {/* TABLA */}
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={{ border: "1px solid #e5e7eb", padding: "12px", textAlign: "left", fontWeight: "600" }}>ID</th>
                {entity.fields.map(f => (
                  <th key={f} style={{ border: "1px solid #e5e7eb", padding: "12px", textAlign: "left", fontWeight: "600" }}>
                    {getLabel(f)}
                  </th>
                ))}
                {entity.select && (
                  <th style={{ border: "1px solid #e5e7eb", padding: "12px", textAlign: "left", fontWeight: "600" }}>
                    Ubicación
                  </th>
                )}
                {entity.venta && (
                  <th style={{ border: "1px solid #e5e7eb", padding: "12px", textAlign: "left", fontWeight: "600" }}>
                    Cliente / Punto de Venta
                  </th>
                )}
                <th style={{ border: "1px solid #e5e7eb", padding: "12px", textAlign: "left", fontWeight: "600" }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {getPaginated().map(item => (
                <tr key={item[entity.id]}>
                  <td style={{ border: "1px solid #e5e7eb", padding: "12px" }}>{item[entity.id]}</td>
                  {entity.fields.map(f => (
                    <td key={f} style={{ border: "1px solid #e5e7eb", padding: "12px" }}>
                      {item[f] || "-"}
                    </td>
                  ))}
                  {entity.select && (
                    <td style={{ border: "1px solid #e5e7eb", padding: "12px" }}>
                      {item.ubicacion?.uNombre || "Sin ubicación"}
                    </td>
                  )}
                  {entity.venta && (
                    <td style={{ border: "1px solid #e5e7eb", padding: "12px" }}>
                      {data.personas?.find(p => p.pId === item.pId)?.pNombre || "—"} {data.personas?.find(p => p.pId === item.pId)?.pApellido || ""} /{" "}
                      {data["puntos-de-venta"]?.find(pv => pv.pvId === item.pvId)?.pvNombre || "—"}
                    </td>
                  )}
                  <td style={{ border: "1px solid #e5e7eb", padding: "12px" }}>
                    <button
                      onClick={() => setForm(item)}
                      style={{ background: "#3b82f6", color: "white", padding: "6px 12px", borderRadius: "6px", marginRight: "6px" }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminar(activeTab, item[entity.id])}
                      style={{ background: "#ef4444", color: "white", padding: "6px 12px", borderRadius: "6px" }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "20px", textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: "8px 16px", borderRadius: "6px", background: page === 1 ? "#e5e7eb" : "#6b7280", color: "white" }}
            >
              Anterior
            </button>
            <span style={{ fontWeight: "600" }}>Página {page} de {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ padding: "8px 16px", borderRadius: "6px", background: page === totalPages ? "#e5e7eb" : "#6b7280", color: "white" }}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;