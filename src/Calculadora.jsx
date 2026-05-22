import { useState, useRef, useEffect } from "react"
import { chatConOpenAI } from "./openai"
import { normalizarDatosOperativos, calcularHuella } from "./calculos"
import { obtenerPreguntaInicial } from "./openaiRouting"
import Resultado from "./resultado"
import logo from "../brand/assets/logos/transparent/bono-logo-original-large-transparent.png"
import { guardarLeadSupabase, iniciarSesion, completarSesion } from "./supabase"

const industrias = [
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

const rangosEmpleados = [
  "1-5 empleados",
  "6-20 empleados",
  "21-50 empleados",
  "51-100 empleados",
  "101-250 empleados",
  "Mas de 250 empleados",
]

const paises = [
  "Mexico",
  "Colombia",
  "Brasil",
  "Chile",
  "Argentina",
  "Peru",
  "Otro pais LATAM",
]

function Calculadora() {
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState("")
  const [cargando, setCargando] = useState(false)
  const [fase, setFase] = useState("inicio")
  const [datos, setDatos] = useState(null)
  const [nombreUsuario, setNombreUsuario] = useState("")
  const [empresaUsuario, setEmpresaUsuario] = useState("")
  const [correoUsuario, setCorreoUsuario] = useState("")
  const [perfilEmpresa, setPerfilEmpresa] = useState({
    industria: "",
    empleados: "",
    pais: "",
  })
  const mensajesRef = useRef(null)
  const perfilCompleto = Boolean(
    perfilEmpresa.industria && perfilEmpresa.empleados && perfilEmpresa.pais
  )

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight
    }
  }, [mensajes])

  const actualizarPerfil = (campo, valor) => {
    setPerfilEmpresa((perfilActual) => ({
      ...perfilActual,
      [campo]: valor,
    }))
  }

  const iniciarChat = async () => {
    if (!perfilCompleto) return

    setFase("chat")
    setMensajes([{ tipo: "bot", texto: obtenerPreguntaInicial(perfilEmpresa.industria) }])

    try {
      await iniciarSesion(perfilEmpresa.industria)
    } catch (error) {
      console.log("ERROR INICIANDO SESION:", error)
    }
  }

  const enviarMensaje = async () => {
    if (!input.trim() || cargando) return

    const textoUsuario = input
    setInput("")

    const nuevosMensajes = [...mensajes, { tipo: "usuario", texto: textoUsuario }]
    setMensajes(nuevosMensajes)
    setCargando(true)

    try {
      if (fase === "chat") {
        const respuesta = await chatConOpenAI(mensajes, textoUsuario, perfilEmpresa)

        if (respuesta.tipo === "datos") {
          const datosNormalizados = normalizarDatosOperativos(respuesta.datos, perfilEmpresa)
          console.log("DATOS RAW DE OPENAI:", respuesta.datos)
          console.log("DATOS NORMALIZADOS:", datosNormalizados)
          setDatos(datosNormalizados)
          setFase("muro_nombre")
          setMensajes([...nuevosMensajes, {
            tipo: "bot",
            texto: "¡Tu estimación está lista! 🌱 Para generar el reporte, escribe tu nombre y apellido."
          }])
        } else {
          setMensajes([...nuevosMensajes, { tipo: "bot", texto: respuesta.texto }])
        }

      } else if (fase === "muro_nombre") {
        const esObjecion = /por qu[eé]|segur|datos|privac|para qu[eé]|no quiero|qu[eé] har[aá]n|compartir|nombre/i.test(textoUsuario)
        const pareceNombre = textoUsuario.trim().split(" ").length >= 1 && textoUsuario.length < 50 && !textoUsuario.includes("?")

        if (esObjecion || !pareceNombre) {
          setMensajes([...nuevosMensajes, {
            tipo: "bot",
            texto: "Entiendo. 🙂 Solo necesito tu nombre para personalizar el reporte, no lo compartimos con nadie. Puedes poner solo tu nombre de pila si prefieres."
          }])
        } else {
          setNombreUsuario(textoUsuario)
          setFase("muro_empresa")
          setMensajes([...nuevosMensajes, {
            tipo: "bot",
            texto: `Gracias, ${textoUsuario.split(" ")[0]}. ¿A nombre de qué empresa genero el reporte?`
          }])
        }
      } else if (fase === "muro_empresa") {
        const esObjecion = /por qu[eé]|segur|datos|privac|para qu[eé]|no quiero|qu[eé] har[aá]n|compartir/i.test(textoUsuario)

        if (esObjecion) {
          setMensajes([...nuevosMensajes, {
            tipo: "bot",
            texto: "Entiendo la duda, es totalmente válida. 🔒 Solo usamos el nombre de tu empresa para personalizar tu reporte. No compartimos tu información con terceros ni te enviamos spam. Si prefieres, puedes poner solo el giro, como 'Empresa de distribución'."
          }])
        } else {
          setEmpresaUsuario(textoUsuario)
          setFase("muro_correo")
          setMensajes([...nuevosMensajes, {
            tipo: "bot",
            texto: "¡Perfecto! ¿Y cuál es tu correo empresarial para enviarte el reporte completo? 📩"
          }])
        }

      } else if (fase === "muro_correo") {
        const esObjecion = /por qu[eé]|segur|datos|privac|para qu[eé]|no quiero|spam|correo personal/i.test(textoUsuario)
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(textoUsuario)

        if (esObjecion) {
          setMensajes([...nuevosMensajes, {
            tipo: "bot",
            texto: "Completamente válido. 🔒 Tu correo solo se usa para enviarte el reporte, nunca para spam ni para compartir con terceros. Si prefieres, puedes usar un correo personal, también funciona."
          }])
        } else if (!emailValido) {
          setMensajes([...nuevosMensajes, {
            tipo: "bot",
            texto: "Ese correo no parece válido. ¿Puedes verificarlo? Necesitamos un correo real para enviarte tu reporte."
          }])
        } else {
          const resultado = calcularHuella(datos)
          await guardarLeadSupabase({
            nombre: nombreUsuario,
            empresa: empresaUsuario,
            correo: textoUsuario,
            giro: perfilEmpresa.industria,
            huella: resultado.totalToneladas
          })
          setCorreoUsuario(textoUsuario)
          await completarSesion()
          setFase("resultado")
          setMensajes([...nuevosMensajes, {
            tipo: "bot",
            texto: `¡Listo! Aquí está la estimación de huella de carbono de ${empresaUsuario}. 🌍`
          }])
        }
      }

    } catch (error) {
      console.log("ERROR:", error)
      setMensajes([...nuevosMensajes, {
        tipo: "bot",
        texto: "Tuve un problema procesando esa respuesta. Intenta de nuevo con una respuesta aproximada."
      }])
    }

    setCargando(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") enviarMensaje()
  }

  return (
    <div className="app">
      <div className="header">
        <a className="calculator-brand" href="/" aria-label="Volver al inicio de Bono">
          <img src={logo} alt="Bono2" />
        </a>
        <div className="calculator-heading">
          <div className="logo-texto">Calculadora de huella</div>
          <div className="tagline">cutting emissions</div>
        </div>
      </div>

      {fase === "inicio" && (
        <section className="onboarding-card" aria-labelledby="onboarding-title">
          <div className="onboarding-copy">
            <p className="onboarding-eyebrow">Antes de empezar</p>
            <h1 id="onboarding-title">Cuentanos sobre tu empresa</h1>
            <p>
              Esto prepara la conversacion para tu tipo de operacion.
              El calculo inicia en el siguiente paso.
            </p>
          </div>

          <div className="onboarding-form">
            <label className="select-field">
              <span>Industria</span>
              <select
                value={perfilEmpresa.industria}
                onChange={(e) => actualizarPerfil("industria", e.target.value)}
              >
                <option value="">Selecciona una industria</option>
                {industrias.map((industria) => (
                  <option key={industria} value={industria}>
                    {industria}
                  </option>
                ))}
              </select>
            </label>

            <label className="select-field">
              <span>Numero de empleados</span>
              <select
                value={perfilEmpresa.empleados}
                onChange={(e) => actualizarPerfil("empleados", e.target.value)}
              >
                <option value="">Selecciona un rango</option>
                {rangosEmpleados.map((rango) => (
                  <option key={rango} value={rango}>
                    {rango}
                  </option>
                ))}
              </select>
            </label>

            <label className="select-field">
              <span>En que pais opera principalmente tu empresa?</span>
              <select
                value={perfilEmpresa.pais}
                onChange={(e) => actualizarPerfil("pais", e.target.value)}
              >
                <option value="">Selecciona un pais</option>
                {paises.map((pais) => (
                  <option key={pais} value={pais}>
                    {pais}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            className="btn-cta onboarding-button"
            type="button"
            disabled={!perfilCompleto}
            onClick={iniciarChat}
          >
            Continuar
          </button>
        </section>
      )}

      {fase !== "inicio" && (
        <div className="chat-container">
          <div className="mensajes" ref={mensajesRef}>
            {mensajes.map((msg, i) => (
              <div key={i} className={`mensaje mensaje-${msg.tipo}`}>
                <div className="remitente">
                  {msg.tipo === "bot" ? "B2" : nombreUsuario || "Tu"}
                </div>
                <div className={`burbuja ${msg.tipo === "bot" ? "burbuja-bot" : "burbuja-usuario"}`}>
                  {msg.texto}
                </div>
              </div>
            ))}

            {cargando && (
              <div className="mensaje mensaje-bot">
                <div className="remitente">B2</div>
                <div className="burbuja burbuja-bot">
                  <span>...</span>
                </div>
              </div>
            )}
          </div>

          <div className="input-area">
            <input
              className="input-texto"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={cargando ? "B2 esta escribiendo..." : "Escribe tu respuesta..."}
              disabled={cargando}
            />
            <button className="btn-enviar" onClick={enviarMensaje} disabled={cargando}>
              Enviar
            </button>
          </div>
        </div>
      )}

      {fase === "resultado" && datos && (
        <Resultado
          datos={datos}
          nombre={nombreUsuario}
          empresa={empresaUsuario}
          correo={correoUsuario}
          giro={perfilEmpresa.industria}
        />
      )}
    </div>
  )
}

export default Calculadora
