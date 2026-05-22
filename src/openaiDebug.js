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

  return {
    questionCount,
    selectedIndustry: perfilEmpresa.industria || null,
    coveredSignals: null,
    nextSignal: null,
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
