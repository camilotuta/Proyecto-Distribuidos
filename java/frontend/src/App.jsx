import { useState, useEffect } from "react";
import axios from "axios";

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
    <div style={{ padding: "20px", fontFamily: "'Segoe UI', Arial, sans-serif", background: "#f3f4f6", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1500px", margin: "0 auto" }}>
        <h1 style={{ color: "#4f46e5", textAlign: "center", marginBottom: "30px", fontSize: "2.5rem", fontWeight: "700" }}>
          Sistema de Tienda - Admin Completo
        </h1>

        <div style={{ display: "flex", gap: "12px", marginBottom: "30px", flexWrap: "wrap", justifyContent: "center" }}>
          {entities.map(e => (
            <button
              key={e.key}
              onClick={() => { setActiveTab(e.key); setForm({}); }}
              style={{
                padding: "14px 28px",
                background: activeTab === e.key ? "#4f46e5" : "#e5e7eb",
                color: activeTab === e.key ? "white" : "#1f2937",
                border: "none",
                borderRadius: "12px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "1.1rem",
                boxShadow: activeTab === e.key ? "0 4px 12px rgba(79, 70, 229, 0.4)" : "none"
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
            maxWidth: "600px",
            padding: "16px",
            margin: "0 auto 30px",
            display: "block",
            borderRadius: "12px",
            border: "2px solid #d1d5db",
            fontSize: "1.1rem"
          }}
        />

        <div style={{ background: "white", padding: "30px", borderRadius: "16px", boxShadow: "0 8px 25px rgba(0,0,0,0.1)", marginBottom: "40px" }}>
          <h2 style={{ color: "#1f2937", marginBottom: "24px", fontSize: "1.8rem", fontWeight: "600" }}>
            {form[entity.id] ? "Editar" : "Crear"} {entity.name.slice(0, -1)}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {entity.fields.map(f => (
              <div key={f}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  {getLabel(f)}
                </label>
                <input
                  type={f === "precio" || f === "stock" ? "number" : "text"}
                  value={form[f] || ""}
                  onChange={e => setForm({ ...form, [f]: e.target.value })}
                  required
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "2px solid #e5e7eb", fontSize: "1rem" }}
                />
              </div>
            ))}

            {entity.select && (
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  Ubicación
                </label>
                <select
                  value={form.uId || ""}
                  onChange={e => setForm({ ...form, uId: parseInt(e.target.value) })}
                  required
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "2px solid #e5e7eb", fontSize: "1rem" }}
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
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Cliente</label>
                  <select
                    value={form.pId || ""}
                    onChange={e => setForm({ ...form, pId: parseInt(e.target.value) })}
                    required
                    style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "2px solid #e5e7eb" }}
                  >
                    <option value="">Seleccionar cliente</option>
                    {(data.personas || []).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} {p.apellido}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Punto de Venta</label>
                  <select
                    value={form.pvId || ""}
                    onChange={e => setForm({ ...form, pvId: parseInt(e.target.value) })}
                    required
                    style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "2px solid #e5e7eb" }}
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
                  <label style={{ display: "block", marginBottom: "12px", fontWeight: "600" }}>
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
                        style={{ flex: "2", padding: "12px", borderRadius: "10px", border: "2px solid #e5e7eb" }}
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
                        style={{ width: "90px", padding: "12px", borderRadius: "10px", border: "2px solid #e5e7eb" }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newDetalles = form.detalles.filter((_, idx) => idx !== i);
                          setForm({ ...form, detalles: newDetalles.length > 0 ? newDetalles : undefined });
                        }}
                        style={{ background: "#ef4444", color: "white", padding: "12px", borderRadius: "10px", width: "50px" }}
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, detalles: [...(form.detalles || []), { pId: "", vdCantidad: 1 }] })}
                    style={{ background: "#10b981", color: "white", padding: "12px 24px", borderRadius: "10px", fontWeight: "600" }}
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
                padding: "16px 40px",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "1.2rem",
                marginTop: "10px"
              }}
            >
              {form[entity.id] ? "Actualizar" : "Crear"}
            </button>
          </form>
        </div>

        <div style={{ background: "white", padding: "30px", borderRadius: "16px", boxShadow: "0 8px 25px rgba(0,0,0,0.1)", overflowX: "auto" }}>
          <h2 style={{ marginBottom: "20px", color: "#1f2937", fontSize: "1.8rem", fontWeight: "600" }}>
            Lista de {entity.name}
          </h2>

          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
            <thead>
              <tr style={{ background: "#4f46e5", color: "white" }}>
                <th style={{ padding: "16px", textAlign: "left", fontWeight: "600" }}>ID</th>
                {entity.fields.map(f => (
                  <th key={f} style={{ padding: "16px", textAlign: "left", fontWeight: "600" }}>
                    {getLabel(f)}
                  </th>
                ))}
                {entity.select && <th style={{ padding: "16px", textAlign: "left", fontWeight: "600" }}>Ubicación</th>}
                {entity.venta && (
                  <>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600" }}>Cliente / Punto</th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600" }}>Detalles</th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600" }}>Total</th>
                  </>
                )}
                <th style={{ padding: "16px", textAlign: "left", fontWeight: "600" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {getPaginated().length > 0 ? (
                getPaginated().map(item => (
                  <tr key={item[entity.id]} style={{ background: item[entity.id] % 2 === 0 ? "#f9fafb" : "white" }}>
                    <td style={{ padding: "16px", borderBottom: "1px solid #e5e7eb", fontWeight: "600", color: "#4f46e5" }}>
                      {item[entity.id]}
                    </td>

                    {entity.fields.map(f => (
                      <td key={f} style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
                        {f === "vFecha"
                          ? formatDateValue(item[f] || item.fecha || item.vFecha || item.V_FECHA)
                          : f === "precio"
                            ? formatMoney(item[f])
                            : item[f] || "-"}
                      </td>
                    ))}

                    {entity.select && (
                      <td style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
                        {item.ubicacionNombre || "Sin ubicación"}
                      </td>
                    )}

                    {entity.venta && (
                      <>
                        <td style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
                          <div style={{ fontWeight: "600" }}>{item.clienteNombre || "Sin cliente"}</div>
                          <div style={{ fontSize: "0.9em", color: "#666" }}>
                            {item.puntoVentaNombre}<br />
                            <small>{item.ubicacionNombre}</small>
                          </div>
                        </td>
                        <td style={{ padding: "16px", borderBottom: "1px solid #e5e7eb", fontSize: "0.9em" }}>
                          {item.detalles?.length > 0 ? (
                            <ul style={{ margin: "0", paddingLeft: "20px" }}>
                              {item.detalles.map((d, i) => (
                                <li key={i}>
                                  <strong>{d.productoNombre}</strong> × {d.vdCantidad} = {formatMoney(d.subtotal)}
                                </li>
                              ))}
                            </ul>
                          ) : "Sin productos"}
                        </td>
                        <td style={{ padding: "16px", borderBottom: "1px solid #e5e7eb", fontWeight: "bold", fontSize: "1.2em", color: "#1f2937" }}>
                          {formatMoney(item.total)}
                        </td>
                      </>
                    )}

                    <td style={{ padding: "16px", borderBottom: "1px solid #e5e7eb" }}>
                      <button
                        onClick={() => setForm(item)}
                        style={{ background: "#3b82f6", color: "white", padding: "10px 18px", borderRadius: "10px", marginRight: "10px", fontWeight: "600" }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminar(activeTab, item[entity.id])}
                        style={{ background: "#ef4444", color: "white", padding: "10px 18px", borderRadius: "10px", fontWeight: "600" }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", padding: "60px", color: "#9ca3af", fontSize: "1.2rem" }}>
                    No hay registros para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ marginTop: "40px", textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", gap: "20px" }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: "12px 28px",
                  borderRadius: "12px",
                  background: page === 1 ? "#e5e7eb" : "#6b7280",
                  color: "white",
                  fontWeight: "600"
                }}
              >
                Anterior
              </button>
              <span style={{ fontWeight: "700", fontSize: "1.2rem", color: "#4f46e5" }}>
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: "12px 28px",
                  borderRadius: "12px",
                  background: page === totalPages ? "#e5e7eb" : "#6b7280",
                  color: "white",
                  fontWeight: "600"
                }}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;