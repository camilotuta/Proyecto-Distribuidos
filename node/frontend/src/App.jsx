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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ent = activeTab;
    const entity = entities.find(x => x.key === ent);
    const id = form[entity.id];

    try {
      if (ent === "puntos-de-venta") {
        if (!form.pvNombre?.trim() || !form.uId) {
          alert("Nombre y ubicación son obligatorios");
          return;
        }
      }

      if (id) {
        await axios.put(`${API}/${ent}/${id}`, form);
      } else {
        await axios.post(`${API}/${ent}`, form);
      }
      setForm({});
      const res = await axios.get(`${API}/${ent}`);
      setData(prev => ({ ...prev, [ent]: res.data }));
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
              <input
                key={f}
                placeholder={getLabel(f)}
                type={f === "pPrecio" || f === "pStock" ? "number" : "text"}
                step={f === "pPrecio" ? "0.01" : undefined}
                value={form[f] || ""}
                onChange={e => setForm({ ...form, [f]: e.target.value })}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                required={f !== "pEmail"}
              />
            ))}

            {entity.select && (
              <select
                value={form.uId || ""}
                onChange={e => setForm({ ...form, uId: e.target.value })}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                required
              >
                <option value="">Seleccionar Ubicación</option>
                {(data.ubicaciones || []).map(u => (
                  <option key={u.uId} value={u.uId}>
                    {u.uNombre}
                  </option>
                ))}
              </select>
            )}

            {entity.venta && (
              <>
                <select
                  value={form.pId || ""}
                  onChange={e => setForm({ ...form, pId: e.target.value })}
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                  required
                >
                  <option value="">Cliente</option>
                  {(data.personas || []).map(p => (
                    <option key={p.pId} value={p.pId}>{p.pNombre} {p.pApellido}</option>
                  ))}
                </select>

                <select
                  value={form.pvId || ""}
                  onChange={e => setForm({ ...form, pvId: e.target.value })}
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                  required
                >
                  <option value="">Punto de V | Venta</option>
                  {(data["puntos-de-venta"] || []).map(pv => (
                    <option key={pv.pvId} value={pv.pvId}>
                      {pv.pvNombre} ({pv.ubicacion?.uNombre || "Sin ubicación"})
                    </option>
                  ))}
                </select>

                <div style={{ gridColumn: "1 / -1", marginTop: "16px" }}>
                  <h4 style={{ marginBottom: "8px" }}>Productos</h4>
                  {(form.detalles || []).map((d, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                      <select
                        value={d.pId || ""}
                        onChange={e => {
                          const newDetalles = [...(form.detalles || [])];
                          newDetalles[i].pId = e.target.value;
                          setForm({ ...form, detalles: newDetalles });
                        }}
                        style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                      >
                        <option value="">Producto</option>
                        {(data.productos || []).map(p => (
                          <option key={p.pId} value={p.pId}>{p.pNombre} - ${p.pPrecio}</option>
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