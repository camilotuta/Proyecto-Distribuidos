import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:8080/api";

const ENTITIES = [
  { key: "personas", name: "Personas", id: "id", fields: ["nombre", "apellido", "email"] },
  { key: "productos", name: "Productos", id: "id", fields: ["nombre", "precio", "stock"] },
  { key: "ubicaciones", name: "Ubicaciones", id: "id", fields: ["nombre"] },
  {
    key: "puntos-de-venta",
    name: "Puntos de Venta",
    id: "id",
    fields: ["nombre"],
    select: { field: "uId", options: "ubicaciones", label: "nombre" }
  },
  { key: "ventas", name: "Ventas", id: "id", fields: ["vFecha"], venta: true }
];

function App() {
  const [activeTab, setActiveTab] = useState("personas");
  const [data, setData] = useState({});
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const entities = ENTITIES;

  const FIELD_LABELS = {
    nombre: "Nombre",
    apellido: "Apellido",
    email: "Email",
    precio: "Precio ($)",
    stock: "Stock",
    vFecha: "Fecha",
    total: "Total"
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const formatDateValue = (fechaString) => {
    if (!fechaString) return '-';
    try {
      let fecha;
      if (Array.isArray(fechaString)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = fechaString;
        fecha = new Date(year, month - 1, day, hour, minute, second);
      } else if (typeof fechaString === 'string' || typeof fechaString === 'number') {
        fecha = new Date(fechaString);
      } else if (fechaString instanceof Date) {
        fecha = fechaString;
      }

      if (!fecha || isNaN(fecha.getTime())) return 'Fecha inválida';
      return fecha.toLocaleString('es-CO');
    } catch {
      return 'Fecha inválida';
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      for (const e of ENTITIES) {
        try {
          const res = await axios.get(`${API}/${e.key}`);
          const dataList = Array.isArray(res.data) ? res.data : (res.data.content || []);
          setData(prev => ({ ...prev, [e.key]: dataList }));
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
        const dataList = Array.isArray(res.data) ? res.data : (res.data.content || []);
        setData(prev => ({ ...prev, [activeTab]: dataList }));
        setPage(1);
        setSearch("");
      } catch (err) {
        console.error(`Error recargando ${activeTab}:`, err.response?.data || err.message);
      }
    };
    loadCurrent();
  }, [activeTab]);

  // FUNCIÓN CLAVE: MAPEA LOS CAMPOS DEL FORMULARIO AL FORMATO DEL BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();
    const ent = activeTab;
    const entity = entities.find(x => x.key === ent);
    const id = form[entity.id];

    let payload = {};

    // MAPEO SEGÚN LA ENTIDAD
    if (ent === "personas") {
      payload = {
        pId: form.id,
        pNombre: form.nombre,
        pApellido: form.apellido,
        pEmail: form.email
      };
    }
    else if (ent === "productos") {
      payload = {
        pId: form.id,
        pNombre: form.nombre,
        pPrecio: form.precio,
        pStock: parseInt(form.stock) || 0
      };
    }
    else if (ent === "ubicaciones") {
      payload = {
        uId: form.id,
        uNombre: form.nombre
      };
    }
    else if (ent === "puntos-de-venta") {
      payload = {
        pvId: form.id,
        pvNombre: form.nombre,
        uId: form.uId
      };
    }
    else if (ent === "ventas") {
      payload = {
        vId: form.id,
        pId: form.pId,
        pvId: form.pvId,
        detalles: (form.detalles || []).map(d => ({
          pId: d.pId,
          vdCantidad: d.vdCantidad || 1
        }))
      };
    }

    try {
      if (id) {
        await axios.put(`${API}/${ent}/${id}`, payload);
      } else {
        await axios.post(`${API}/${ent}`, payload);
      }
      setForm({});
      const res = await axios.get(`${API}/${ent}`);
      const dataList = Array.isArray(res.data) ? res.data : (res.data.content || []);
      setData(prev => ({ ...prev, [ent]: dataList }));
      alert("¡Operación exitosa!");
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.mensaje || err.message;
      alert("Error: " + errorMsg);
    }
  };

  const eliminar = async (ent, id) => {
    if (!confirm("¿Eliminar este registro?")) return;
    try {
      await axios.delete(`${API}/${ent}/${id}`);
      const res = await axios.get(`${API}/${ent}`);
      const dataList = Array.isArray(res.data) ? res.data : (res.data.content || []);
      setData(prev => ({ ...prev, [ent]: dataList }));
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
      <div style={{ maxWidth: "1500px", margin: "0 auto" }}>
        <header className="app-header">
          <h1 className="app-title">Sistema de Tienda</h1>
          <p className="app-subtitle">Backend: Java Spring Boot | Frontend: React + Vite</p>
        </header>

        <div className="tabs-container">
          {entities.map(e => (
            <button
              key={e.key}
              onClick={() => { setActiveTab(e.key); setForm({}); }}
              className={`tab-button ${activeTab === e.key ? 'active' : 'inactive'}`}
            >
              {e.name}
            </button>
          ))}
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Buscar..."
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
                  type={f === "precio" || f === "stock" ? "number" : "text"}
                  value={form[f] || ""}
                  onChange={e => setForm({ ...form, [f]: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
            ))}

            {entity.select && (
              <div className="form-group">
                <label className="form-label">
                  Ubicación
                </label>
                <select
                  value={form.uId || ""}
                  onChange={e => setForm({ ...form, uId: parseInt(e.target.value) })}
                  required
                  className="form-select"
                >
                  <option value="">Seleccionar ubicación</option>
                  {(data[entity.select.options] || []).map(u => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            {entity.venta && (
              <>
                <div className="form-group">
                  <label className="form-label">Cliente</label>
                  <select
                    value={form.pId || ""}
                    onChange={e => setForm({ ...form, pId: parseInt(e.target.value) })}
                    required
                    className="form-select"
                  >
                    <option value="">Seleccionar cliente</option>
                    {(data.personas || []).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} {p.apellido}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Punto de Venta</label>
                  <select
                    value={form.pvId || ""}
                    onChange={e => setForm({ ...form, pvId: parseInt(e.target.value) })}
                    required
                    className="form-select"
                  >
                    <option value="">Seleccionar punto</option>
                    {(data["puntos-de-venta"] || []).map(pv => (
                      <option key={pv.id} value={pv.id}>
                        {pv.nombre} - {pv.ubicacionNombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">
                    Productos
                  </label>
                  {form.detalles?.map((d, i) => (
                    <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "12px", alignItems: "center" }}>
                      <select
                        value={d.pId || ""}
                        onChange={e => {
                          const newDetalles = [...form.detalles];
                          newDetalles[i].pId = parseInt(e.target.value);
                          setForm({ ...form, detalles: newDetalles });
                        }}
                        className="form-select"
                        style={{ flex: "2" }}
                      >
                        <option value="">Seleccionar producto</option>
                        {(data.productos || []).map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} - {formatMoney(p.precio)} (Stock: {p.stock})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={d.vdCantidad || 1}
                        onChange={e => {
                          const newDetalles = [...form.detalles];
                          newDetalles[i].vdCantidad = parseInt(e.target.value) || 1;
                          setForm({ ...form, detalles: newDetalles });
                        }}
                        className="form-input"
                        style={{ width: "90px" }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newDetalles = form.detalles.filter((_, idx) => idx !== i);
                          setForm({ ...form, detalles: newDetalles.length > 0 ? newDetalles : undefined });
                        }}
                        className="btn btn-danger"
                        style={{ width: "50px", padding: "12px" }}
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, detalles: [...(form.detalles || []), { pId: "", vdCantidad: 1 }] })}
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
                marginTop: "10px"
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
                  {entity.select && <th>Ubicación</th>}
                  {entity.venta && (
                    <>
                      <th>Cliente / Punto</th>
                      <th>Detalles</th>
                      <th>Total</th>
                    </>
                  )}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {getPaginated().length > 0 ? (
                  getPaginated().map(item => (
                    <tr key={item[entity.id]}>
                      <td className="table-id">
                        {item[entity.id]}
                      </td>

                      {entity.fields.map(f => (
                        <td key={f}>
                          {f === "vFecha"
                            ? formatDateValue(item[f] || item.fecha || item.vFecha || item.V_FECHA)
                            : f === "precio"
                              ? formatMoney(item[f])
                              : item[f] || "-"}
                        </td>
                      ))}

                      {entity.select && (
                        <td>
                          {item.ubicacionNombre || "Sin ubicación"}
                        </td>
                      )}

                      {entity.venta && (
                        <>
                          <td>
                            <div style={{ fontWeight: "600" }}>{item.clienteNombre || "Sin cliente"}</div>
                            <div style={{ fontSize: "0.9em", color: "#666" }}>
                              {item.puntoVentaNombre}<br />
                              <small>{item.ubicacionNombre}</small>
                            </div>
                          </td>
                          <td className="venta-detalles">
                            {item.detalles?.length > 0 ? (
                              <ul>
                                {item.detalles.map((d, i) => (
                                  <li key={i}>
                                    <strong>{d.productoNombre}</strong> × {d.vdCantidad} = {formatMoney(d.subtotal)}
                                  </li>
                                ))}
                              </ul>
                            ) : "Sin productos"}
                          </td>
                          <td className="venta-total">
                            {formatMoney(item.total)}
                          </td>
                        </>
                      )}

                      <td>
                        <button
                          onClick={() => setForm(item)}
                          className="btn btn-edit"
                          style={{ marginRight: "10px" }}
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