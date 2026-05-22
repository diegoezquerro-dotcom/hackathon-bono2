import { useState, useRef, useEffect } from "react"
import { chatConOpenAI } from "./openai"
import Resultado from "./resultado"
import { calcularHuella } from "./calculos"
import logo from "../brand/assets/logos/transparent/bono-logo-original-large-transparent.png"
import { guardarLeadSupabase, iniciarSesion, completarSesion, registrarClickCalendly } from "./supabase"

// preguntas fallback con sus ids para mapear respuestas
const PREGUNTAS_FALLBACK = [
  { id: "kwh_mes", texto: "¿Cuánto pagan de luz al mes aproximadamente? (en pesos está bien)", conversion: (r) => parseFloat(r) / 2.8 || 3000 },
  { id: "gas_kwh_mes", texto: "¿Usan gas en sus instalaciones? ¿Cuánto pagan al mes? (si no usan, escribe 0)", conversion: (r) => parseFloat(r) / 1.2 || 0 },
  { id: "vehiculos_km_mes", texto: "¿Cuántos vehículos tiene la empresa? (escribe el número)", conversion: (r) => (parseFloat(r) || 0) * 2000 },
  { id: "vuelos_mes", texto: "¿Sus empleados viajan en avión por trabajo? ¿Cuántos viajes al mes aproximadamente? (si no, escribe 0)", conversion: (r) => parseFloat(r) || 0 },
  { id: "empleados_km_mes", texto: "¿La mayoría de empleados llega en coche o transporte público? (escribe cuántos en coche)", conversion: (r) => (parseFloat(r) || 0) * 20 * 22 },
  { id: "residuos_kg_mes", texto: "¿Cuánta basura genera la empresa? (una bolsa al día = 5, un contenedor a la semana = 500)", conversion: (r) => parseFloat(r) || 100 },
  { id: "agua_m3_mes", texto: "¿Consumen agua de forma significativa? ¿Cuántos m³ al mes aproximadamente? (si no sabes, escribe 0)", conversion: (r) => parseFloat(r) || 0 },
]

