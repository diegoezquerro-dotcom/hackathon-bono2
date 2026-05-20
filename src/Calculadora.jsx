import { useState } from "react"

const preguntas = [
  { id: "empleados", texto: "¿Cuántos empleados tiene tu empresa?" },
  { id: "kwh_mes", texto: "¿Cuánto pagas aproximadamente de luz al mes? (en pesos)" },
  { id: "vehiculos_km", texto: "¿Cuántos vehículos opera la empresa y cuántos km recorren en total al mes?" },
  { id: "gas_pesos", texto: "¿Usas gas natural o LP? ¿Cuánto pagas al mes aproximadamente?" },
  { id: "residuos_kg", texto: "¿Cuánta basura genera tu empresa al mes? (en kg aproximadamente)" },
  { id: "vuelos", texto: "¿Cuántos vuelos de trabajo hacen tus empleados al mes en total?" },
  { id: "empleados_km", texto: "¿Cuántos empleados van al trabajo en coche propio y qué distancia recorren al día?" },
  { id: "agua_m3", texto: "¿Tienes recibo de agua? ¿Cuántos metros cúbicos consumes al mes?" },
]

function Calculadora() {
  const [mensajes, setMensajes] = useState([
    { tipo: "bot", texto: "Hola 👋 Voy a ayudarte a calcular la huella de carbono de tu empresa en menos de 3 minutos. ¿Empezamos?" }
  ])
  const [input, setInput] = useState("")
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestas, setRespuestas] = useState({})
  const [fase, setFase] = useState("inicio")

  const enviarMensaje = () => {
    if (!input.trim()) return

    const nuevosMensajes = [...mensajes, { tipo: "usuario", texto: input }]

    if (fase === "inicio") {
      setFase("preguntas")
      setMensajes([...nuevosMensajes, { tipo: "bot", texto: preguntas[0].texto }])
      setPreguntaActual(0)

    } else if (fase === "preguntas") {
      const preguntaId = preguntas[preguntaActual].id
      const nuevasRespuestas = { ...respuestas, [preguntaId]: input }
      setRespuestas(nuevasRespuestas)

      if (preguntaActual + 1 < preguntas.length) {
        setMensajes([...nuevosMensajes, { tipo: "bot", texto: preguntas[preguntaActual + 1].texto }])
        setPreguntaActual(preguntaActual + 1)
      } else {
        setFase("muro")
        setMensajes([...nuevosMensajes, { tipo: "bot", texto: "¡Listo! Ya tengo todo lo que necesito. Escribe tu nombre para ver tu resultado 🌱" }])
      }

    } else if (fase === "muro") {
      setFase("resultado")
      setMensajes([...nuevosMensajes, {
        tipo: "bot",
        texto: `Gracias ${input}! 🎉 Calculando tu huella de carbono...`
      }])
    }

    setInput("")
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") enviarMensaje()
  }

  return (
    <div className="app">

      {/* header */}
      <div className="header">
        <div>
          <div className="logo-texto">bono₂</div>
          <div className="tagline">cutting emissions</div>
        </div>
      </div>

      {/* chat */}
      <div className="chat-container">
        <div className="mensajes">
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
        </div>

        <div className="input-area">
          <input
            className="input-texto"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu respuesta..."
          />
          <button className="btn-enviar" onClick={enviarMensaje}>
            Enviar →
          </button>
        </div>
      </div>

    </div>
  )
}

export default Calculadora