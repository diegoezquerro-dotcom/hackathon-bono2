import { useState, useRef, useEffect } from "react"
import { chatConOpenAI } from "./openai"
import Resultado from "./resultado"
import { calcularHuella } from "./calculos"
import { guardarLead } from "./leads"
import logo from "../brand/assets/logos/transparent/bono-logo-original-large-transparent.png"

function Calculadora() {
  const [mensajes, setMensajes] = useState([
    { tipo: "bot", texto: "Hola, soy B2 👋 El asistente de Bono que te ayudará a conocer el impacto de carbono de tu empresa. ¿Con quién tengo el gusto? (nombre y apellido)" }
  ])
  const [input, setInput] = useState("")
  const [cargando, setCargando] = useState(false)
  const [fase, setFase] = useState("nombre") // nombre, sector, chat, muro_empresa, muro_correo, resultado
  const [datos, setDatos] = useState(null)
  const [nombreUsuario, setNombreUsuario] = useState("")
  const [empresaUsuario, setEmpresaUsuario] = useState("")
  const [giroUsuario, setGiroUsuario] = useState("")
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

    const nuevosMensajes = [...mensajes, { tipo: "usuario", texto: textoUsuario }]
    setMensajes(nuevosMensajes)
    setCargando(true)

    try {
      // fase 1 - pide nombre
      if (fase === "nombre") {
        setNombreUsuario(textoUsuario)
        setFase("sector")
        setMensajes([...nuevosMensajes, {
          tipo: "bot",
          texto: `¡Hola ${textoUsuario}! 😊 Para poder darte una estimación más precisa, ¿en qué sector está haciendo el cambio tu empresa? (manufactura, servicios, retail, logística, etc.)`
        }])

      // fase 2 - pide sector
      } else if (fase === "sector") {
        setGiroUsuario(textoUsuario)
        setFase("chat")
        setMensajes([...nuevosMensajes, {
          tipo: "bot",
          texto: `Perfecto, sector ${textoUsuario}. Ahora vamos a estimar tu huella de carbono con unas preguntas rápidas 🌱`
        }])

      // fase 3 - chat con openai
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

      // fase 4 - pide empresa
      } else if (fase === "muro_empresa") {
        setEmpresaUsuario(textoUsuario)
        setFase("muro_correo")
        setMensajes([...nuevosMensajes, {
          tipo: "bot",
          texto: `¡Perfecto! Y por último, ¿cuál es tu correo empresarial? Así te enviamos el reporte completo 📩`
        }])

      // fase 5 - pide correo y guarda lead
      } else if (fase === "muro_correo") {
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(textoUsuario)

        if (!emailValido) {
          setMensajes([...nuevosMensajes, {
            tipo: "bot",
            texto: "Ese correo no parece válido 🤔 ¿Puedes verificarlo? Necesitamos un correo real para enviarte tu reporte."
          }])
        } else {
          const resultado = calcularHuella(datos)
          await guardarLead({
            nombre: nombreUsuario,
            empresa: empresaUsuario,
            correo: textoUsuario,
            giro: giroUsuario,
            huella: resultado.totalToneladas
          })
          setFase("resultado")
          setMensajes([...nuevosMensajes, {
            tipo: "bot",
            texto: `¡Listo ${nombreUsuario}! Aquí está la estimación de huella de carbono de ${empresaUsuario} 🌍`
          }])
        }
      }

    } catch (error) {
      console.log("ERROR:", error)

      // fallback si openai falla
      const preguntasFallback = [
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
        setDatos({
          kwh_mes: 5000,
          vehiculos_km_mes: 6000,
          gas_kwh_mes: 2000,
          residuos_kg_mes: 200,
          vuelos_mes: 2,
          empleados_km_mes: 3000,
          agua_m3_mes: 50
        })
        setFase("muro_empresa")
        setMensajes([...nuevosMensajes, {
          tipo: "bot",
          texto: `¡Listo ${nombreUsuario}! Tu estimación está lista 🎉 ¿A nombre de qué empresa genero el reporte?`
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
        <Resultado datos={datos} nombre={nombreUsuario} empresa={empresaUsuario} />
      )}

    </div>
  )
}

export default Calculadora