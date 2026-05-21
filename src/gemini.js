import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

const model = genAI.getGenerativeModel({
  model: "gemini-3.5-flash",
  systemInstruction: `Eres un asistente amigable de Bono, una startup de descarbonización en LATAM.
Tu trabajo es ayudar a PyMES a estimar su huella de carbono mediante una conversación natural.

REGLAS:
- Haz UNA sola pregunta a la vez
- Usa lenguaje simple de negocios, nunca técnico
- Si el usuario da una respuesta vaga, acepta y sigue adelante con una estimación razonable
- Cuando tengas suficiente información (energía, transporte, residuos, agua), responde ÚNICAMENTE con este JSON:

{
  "listo": true,
  "datos": {
    "kwh_mes": 0,
    "vehiculos_km_mes": 0,
    "gas_kwh_mes": 0,
    "residuos_kg_mes": 0,
    "vuelos_mes": 0,
    "empleados_km_mes": 0,
    "agua_m3_mes": 0
  }
}

- Mientras no tengas suficiente info, responde normalmente con texto
- No menciones el JSON al usuario
- Sé breve y amigable, máximo 2 líneas por respuesta`
})

export async function chatConGemini(historial, mensajeUsuario) {
    const chat = model.startChat({
        history: historial
        .filter((_, i) => i !== 0) // quita el primer mensaje del bot
        .map(msg => ({
            role: msg.tipo === "bot" ? "model" : "user",
            parts: [{ text: msg.texto }]
        }))
    })

  const result = await chat.sendMessage(mensajeUsuario)
  const texto = result.response.text()

  // detecta si gemini mando el json final
  try {
    const json = JSON.parse(texto)
    if (json.listo) return { tipo: "datos", datos: json.datos }
  } catch {
    // no es json, es texto normal
  }

  return { tipo: "texto", texto }
}