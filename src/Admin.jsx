import { useState } from "react"
import { supabase } from "./supabase"

function Admin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [autenticado, setAutenticado] = useState(false)

  const login = async () => {
    setError("")
    const usernameConPrefijo = `@dm1n_${username}`

    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("username", usernameConPrefijo)
      .eq("password", password)
      .single()

    if (error || !data) {
      setError("Usuario o contraseña incorrectos")
      return
    }

    setAutenticado(true)
  }

  if (!autenticado) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <div className="logo-texto" style={{ marginBottom: "8px" }}>bono₂</div>
          <p className="tagline" style={{ marginBottom: "32px" }}>Panel de administración</p>

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
    <div className="app">
      <div className="header">
        <div className="logo-texto">bono₂ Admin</div>
      </div>
      <p style={{ color: "#888" }}>Dashboard cargando...</p>
    </div>
  )
}

export default Admin