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
      setMensajes([...nuevosMensajes, {
        tipo: "bot",
        texto: "Hubo un error conectando con el servidor. Intenta de nuevo."
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