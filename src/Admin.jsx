import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import logo from "../brand/assets/logos/transparent/bono-logo-original-large-transparent.png"

const COLORES = [
  "#3001F7",
  "#7243FD",
  "#9B6FFF",
  "#B89AFF",
  "#4B0082",
  "#6A0DAD",
  "#1F7A8C",
  "#00A878",
  "#F59E0B",
  "#EF4444",
  "#64748B",
  "#111827",
  "#A855F7",
]

const INDUSTRIAS_CANONICAS = [
  "Manufactura y Produccion Industrial",
  "Produccion y Procesamiento de Alimentos",
  "Restaurantes, Hoteles y Hospitalidad",
  "Transporte",
  "Retail y Comercio",
  "Distribucion y Almacenamiento",
  "Oficinas y Servicios Profesionales",
  "Construccion e Infraestructura",
  "Operacion y Administracion de Inmuebles",
  "Agricultura y Produccion Primaria",
  "Textil y Confeccion",
  "Salud y Laboratorios",
  "Otro",
]

function normalizarTexto(valor = "") {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function normalizarGiro(giro) {
  if (!giro) return "Sin especificar"

  const texto = normalizarTexto(giro)
  const exacto = INDUSTRIAS_CANONICAS.find((industria) => normalizarTexto(industria) === texto)
  if (exacto) return exacto

  if (texto.includes("inmueble") || texto.includes("inmobiliaria")) {
    return "Operacion y Administracion de Inmuebles"
  }

  if (texto.includes("distribucion") || texto.includes("almacen")) {
    return "Distribucion y Almacenamiento"
  }

  if (texto.includes("restaurante") || texto.includes("hotel") || texto.includes("hospitalidad")) {
    return "Restaurantes, Hoteles y Hospitalidad"
  }

  if (texto.includes("alimento") || texto.includes("bebida")) {
    return "Produccion y Procesamiento de Alimentos"
  }

  if (texto.includes("manufactura") || texto.includes("industria")) {
    return "Manufactura y Produccion Industrial"
  }

  if (texto.includes("transporte")) {
    return "Transporte"
  }

  if (texto.includes("retail") || texto.includes("comercio")) {
    return "Retail y Comercio"
  }

  if (texto.includes("oficina") || texto.includes("servicio")) {
    return "Oficinas y Servicios Profesionales"
  }

  if (texto.includes("construccion") || texto.includes("infraestructura")) {
    return "Construccion e Infraestructura"
  }

  if (texto.includes("agricultura") || texto.includes("primaria")) {
    return "Agricultura y Produccion Primaria"
  }

  if (texto.includes("textil") || texto.includes("confeccion")) {
    return "Textil y Confeccion"
  }

  if (texto.includes("salud") || texto.includes("laboratorio")) {
    return "Salud y Laboratorios"
  }

  return giro
}

function Admin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [autenticado, setAutenticado] = useState(
    sessionStorage.getItem("adminAuth") === "true"
  )
  const [tabActual, setTabActual] = useState("dashboard")
  const [leads, setLeads] = useState([])
  const [sesiones, setSesiones] = useState([])
  const [filtroGiro, setFiltroGiro] = useState("")
  const [cargando, setCargando] = useState(false)

  const login = async () => {
    setError("")
    const usernameConPrefijo = `@dm1n_${username}`

    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("username", usernameConPrefijo)
      .eq("contraseña", password)
      .single()

    if (error || !data) {
      setError("Usuario o contraseña incorrectos")
      return
    }

    sessionStorage.setItem("adminAuth", "true")
    setAutenticado(true)
  }

  const cargarDatos = async () => {
    setCargando(true)

    const { data: leadsData } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })

    const { data: sesionesData } = await supabase
      .from("sesiones")
      .select("*")
      .order("created_at", { ascending: false })

    setLeads(leadsData || [])
    setSesiones(sesionesData || [])
    setCargando(false)
  }

  // carga datos al autenticarse y cada 30 segundos
  useEffect(() => {
    if (!autenticado) return

    cargarDatos()

    const intervalo = setInterval(() => {
      cargarDatos()
    }, 30000)

    return () => clearInterval(intervalo)
  }, [autenticado])

  const cerrarSesion = () => {
    sessionStorage.removeItem("adminAuth")
    setAutenticado(false)
  }

  // metricas calculadas
  const totalUsuarios = sesiones.filter(s => s.completo).length
  const tiempoPromedio = sesiones.length
    ? Math.round(sesiones.reduce((acc, s) => acc + (s.tiempo_segundos || 0), 0) / sesiones.length)
    : 0
  const clicksCalendly = leads.filter(l => l.clicks_calendly).length
  const leadsNormalizados = leads.map((lead) => ({
    ...lead,
    giroNormalizado: normalizarGiro(lead.giro),
  }))

  const giroCount = leadsNormalizados.reduce((acc, lead) => {
    const giro = lead.giroNormalizado
    acc[giro] = (acc[giro] || 0) + 1
    return acc
  }, {})
  const datosGrafica = Object.entries(giroCount)
    .sort(([a], [b]) => {
      const ordenA = INDUSTRIAS_CANONICAS.indexOf(a)
      const ordenB = INDUSTRIAS_CANONICAS.indexOf(b)
      return (ordenA === -1 ? 999 : ordenA) - (ordenB === -1 ? 999 : ordenB)
    })
    .map(([name, value]) => ({ name, value }))

  const clicksPorGiro = leadsNormalizados
    .filter(l => l.clicks_calendly)
    .reduce((acc, lead) => {
      const giro = lead.giroNormalizado
      acc[giro] = (acc[giro] || 0) + 1
      return acc
    }, {})

  const leadsFiltrados = filtroGiro
    ? leadsNormalizados.filter(l => l.giroNormalizado === filtroGiro)
    : leadsNormalizados

  const girosUnicos = [
    ...INDUSTRIAS_CANONICAS,
    ...Object.keys(giroCount).filter((giro) => !INDUSTRIAS_CANONICAS.includes(giro)),
  ]

  if (!autenticado) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <img className="admin-logo" src={logo} alt="Bono2" />
          <p className="admin-login-subtitle">Panel de administracion</p>

          <input
            className="input-texto"
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
          <input
            className="input-texto"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            style={{ marginTop: "12px" }}
          />

          {error && <p className="admin-error">{error}</p>}

          <button className="btn-enviar" onClick={login} style={{ marginTop: "20px", width: "100%" }}>
            Entrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-shell">

      <div className="admin-header">
        <div className="admin-brand">
          <img className="admin-logo" src={logo} alt="Bono2" />
          <span>Admin</span>
        </div>
        <button className="admin-logout" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${tabActual === "dashboard" ? "active" : ""}`}
          onClick={() => setTabActual("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`admin-tab ${tabActual === "calendly" ? "active" : ""}`}
          onClick={() => setTabActual("calendly")}
        >
          Leads calientes
        </button>
        <button
          className={`admin-tab ${tabActual === "todos" ? "active" : ""}`}
          onClick={() => setTabActual("todos")}
        >
          Todos los leads
        </button>
      </div>

      <div className="admin-content">

        {cargando && <p style={{ color: "#888", textAlign: "center" }}>Cargando datos...</p>}

        {tabActual === "dashboard" && !cargando && (
          <div className="admin-dashboard">
            <p className="admin-tab-desc">Resumen general de uso de la calculadora y métricas clave.</p>

            <div className="admin-metricas">
              <div className="metrica-card">
                <span className="metrica-numero">{totalUsuarios}</span>
                <span className="metrica-label">Usuarios que completaron el flujo</span>
              </div>
              <div className="metrica-card">
                <span className="metrica-numero">{tiempoPromedio}s</span>
                <span className="metrica-label">Tiempo promedio de respuesta</span>
              </div>
              <div className="metrica-card">
                <span className="metrica-numero">{clicksCalendly}</span>
                <span className="metrica-label">Clicks en Calendly</span>
              </div>
            </div>

            <div className="admin-chart-card">
              <h3>Usuarios por sector</h3>
              <p className="admin-chart-desc">Distribución de empresas que usaron la calculadora según su giro industrial.</p>
              {datosGrafica.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={datosGrafica}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {datosGrafica.map((_, index) => (
                        <Cell key={index} fill={COLORES[index % COLORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: "#888", textAlign: "center", padding: "40px" }}>Sin datos aún</p>
              )}
            </div>

            <div className="admin-chart-card">
              <h3>Clicks en Calendly por sector</h3>
              <p className="admin-chart-desc">
                De los {clicksCalendly} clicks totales en Calendly, así se distribuyen por giro:
              </p>
              {Object.keys(clicksPorGiro).length > 0 ? (
                <div className="clicks-giro-lista">
                  {Object.entries(clicksPorGiro).map(([giro, count]) => (
                    <div key={giro} className="clicks-giro-row">
                      <span className="clicks-giro-nombre">{giro}</span>
                      <span className="clicks-giro-count">{count} clicks</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#888", textAlign: "center", padding: "20px" }}>Sin clicks aún</p>
              )}
            </div>
          </div>
        )}

        {tabActual === "calendly" && !cargando && (
          <div>
            <p className="admin-tab-desc">Empresas que hicieron click en Calendly — son las más interesadas en contratar a Bono.</p>
            <div className="admin-tabla-container">
              <table className="admin-tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Empresa</th>
                    <th>Correo</th>
                    <th>Giro</th>
                    <th>Huella (tCO₂e)</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.filter(l => l.clicks_calendly).length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", color: "#888", padding: "32px" }}>
                        Sin leads calientes aún
                      </td>
                    </tr>
                  ) : (
                    leads.filter(l => l.clicks_calendly).map((lead) => (
                      <tr key={lead.id}>
                        <td>{lead.nombre}</td>
                        <td>{lead.empresa}</td>
                        <td>{lead.correo}</td>
                        <td>{lead.giroNormalizado}</td>
                        <td>{lead.huella}</td>
                        <td>{new Date(lead.created_at).toLocaleDateString("es-MX")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tabActual === "todos" && !cargando && (
          <div>
            <p className="admin-tab-desc">Todos los leads capturados. Filtra por giro para encontrar empresas específicas.</p>

            <div className="admin-filtro">
              <select
                className="input-texto"
                style={{ maxWidth: "300px" }}
                value={filtroGiro}
                onChange={(e) => setFiltroGiro(e.target.value)}
              >
                <option value="">Todos los giros</option>
                {girosUnicos.map(giro => (
                  <option key={giro} value={giro}>{giro}</option>
                ))}
              </select>
            </div>

            <div className="admin-tabla-container">
              <table className="admin-tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Empresa</th>
                    <th>Correo</th>
                    <th>Giro</th>
                    <th>Huella (tCO₂e)</th>
                    <th>Calendly</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {leadsFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", color: "#888", padding: "32px" }}>
                        Sin leads
                      </td>
                    </tr>
                  ) : (
                    leadsFiltrados.map((lead) => (
                      <tr key={lead.id}>
                        <td>{lead.nombre}</td>
                        <td>{lead.empresa}</td>
                        <td>{lead.correo}</td>
                        <td>{lead.giroNormalizado}</td>
                        <td>{lead.huella}</td>
                        <td>{lead.clicks_calendly ? "✅" : "—"}</td>
                        <td>{new Date(lead.created_at).toLocaleDateString("es-MX")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Admin
