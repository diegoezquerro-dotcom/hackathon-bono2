import { useState, useRef, useEffect } from "react"
import { chatConOpenAI } from "./openai"

function Calculadora() {
  const [mensajes, setMensajes] = useState([
    { tipo: "bot", texto: "Hola 👋 Soy el asistente de Bono. Voy a ayudarte a estimar la huella de carbono de tu empresa en menos de 3 minutos. ¿Empezamos?" }
  ])
  const [input, setInput] = useState("")
  const [cargando, setCargando] = useState(false)
  const [fase, setFase] = useState("chat") // chat, muro, resultado
  const [datos, setDatos] = useState(null)
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
            texto: "¡Perfecto, ya tengo toda la información! 🌱 Para ver tu resultado completo necesito algunos datos. ¿Cuál es tu nombre?"
          }])
        } else {
          setMensajes([...nuevosMensajes, { tipo: "bot", texto: respuesta.texto }])
        }

      } else if (fase === "muro") {
        // aqui va el formulario del muro, por ahorita solo avanza
        setFase("resultado")
        setMensajes([...nuevosMensajes, {
          tipo: "bot",
          texto: `Gracias ${textoUsuario}! Calculando tu huella... 🌍`
        }])
      }

    } catch (error) {
      console.log("ERROR:", error)
      
      // fallback - preguntas hardcodeadas si gemini falla
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
          texto: "¡Perfecto, ya tengo toda la información! 🌱 ¿Cuál es tu nombre para ver tu resultado?"
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
        <div>
          <div className="logo-texto">bono₂</div>
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

    </div>
  )
}

export default Calculadora