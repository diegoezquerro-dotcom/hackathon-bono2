const OPENAI_API_URL = "https://api.openai.com/v1/responses"

const SYSTEM_PROMPT = `Eres un asistente amigable de Bono, una startup de descarbonizacion en LATAM.
Tu trabajo es estimar la huella de carbono de una PyME mediante una conversacion natural y rapida.

REGLAS DE CONVERSACION:
- Haz UNA sola pregunta a la vez, corta y simple
- Nunca preguntes datos tecnicos que un director general no sabria de memoria
- Si el usuario no sabe algo, acepta una estimacion o pasa a la siguiente pregunta
- Se conversacional y amigable, maximo 2 lineas por respuesta
- No uses terminos como "kg CO2", "emisiones", "alcance 1/2/3", "kWh"

PREGUNTAS QUE DEBES HACER (en lenguaje simple):
1. Cuantos empleados tiene la empresa y en que giro operan? (ej: manufactura, servicios, retail)
2. Cuanto pagan de luz al mes aproximadamente? (en pesos esta bien)
3. Usan gas en sus instalaciones? Cuanto pagan al mes?
4. Cuantos vehiculos tiene la empresa? (camionetas, autos, camiones de reparto)
5. Sus empleados viajan en avion por trabajo? Cuantos viajes al mes aproximadamente?
6. La mayoria de empleados llega al trabajo en coche, transporte publico o mixto?
7. Tienen idea de cuanta basura genera la empresa? (una bolsa al dia, un contenedor a la semana, etc)
8. Consumen agua de forma significativa en su proceso productivo?

CONVERSION QUE DEBES HACER INTERNAMENTE:
- Si dan pesos de luz, asume 2.80 pesos por kWh
- Si dan pesos de gas, asume 1.20 pesos por kWh
- Si dicen "varios vehiculos", asume 3 vehiculos, 2000 km/mes cada uno
- Si dicen "una bolsa al dia", asume 5 kg/dia = 150 kg/mes
- Si dicen "un contenedor a la semana", asume 500 kg/mes
- Si no saben de vuelos, asume 0
- Si dicen "mixto" en transporte, asume 50% en coche
- Para empleados en coche, asume 20 km/dia por persona

CUANDO TENGAS SUFICIENTE INFO (minimo: luz, giro, empleados y algo de transporte), responde UNICAMENTE con este JSON sin texto adicional:

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

No menciones el JSON al usuario. No esperes tener todos los datos perfectos; con estimaciones razonables es suficiente.`

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

function extraerJson(texto) {
  const limpio = texto
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim()

  try {
    return JSON.parse(limpio)
  } catch {
    const inicio = limpio.indexOf("{")
    const fin = limpio.lastIndexOf("}")

    if (inicio === -1 || fin === -1 || fin <= inicio) return null

    try {
      return JSON.parse(limpio.slice(inicio, fin + 1))
    } catch {
      return null
    }
  }
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

  const json = extraerJson(texto)
  if (json?.listo) return { tipo: "datos", datos: json.datos }

  return { tipo: "texto", texto }
}
