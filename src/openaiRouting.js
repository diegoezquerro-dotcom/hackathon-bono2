const industryRoutes = {
  "Manufactura y Produccion Industrial": {
    prioritySignals: [
      "electricidad",
      "combustibles",
      "materiales",
      "residuos",
    ],
    secondarySignals: [
      "vehiculos",
      "refrigeracion",
    ],
    skipByDefault: [
      "viajes",
    ],
    routeInstruction:
      "Prioriza maquinaria, consumo electrico, combustibles de proceso, materiales fisicos y movimiento de productos.",
  },

  "Produccion y Procesamiento de Alimentos": {
    prioritySignals: [
      "electricidad",
      "refrigeracion",
      "combustibles",
      "materiales",
      "residuos",
    ],
    secondarySignals: [
      "vehiculos",
      "agua",
    ],
    skipByDefault: [
      "viajes",
    ],
    routeInstruction:
      "Prioriza refrigeracion, coccion o calor de proceso, ingredientes, empaques y desperdicio alimenticio.",
  },

  "Restaurantes, Hoteles y Hospitalidad": {
    prioritySignals: [
      "electricidad",
      "refrigeracion",
      "combustibles",
      "residuos",
    ],
    secondarySignals: [
      "materiales",
      "agua",
    ],
    skipByDefault: [
      "viajes",
    ],
    routeInstruction:
      "Prioriza cocinas, gas, refrigeracion, aire acondicionado, lavanderia, ocupacion y desperdicio alimenticio.",
  },

  "Transporte": {
    prioritySignals: [
      "vehiculos",
      "combustibles",
      "electricidad",
    ],
    secondarySignals: [
      "refrigeracion",
      "residuos",
    ],
    skipByDefault: [
      "viajes",
      "materiales",
    ],
    routeInstruction:
      "Prioriza flota propia, combustible, distancia recorrida y almacenes.",
  },

  "Retail y Comercio": {
    prioritySignals: [
      "electricidad",
      "materiales",
      "residuos",
    ],
    secondarySignals: [
      "refrigeracion",
      "vehiculos",
    ],
    skipByDefault: [
      "viajes",
      "combustibles",
    ],
    routeInstruction:
      "Prioriza tiendas fisicas, electricidad, productos vendidos, empaques y residuos.",
  },

  "Distribucion y Almacenamiento": {
    prioritySignals: [
      "vehiculos",
      "electricidad",
      "refrigeracion",
    ],
    secondarySignals: [
      "combustibles",
      "residuos",
    ],
    skipByDefault: [
      "viajes",
      "materiales",
    ],
    routeInstruction:
      "Prioriza almacenes, movimiento de carga, montacargas, electricidad y cadena fria si aplica.",
  },

  "Oficinas y Servicios Profesionales": {
    prioritySignals: [
      "electricidad",
      "viajes",
    ],
    secondarySignals: [
      "vehiculos",
      "residuos",
    ],
    skipByDefault: [
      "combustibles",
      "materiales",
      "refrigeracion",
    ],
    routeInstruction:
      "Prioriza electricidad de oficina, aire acondicionado, trabajo presencial/remoto y viajes de negocio.",
  },

  "Construccion e Infraestructura": {
    prioritySignals: [
      "combustibles",
      "vehiculos",
      "materiales",
      "residuos",
    ],
    secondarySignals: [
      "electricidad",
    ],
    skipByDefault: [
      "viajes",
      "refrigeracion",
    ],
    routeInstruction:
      "Prioriza maquinaria pesada, diesel, transporte de materiales, cemento/acero y escombro.",
  },

  "Operacion y Administracion de Inmuebles": {
    prioritySignals: [
      "electricidad",
      "refrigeracion",
      "combustibles",
      "residuos",
    ],
    secondarySignals: [
      "vehiculos",
    ],
    skipByDefault: [
      "viajes",
      "materiales",
    ],
    routeInstruction:
      "Prioriza consumo electrico del edificio, HVAC, areas comunes, elevadores, mantenimiento y residuos.",
  },

  "Agricultura y Produccion Primaria": {
    prioritySignals: [
      "combustibles",
      "vehiculos",
      "materiales",
      "electricidad",
    ],
    secondarySignals: [
      "residuos",
      "refrigeracion",
      "agua",
    ],
    skipByDefault: [
      "viajes",
    ],
    routeInstruction:
      "Prioriza tractores, maquinaria agricola, riego, fertilizantes, alimento animal, ganado y transporte.",
  },

  "Textil y Confeccion": {
    prioritySignals: [
      "electricidad",
      "combustibles",
      "materiales",
      "residuos",
    ],
    secondarySignals: [
      "refrigeracion",
      "vehiculos",
      "agua",
    ],
    skipByDefault: [
      "viajes",
    ],
    routeInstruction:
      "Prioriza maquinaria textil, costura, tintura, vapor/calderas, telas y empaques.",
  },

  "Salud y Laboratorios": {
    prioritySignals: [
      "electricidad",
      "refrigeracion",
      "residuos",
      "combustibles",
    ],
    secondarySignals: [
      "materiales",
      "vehiculos",
      "agua",
    ],
    skipByDefault: [
      "viajes",
    ],
    routeInstruction:
      "Prioriza equipo medico o de laboratorio, refrigeracion especializada, HVAC, esterilizacion y residuos clinicos.",
  },

  "Otro": {
    prioritySignals: [
      "electricidad",
      "combustibles",
      "vehiculos",
    ],
    secondarySignals: [
      "materiales",
      "residuos",
      "refrigeracion",
      "viajes",
    ],
    skipByDefault: [],
    routeInstruction:
      "Primero identifica si la operacion se parece mas a oficina, produccion, comercio, transporte o servicio fisico.",
  },
}

