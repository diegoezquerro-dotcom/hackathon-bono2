export const OPENAI_API_URL = "https://api.openai.com/v1/responses"

export const RESPUESTA_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    listo: {
      type: "boolean",
      description: "True only when enough operational information has been collected.",
    },
    mensaje: {
      type: ["string", "null"],
      description: "Next short user-facing question when listo is false. Null when listo is true.",
    },
    datos: {
      type: ["object", "null"],
      additionalProperties: false,
      description: "Operational diagnostic extracted from the conversation. Null until listo is true.",
      properties: {
        industria: { type: ["string", "null"] },
        pais: { type: ["string", "null"] },
        empleados: { type: ["string", "null"] },
        electricidad: {
          type: "object",
          additionalProperties: false,
          properties: {
            tiene: { type: ["boolean", "null"] },
            kwh_mes: { type: ["number", "null"] },
            nivel: { type: ["string", "null"], enum: ["bajo", "medio", "alto", null] },
            gasto_mensual: { type: ["number", "null"] },
          },
          required: ["tiene", "kwh_mes", "nivel", "gasto_mensual"],
        },
        combustibles: {
          type: "object",
          additionalProperties: false,
          properties: {
            usa_combustibles: { type: ["boolean", "null"] },
            tipo: {
              type: ["string", "null"],
              enum: ["gaseoso", "liquido", "solido", "otro", "desconocido", null],
            },
            cantidad_aproximada: { type: ["string", "null"] },
            cantidad_mensual: { type: ["number", "null"] },
            unidad: {
              type: ["string", "null"],
              enum: ["kwh", "litros", "kg", "m3", "mxn", "desconocido", null],
            },
            gasto_mensual: { type: ["number", "null"] },
            nivel: { type: ["string", "null"], enum: ["bajo", "medio", "alto", null] },
          },
          required: [
            "usa_combustibles",
            "tipo",
            "cantidad_aproximada",
            "cantidad_mensual",
            "unidad",
            "gasto_mensual",
            "nivel",
          ],
        },
        vehiculos: {
          type: "object",
          additionalProperties: false,
          properties: {
            tiene: { type: ["boolean", "null"] },
            tipo: {
              type: ["string", "null"],
              enum: [
                "pasajeros_auto_moto",
                "van",
                "carga_pesada_diesel",
                "carga_pesada_refrigerada",
                "mixto",
                "desconocido",
                null,
              ],
            },
            cantidad: { type: ["number", "null"] },
            km_mes: { type: ["number", "null"] },
            uso: { type: ["string", "null"], enum: ["bajo", "medio", "alto", null] },
          },
          required: ["tiene", "tipo", "cantidad", "km_mes", "uso"],
        },
        refrigeracion: {
          type: "object",
          additionalProperties: false,
          properties: {
            tiene: { type: ["boolean", "null"] },
            intensidad: { type: ["string", "null"], enum: ["baja", "media", "alta", null] },
          },
          required: ["tiene", "intensidad"],
        },
        materiales: {
          type: "object",
          additionalProperties: false,
          properties: {
            principales: {
              type: ["array", "null"],
              items: { type: "string" },
            },
            categorias: {
              type: ["array", "null"],
              items: {
                type: "string",
                enum: [
                  "construccion",
                  "organico",
                  "electrico_electronico",
                  "metal",
                  "plastico_papel",
                  "otro",
                  "desconocido",
                ],
              },
            },
            cantidad_aproximada: { type: ["string", "null"] },
            cantidad_mensual: { type: ["number", "null"] },
            unidad: {
              type: ["string", "null"],
              enum: ["toneladas", "unidades", "mxn", "desconocido", null],
            },
            intensidad: { type: ["string", "null"], enum: ["baja", "media", "alta", null] },
          },
          required: [
            "principales",
            "categorias",
            "cantidad_aproximada",
            "cantidad_mensual",
            "unidad",
            "intensidad",
          ],
        },
        residuos: {
          type: "object",
          additionalProperties: false,
          properties: {
            genera: { type: ["boolean", "null"] },
            tipo: {
              type: ["string", "null"],
              enum: [
                "construccion",
                "basura_general",
                "organico",
                "electrico_electronico",
                "metal",
                "plastico_papel",
                "otro",
                "desconocido",
                null,
              ],
            },
            toneladas_mes: { type: ["number", "null"] },
            descripcion: { type: ["string", "null"] },
            intensidad: { type: ["string", "null"], enum: ["baja", "media", "alta", null] },
          },
          required: ["genera", "tipo", "toneladas_mes", "descripcion", "intensidad"],
        },
        viajes: {
          type: "object",
          additionalProperties: false,
          properties: {
            vuelos_mes: { type: ["number", "null"] },
            vuelos_anio: { type: ["number", "null"] },
            vuelos_frecuentes: { type: ["boolean", "null"] },
          },
          required: ["vuelos_mes", "vuelos_anio", "vuelos_frecuentes"],
        },
        agua: {
          type: "object",
          additionalProperties: false,
          properties: {
            usa_agua_operativamente: { type: ["boolean", "null"] },
            tipo: {
              type: ["string", "null"],
              enum: ["water_supply", "water_treatment", null],
            },
            m3_mes: { type: ["number", "null"] },
            gasto_mensual: { type: ["number", "null"] },
            nivel: { type: ["string", "null"], enum: ["bajo", "medio", "alto", null] },
          },
          required: ["usa_agua_operativamente", "tipo", "m3_mes", "gasto_mensual", "nivel"],
        },
      },
      required: [
        "industria",
        "pais",
        "empleados",
        "electricidad",
        "combustibles",
        "vehiculos",
        "refrigeracion",
        "materiales",
        "residuos",
        "viajes",
        "agua",
      ],
    },
    debug: {
      type: "object",
      additionalProperties: false,
      description: "Testing diagnostics for the agent routing and extraction state.",
      properties: {
        questionCount: {
          type: "number",
          description: "Number of operational user answers processed after onboarding, including the current message.",
        },
        coveredSignals: {
          type: "array",
          items: {
            type: "string",
            enum: [
              "electricidad",
              "combustibles",
              "vehiculos",
              "refrigeracion",
              "materiales",
              "residuos",
              "viajes",
              "agua",
            ],
          },
          description: "Signals that have enough information or a reasonable inference.",
        },
        selectedIndustry: {
          type: ["string", "null"],
          description: "Industry used for Layer 1 routing.",
        },
        nextSignal: {
          type: ["string", "null"],
          enum: [
            "electricidad",
            "combustibles",
            "vehiculos",
            "refrigeracion",
            "materiales",
            "residuos",
            "viajes",
            "agua",
            null,
          ],
          description: "Signal the next question should target. Null when listo is true.",
        },
      },
      required: ["questionCount", "coveredSignals", "selectedIndustry", "nextSignal"],
    },
  },
  required: ["listo", "mensaje", "datos", "debug"],
}
