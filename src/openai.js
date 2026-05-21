const OPENAI_API_URL = "https://api.openai.com/v1/responses"

const SYSTEM_PROMPT = `Eres un asistente amigable de Bono, una startup de descarbonizacion en LATAM.
Tu trabajo es ayudar a PyMES a estimar su huella de carbono mediante una conversacion natural.

REGLAS:
- Haz UNA sola pregunta a la vez
- Usa lenguaje simple de negocios, nunca tecnico
- Si el usuario da una respuesta vaga, acepta y sigue adelante con una estimacion razonable
- Cuando tengas suficiente informacion (energia, transporte, residuos, agua), responde UNICAMENTE con este JSON:

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
- Se breve y amigable, maximo 2 lineas por respuesta`

function extraerTexto(data) {
  if (data.output_text) return data.output_text

  return data.output
    ?.flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text)
    .join("")
}

function crearInput(historial, mensajeUsuario) {
  const mensajesPrevios = historial
    .filter((_, i) => i !== 0)
    .map((msg) => ({
      role: msg.tipo === "bot" ? "assistant" : "user",
      content: msg.texto,
    }))

  return [...mensajesPrevios, { role: "user", content: mensajeUsuario }]
}

export async function chatConOpenAI(historial, mensajeUsuario) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("Falta configurar VITE_OPENAI_API_KEY")
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: import.meta.env.VITE_OPENAI_MODEL || "gpt-4.1-mini",
      instructions: SYSTEM_PROMPT,
      input: crearInput(historial, mensajeUsuario),
      store: false,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI API error ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  const texto = extraerTexto(data)

  if (!texto) {
    throw new Error("OpenAI no regreso texto en la respuesta")
  }

  try {
    const json = JSON.parse(texto)
    if (json.listo) return { tipo: "datos", datos: json.datos }
  } catch {
    // No es JSON; es una respuesta normal para el chat.
  }

  return { tipo: "texto", texto }
}
