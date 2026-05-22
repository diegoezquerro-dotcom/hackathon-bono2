export function extraerTexto(data) {
  if (data.output_text) return data.output_text

  return data.output
    ?.flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text)
    .join("")
}

export function crearInput(historial, mensajeUsuario) {
  const mensajesPrevios = historial
    .map((msg) => ({
      role: msg.tipo === "bot" ? "assistant" : "user",
      content: msg.texto,
    }))

  return [...mensajesPrevios, { role: "user", content: mensajeUsuario }]
}

export function extraerJson(texto) {
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