function Calculadora() {
  const [mensajes, setMensajes] = useState([
    { tipo: "bot", texto: "Hola, soy B2 👋 El asistente de Bono que te ayudará a conocer el impacto de carbono de tu empresa. ¿Con quién tengo el gusto? (nombre y apellido)" }
  ])
  const [input, setInput] = useState("")
  const [cargando, setCargando] = useState(false)
  const [fase, setFase] = useState("nombre")
  const [datos, setDatos] = useState(null)
  const [nombreUsuario, setNombreUsuario] = useState("")
  const [empresaUsuario, setEmpresaUsuario] = useState("")
  const [giroUsuario, setGiroUsuario] = useState("")
  const [correoUsuario, setCorreoUsuario] = useState("")
  const [fallbackIndex, setFallbackIndex] = useState(0)
  const [respuestasFallback, setRespuestasFallback] = useState({})
  const [enFallback, setEnFallback] = useState(false)
  const mensajesRef = useRef(null)

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight
    }
  }, [mensajes])

  const procesarFallback = (textoUsuario, nuevosMensajes, indexActual, respuestasActuales) => {
    const preguntaActual = PREGUNTAS_FALLBACK[indexActual]
    const valorConvertido = preguntaActual.conversion(textoUsuario)
    const nuevasRespuestas = { ...respuestasActuales, [preguntaActual.id]: valorConvertido }
    setRespuestasFallback(nuevasRespuestas)

    const siguienteIndex = indexActual + 1

    if (siguienteIndex < PREGUNTAS_FALLBACK.length) {
      setFallbackIndex(siguienteIndex)
      setMensajes([...nuevosMensajes, {
        tipo: "bot",
        texto: PREGUNTAS_FALLBACK[siguienteIndex].texto
      }])
    } else {
      // todas las preguntas respondidas, calcula con datos reales del usuario
      setDatos(nuevasRespuestas)
      setFase("muro_empresa")
      setMensajes([...nuevosMensajes, {
        tipo: "bot",
        texto: `¡Listo ${nombreUsuario}! Tu estimación está lista 🎉 ¿A nombre de qué empresa genero el reporte?`
      }])
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
      // si estamos en fallback Y no estamos en el muro, procesar fallback
      if (enFallback && fase === "chat") {
        procesarFallback(textoUsuario, nuevosMensajes, fallbackIndex, respuestasFallback)
        setCargando(false)
        return
      }

      if (fase === "nombre") {
        setNombreUsuario(textoUsuario)
        setFase("sector")
        setMensajes([...nuevosMensajes, {
          tipo: "bot",
          texto: `¡Hola ${textoUsuario}! 😊 Para poder darte una estimación más precisa, ¿en qué sector está haciendo el cambio tu empresa? (manufactura, servicios, retail, logística, etc.)`
        }])

      } else if (fase === "sector") {
        setGiroUsuario(textoUsuario)
        iniciarSesion(textoUsuario)
        setFase("chat")
        setMensajes([...nuevosMensajes, {
          tipo: "bot",
          texto: `Perfecto, sector ${textoUsuario}. Ahora vamos a estimar tu huella de carbono con unas preguntas rápidas 🌱`
        }])

      } else if (fase === "chat") {
        const respuesta = await chatConOpenAI(mensajes, textoUsuario)

        if (respuesta.tipo === "datos") {
          console.log("DATOS:", respuesta.datos)
          setDatos(respuesta.datos)
          setFase("muro_empresa")
          setMensajes([...nuevosMensajes, {
            tipo: "bot",
            texto: `¡Listo ${nombreUsuario}! Tu estimación está lista 🎉 ¿A nombre de qué empresa genero el reporte?`
          }])
        } else {
          setMensajes([...nuevosMensajes, { tipo: "bot", texto: respuesta.texto }])
        }

      } else if (fase === "muro_empresa") {
        setEmpresaUsuario(textoUsuario)
        setFase("muro_correo")
        setMensajes([...nuevosMensajes, {
          tipo: "bot",
          texto: `¡Perfecto! Y por último, ¿cuál es tu correo empresarial? Así te enviamos el reporte completo 📩`
        }])

      } else if (fase === "muro_correo") {
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(textoUsuario)

        if (!emailValido) {
          setMensajes([...nuevosMensajes, {
            tipo: "bot",
            texto: "Ese correo no parece válido 🤔 ¿Puedes verificarlo? Necesitamos un correo real para enviarte tu reporte."
          }])
        } else {
          const resultado = calcularHuella(datos)
          await guardarLeadSupabase({
            nombre: nombreUsuario,
            empresa: empresaUsuario,
            correo: textoUsuario,
            giro: giroUsuario,
            huella: resultado.totalToneladas
          })
          setCorreoUsuario(textoUsuario)
          await completarSesion()
          setFase("resultado")
          setMensajes([...nuevosMensajes, {
            tipo: "bot",
            texto: `¡Listo ${nombreUsuario}! Aquí está la estimación de huella de carbono de ${empresaUsuario} 🌍`
          }])
        }
      }

    } catch (error) {
      console.log("ERROR:", error)

      // activa fallback y empieza desde donde quedó
      if (!enFallback) {
        setEnFallback(true)
        setFallbackIndex(0)
        setRespuestasFallback({})
        setMensajes([...nuevosMensajes, {
          tipo: "bot",
          texto: `Continuemos. ${PREGUNTAS_FALLBACK[0].texto}`
        }])
      } else {
        // ya estaba en fallback y fallo de nuevo, intenta procesar igual
        procesarFallback(textoUsuario, nuevosMensajes, fallbackIndex, respuestasFallback)
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
                {msg.tipo === "bot" ? "B2" : nombreUsuario || "Tú"}
              </div>
              <div className={`burbuja ${msg.tipo === "bot" ? "burbuja-bot" : "burbuja-usuario"}`}>
                {msg.texto}
              </div>
            </div>
          ))}

          {cargando && (
            <div style={{ alignSelf: "flex-start" }}>
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
            placeholder={cargando ? "B2 está escribiendo..." : "Escribe tu respuesta..."}
            disabled={cargando}
          />
          <button className="btn-enviar" onClick={enviarMensaje} disabled={cargando}>
            Enviar →
          </button>
        </div>
      </div>

      {fase === "resultado" && datos && (
        <Resultado
          datos={datos}
          nombre={nombreUsuario}
          empresa={empresaUsuario}
          correo={correoUsuario}
        />
      )}

    </div>
  )
}

export default Calculadora