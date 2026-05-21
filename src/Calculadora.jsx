import { useState, useRef, useEffect } from "react"
import { chatConOpenAI } from "./openai"
import logo from "../brand/assets/logos/transparent/bono-logo-original-large-transparent.png"

function Calculadora() {
  const [mensajes, setMensajes] = useState([
    { tipo: "bot", texto: "Hola 👋 Soy el asistente de Bono. Voy a ayudarte a estimar la huella de carbono de tu empresa en menos de 3 minutos. ¿Empezamos?" }
  ])
  const [input, setInput] = useState("")
  const [cargando, setCargando] = useState(false)
  const [fase, setFase] = useState("chat") // chat, muro, resultado
  const [, setDatos] = useState(null)
  const mensajesRef = useRef(null)

  // scroll automatico al ultimo mensaje
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight
    }
  }, [mensajes])

  const enviarMensaje = async () => {
    if (!input.trim() || cargando) return

    const textoUsuario = input
    setInput("")

    // agrega mensaje del usuario
    const nuevosMensajes = [...mensajes, { tipo: "usuario", texto: textoUsuario }]
    setMensajes(nuevosMensajes)
    setCargando(true)

    try {
      if (fase === "chat") {
        const respuesta = await chatConOpenAI(mensajes, textoUsuario)

        if (respuesta.tipo === "datos") {
          // OpenAI termino de recopilar info
          console.log("DATOS DE OPENAI:", respuesta.datos)
          setDatos(respuesta.datos)
          setFase("muro")
          setMensajes([...nuevosMensajes, {
            tipo: "bot",
            texto: "¡Perfecto, ya tengo toda la información! 🌱 Solo un paso más, escribe tu correo empresarial para poder recibir tu estimación"
          }])
        } else {
          setMensajes([...nuevosMensajes, { tipo: "bot", texto: respuesta.texto }])
        }

      } else if (fase === "muro") {
        // validacion de correo
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(textoUsuario)
        
        if (!emailValido) {
          setMensajes([...nuevosMensajes, {
            tipo: "bot",
            texto: "Ese correo no parece válido 🤔 ¿Puedes verificarlo? Necesitamos un correo real para enviarte tu reporte."
          }])
        } else {
          setFase("resultado")
          setMensajes([...nuevosMensajes, {
            tipo: "bot",
            texto: `¡Listo! Calculando tu huella de carbono... 🌍`
          }])
        }
      }

    } catch (error) {
      console.log("ERROR:", error)

      // fallback - preguntas hardcodeadas si OpenAI falla
      const preguntasFallback = [
        "¿En qué giro opera tu empresa y cuántos empleados tienen?",
        "¿Cuánto pagan de luz al mes aproximadamente? (en pesos está bien)",
        "¿Usan gas en sus instalaciones? ¿Cuánto pagan al mes?",
        "¿Cuántos vehículos tiene la empresa?",
        "¿Sus empleados viajan en avión por trabajo? ¿Cuántos viajes al mes?",
        "¿La mayoría de empleados llega en coche o transporte público?",
        "¿Cuánta basura genera la empresa? (una bolsa al día, un contenedor a la semana...)",
        "¿Consumen agua de forma significativa en su proceso productivo?",
      ]

      if (!window._fallbackIndex) window._fallbackIndex = 0

      if (window._fallbackIndex < preguntasFallback.length) {
        setMensajes([...nuevosMensajes, {
          tipo: "bot",
          texto: preguntasFallback[window._fallbackIndex]
        }])
        window._fallbackIndex++
      } else {
        // ya termino el fallback, manda al muro con datos estimados
        setDatos({
          kwh_mes: 5000,
          vehiculos_km_mes: 6000,
          gas_kwh_mes: 2000,
          residuos_kg_mes: 200,
          vuelos_mes: 2,
          empleados_km_mes: 3000,
          agua_m3_mes: 50
        })
        setFase("muro")
        setMensajes([...nuevosMensajes, {
          tipo: "bot",
          texto: "¡Perfecto, ya tengo toda la información! 🌱 Solo un paso más, escribe tu correo empresarial para poder recibir tu estimación"
        }])
        window._fallbackIndex = 0
      }
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

      <div className="chat-container">
        <div className="mensajes" ref={mensajesRef}>
          {mensajes.map((msg, i) => (
            <div key={i} style={{ alignSelf: msg.tipo === "bot" ? "flex-start" : "flex-end" }}>
              <div className="remitente">
                {msg.tipo === "bot" ? "Bono" : "Tú"}
              </div>
              <div className={`burbuja ${msg.tipo === "bot" ? "burbuja-bot" : "burbuja-usuario"}`}>
                {msg.texto}
              </div>
            </div>
          ))}

          {cargando && (
            <div style={{ alignSelf: "flex-start" }}>
              <div className="remitente">Bono</div>
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
            placeholder={cargando ? "Bono está escribiendo..." : "Escribe tu respuesta..."}
            disabled={cargando}
          />
          <button className="btn-enviar" onClick={enviarMensaje} disabled={cargando}>
            Enviar →
          </button>
        </div>
      </div>
      {fase === "resultado" && datos && (
        <Resultado datos={datos} nombre="Usuario" />
      )}
    </div>
  )
}

export default Calculadora
