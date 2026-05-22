import { obtenerIndustryRoute, obtenerSignalStrategies } from "./openaiRouting"

function contarPreguntasOperativas(historial, mensajeUsuario) {
  return [
    ...historial.filter((msg) => msg.tipo === "usuario" && msg.texto?.trim()),
    { tipo: "usuario", texto: mensajeUsuario },
  ].filter((msg) => msg.texto?.trim()).length
}

export function crearDebugLocal(historial, mensajeUsuario, perfilEmpresa = {}) {
  const rutaIndustria = obtenerIndustryRoute(perfilEmpresa.industria)
  const questionCount = contarPreguntasOperativas(historial, mensajeUsuario)
  const orderedSignals = [
    ...rutaIndustria.prioritySignals,
    ...rutaIndustria.secondarySignals,
  ]

  return {
    questionCount,
    coveredSignalsEstimate: orderedSignals.slice(0, Math.max(0, questionCount - 1)),
    selectedIndustry: perfilEmpresa.industria || null,
    nextSignalEstimate: orderedSignals[questionCount - 1] || null,
    industryRoute: rutaIndustria,
    selectedSignalStrategies: obtenerSignalStrategies(rutaIndustria).map(([signal, strategy]) => ({
      signal,
      ...strategy,
    })),
  }
}

export function logAgentDebug(label, payload) {
  console.log(`[Bono agent debug] ${label}`, payload)
}