const signalStrategies = {
  electricidad: {
    ask: {
      question:
        "¿Tienes el consumo mensual de luz en kWh? Si no, dime cuánto pagan de luz al mes aproximadamente.",
      fallback:
        "Si no tienes kWh ni monto exacto, dime un rango aproximado del recibo mensual de luz en moneda local.",
    },
    extract: {
      targetFields: [
        "electricidad.tiene",
        "electricidad.kwh_mes",
        "electricidad.gasto_mensual",
        "electricidad.nivel",
      ],
    },
  },

  combustibles: {
    ask: {
      question:
        "¿Qué combustible usan principalmente: gas, gasolina, diésel, leña/carbón u otro? Si sabes, dime cuánto compran o gastan al mes.",
      fallback:
        "Si no sabes la cantidad exacta, dime cada cuánto compran combustible y cuánto suelen gastar cada vez.",
      omit:
        "No preguntar subtipos técnicos de DEFRA. Solo clasificar como gaseoso, líquido o sólido.",
    },
    extract: {
      targetFields: [
        "combustibles.usa_combustibles",
        "combustibles.tipo",
        "combustibles.cantidad_aproximada",
        "combustibles.cantidad_mensual",
        "combustibles.unidad",
        "combustibles.gasto_mensual",
        "combustibles.nivel",
      ],
      allowedValues: {
        tipo: [
          "gaseoso",
          "liquido",
          "solido",
          "otro",
          "desconocido",
        ],
        unidad: [
          "kwh",
          "litros",
          "kg",
          "m3",
          "mxn",
          "desconocido",
        ],
      },
    },
  },

  vehiculos: {
    ask: {
      question:
        "¿Cuántos vehículos usan para operar, de qué tipo son y aproximadamente cuántos km recorren al mes?",
      fallback:
        "Si no sabes los km, dime cuántos vehículos son y si salen pocas veces, casi diario o todo el día.",
    },
    extract: {
      targetFields: [
        "vehiculos.tiene",
        "vehiculos.tipo",
        "vehiculos.cantidad",
        "vehiculos.km_mes",
        "vehiculos.uso",
      ],
      allowedValues: {
        tipo: [
          "pasajeros_auto_moto",
          "van",
          "carga_pesada_diesel",
          "carga_pesada_refrigerada",
          "mixto",
          "desconocido",
        ],
      },
    },
  },

  refrigeracion: {
    ask: {
      question:
        "¿Cuántos refrigeradores, congeladores, cámaras frías o equipos de aire acondicionado fuerte usan?",
      fallback:
        "Si no sabes el consumo, dime si son pocos equipos, varios equipos o si la refrigeración es central para operar.",
      omit:
        "No preguntar tipo de gas refrigerante ni fugas. Demasiado técnico para el MVP.",
    },
    extract: {
      targetFields: [
        "refrigeracion.tiene",
        "refrigeracion.intensidad",
      ],
    },
  },

  materiales: {
    ask: {
      question:
        "¿Cuáles son los 2-3 materiales o productos físicos que más compran y, si sabes, cuántas toneladas compran al mes?",
      fallback:
        "Si no sabes toneladas, dime cómo compran esos materiales al mes: sacos, cajas, pallets, piezas o algún monto aproximado; si no, si el volumen mensual es bajo, medio o alto.",
    },
    extract: {
      targetFields: [
        "materiales.principales",
        "materiales.categorias",
        "materiales.cantidad_aproximada",
        "materiales.cantidad_mensual",
        "materiales.unidad",
        "materiales.intensidad",
      ],
      allowedValues: {
        categorias: [
          "construccion",
          "organico",
          "electrico_electronico",
          "metal",
          "plastico_papel",
          "otro",
          "desconocido",
        ],
        unidad: [
          "toneladas",
          "unidades",
          "mxn",
          "desconocido",
        ],
      },
    },
  },

  residuos: {
    ask: {
      question:
        "¿Qué residuo generan más: construcción/escombro, basura general, orgánico, electrónicos, metal, plástico/papel u otro? Si sabes, dime cuántas toneladas generan al mes y si se recicla, composta o va a basura general.",
      fallback:
        "Si no sabes toneladas, dime cada cuánto lo recogen y cuántas bolsas, botes o contenedores llenan por recolección; si no, si generan poco, medio o mucho residuo al mes.",
      omit:
        "Omitir open-loop, closed-loop, incineration with energy recovery y anaerobic digestion en la pregunta. Mapear internamente si hay información suficiente.",
    },
    extract: {
      targetFields: [
        "residuos.genera",
        "residuos.tipo",
        "residuos.toneladas_mes",
        "residuos.descripcion",
        "residuos.intensidad",
      ],
      allowedValues: {
        tipo: [
          "construccion",
          "basura_general",
          "organico",
          "electrico_electronico",
          "metal",
          "plastico_papel",
          "otro",
          "desconocido",
        ],
      },
    },
  },

  viajes: {
    ask: {
      question:
        "¿Hacen vuelos de trabajo? Si sí, ¿cuántos al mes o al año aproximadamente?",
      fallback:
        "Si no tienes el número exacto, dime si suelen volar cada mes, cada trimestre, una o dos veces al año, o casi nunca.",
      omit:
        "No preguntar clase de vuelo ni distancia exacta para MVP.",
    },
    extract: {
      targetFields: [
        "viajes.vuelos_mes",
        "viajes.vuelos_anio",
        "viajes.vuelos_frecuentes",
      ],
    },
  },

  agua: {
    ask: {
      question:
        "¿El uso de agua es una parte importante de la operación? Si sabes, dime cuántos m3 usan al mes o cuánto pagan.",
      fallback:
        "Si no sabes m3 ni monto, dime para qué usan agua en la operación y con qué frecuencia; si no, si el uso mensual es bajo, medio o alto.",
      omit:
        "No preguntar agua por defecto en oficinas, retail simple o servicios profesionales.",
    },
    extract: {
      targetFields: [
        "agua.usa_agua_operativamente",
        "agua.tipo",
        "agua.m3_mes",
        "agua.gasto_mensual",
        "agua.nivel",
      ],
      allowedValues: {
        tipo: [
          "water_supply",
          "water_treatment",
        ],
      },
    },
    applicability: {
      useOnlyForIndustries: [
        "Produccion y Procesamiento de Alimentos",
        "Restaurantes, Hoteles y Hospitalidad",
        "Agricultura y Produccion Primaria",
        "Textil y Confeccion",
        "Salud y Laboratorios",
      ],
    },
  },
}

