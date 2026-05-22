import { crearDebugLocal, logAgentDebug } from "./openaiDebug"
import { crearInput, extraerJson, extraerTexto } from "./openaiPayload"
import { crearInstructions } from "./openaiPrompt"
import { OPENAI_API_URL, RESPUESTA_SCHEMA } from "./openaiSchema"

export async function chatConOpenAI(historial, mensajeUsuario, perfilEmpresa) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("Falta configurar VITE_OPENAI_API_KEY")
  }

  const instructions = crearInstructions(perfilEmpresa)
  const input = crearInput(historial, mensajeUsuario)
  const debugLocal = crearDebugLocal(historial, mensajeUsuario, perfilEmpresa)
  const requestBody = {
    model: import.meta.env.VITE_OPENAI_MODEL || "gpt-4.1-mini",
    instructions,
    input,
    text: {
      format: {
        type: "json_schema",
        name: "diagnostico_operativo_bono",
        strict: true,
        schema: RESPUESTA_SCHEMA,
      },
    },
    store: false,
  }

  logAgentDebug("request", {
    selectedIndustry: debugLocal.selectedIndustry,
    questionCount: debugLocal.questionCount,
    coveredSignals: debugLocal.coveredSignals,
    nextSignal: debugLocal.nextSignal,
    perfilEmpresa,
    historial,
    mensajeUsuario,
    input,
    instructions,
    industryRoute: debugLocal.industryRoute,
    selectedSignalStrategies: debugLocal.selectedSignalStrategies,
    requestBody,
  })

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  })

  logAgentDebug("http response", {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
  })

  if (!response.ok) {
    const errorText = await response.text()
    logAgentDebug("error response body", {
      selectedIndustry: debugLocal.selectedIndustry,
      questionCount: debugLocal.questionCount,
      coveredSignals: debugLocal.coveredSignals,
      nextSignal: debugLocal.nextSignal,
      errorText,
    })
    throw new Error(`OpenAI API error ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  const texto = extraerTexto(data)

  logAgentDebug("raw output", {
    selectedIndustry: debugLocal.selectedIndustry,
    questionCount: debugLocal.questionCount,
    coveredSignals: debugLocal.coveredSignals,
    nextSignal: debugLocal.nextSignal,
    data,
    texto,
  })

  if (!texto) {
    throw new Error("OpenAI no regreso texto en la respuesta")
  }

  const json = extraerJson(texto)

  logAgentDebug("parsed output", {
    selectedIndustry: json?.debug?.selectedIndustry ?? debugLocal.selectedIndustry,
    questionCount: json?.debug?.questionCount ?? debugLocal.questionCount,
    coveredSignals: json?.debug?.coveredSignals ?? debugLocal.coveredSignals,
    nextSignal: json?.debug?.nextSignal ?? debugLocal.nextSignal,
    json,
  })

  if (!json) {
    const salida = { tipo: "texto", texto }
    logAgentDebug("return", {
      selectedIndustry: debugLocal.selectedIndustry,
      questionCount: debugLocal.questionCount,
      coveredSignals: debugLocal.coveredSignals,
      nextSignal: debugLocal.nextSignal,
      salida,
    })
    return salida
  }

  if (json.listo) {
    const salida = { tipo: "datos", datos: json.datos, debug: json.debug }
    logAgentDebug("return", {
      selectedIndustry: json.debug?.selectedIndustry,
      questionCount: json.debug?.questionCount,
      coveredSignals: json.debug?.coveredSignals,
      nextSignal: json.debug?.nextSignal,
      salida,
    })
    return salida
  }

  const salida = { tipo: "texto", texto: json.mensaje || texto, debug: json.debug }
  logAgentDebug("return", {
    selectedIndustry: json.debug?.selectedIndustry,
    questionCount: json.debug?.questionCount,
    coveredSignals: json.debug?.coveredSignals,
    nextSignal: json.debug?.nextSignal,
    salida,
  })
  return salida
}
