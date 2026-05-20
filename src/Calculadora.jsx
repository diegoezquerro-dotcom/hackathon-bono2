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
  const [fase, setFase] = useState("inicio") // inicio, preguntas, muro, resultado

  const enviarMensaje = () => {
    if (!input.trim()) return

    // agrega mensaje del usuario
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
        // siguiente pregunta
        setMensajes([...nuevosMensajes, { tipo: "bot", texto: preguntas[preguntaActual + 1].texto }])
        setPreguntaActual(preguntaActual + 1)
      } else {
        // terminaron las preguntas
        setFase("muro")
        setMensajes([...nuevosMensajes, { tipo: "bot", texto: "¡Listo! Ya tengo todo lo que necesito. Escribe tu nombre para ver tu resultado 🌱" }])
      }
    }

    setInput("")
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") enviarMensaje()
  }

  return (
    <div>
      <h2>Calculadora de Huella de Carbono</h2>

      <div>
        {mensajes.map((msg, i) => (
          <div key={i}>
            <strong>{msg.tipo === "bot" ? "Bono" : "Tú"}:</strong> {msg.texto}
          </div>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe tu respuesta..."
      />
      <button onClick={enviarMensaje}>Enviar</button>
    </div>
  )
}

export default Calculadora