export function obtenerIndustryRoute(industria) {
  if (!industria) return industryRoutes.Otro

  return industryRoutes[industria] || industryRoutes.Otro
}

export function obtenerSignalStrategies(rutaIndustria) {
  const signalOrder = [
    ...rutaIndustria.prioritySignals,
    ...rutaIndustria.secondarySignals,
  ]

  return signalOrder
    .map((signal) => [signal, signalStrategies[signal]])
    .filter(([, strategy]) => Boolean(strategy))
}

export function obtenerPreguntaInicial(industria) {
  const rutaIndustria = obtenerIndustryRoute(industria)
  const primeraSenal = rutaIndustria.prioritySignals[0]
  const estrategia = signalStrategies[primeraSenal]

  return estrategia?.ask?.question
    ? `Listo. Empecemos con lo mas importante: ${estrategia.ask.question}`
    : "Listo. Empecemos con lo mas importante: tienes el consumo mensual de luz en kWh o un monto aproximado del recibo?"
}

export function formatearSignalStrategies(rutaIndustria) {
  return obtenerSignalStrategies(rutaIndustria)
    .map(([signal, strategy]) => {
      const allowedValues = strategy.extract.allowedValues
        ? `\n  allowedValues: ${JSON.stringify(strategy.extract.allowedValues)}`
        : ""
      const applicability = strategy.applicability
        ? `\n  applicability: ${JSON.stringify(strategy.applicability)}`
        : ""
      const omit = strategy.ask.omit ? `\n  omit: ${strategy.ask.omit}` : ""
      const fallback = strategy.ask.fallback ? `\n  fallback: ${strategy.ask.fallback}` : ""

      return `- ${signal}:
  question: ${strategy.ask.question}${fallback}${omit}
  targetFields: ${strategy.extract.targetFields.join(", ")}${allowedValues}${applicability}`
    })
    .join("\n")
}
