// factores de emision - fuente: DEFRA 2025 UK Government GHG Conversion Factors

const FACTORES = {
  // alcance 2 - electricidad (kg CO2e por kWh). Los factores fuente estan en t CO2e/MWh;
  // el valor numerico es equivalente porque 1 t/MWh = 1 kg/kWh.
  electricidad_kwh_default: 0.177,
  electricidad_kwh_por_pais: {
    mexico: 0.444,
    colombia: 0.165,
    brasil: 0.1295,
    chile: 0.4,
    argentina: 0.283,
    peru: 0.2255,
  },

  // alcance 1 - gas natural (kg CO2e por kWh)
  gas_kwh: 0.2027,
  combustibles_kwh_por_tipo: {
    gaseoso: 0.2027,
    liquido: 0.25953,
    solido: 0.33944,
    otro: 0.2027,
    desconocido: 0.2027,
  },

  // alcance 1 - vehiculos promedio diesel (kg CO2e por km)
  vehiculo_km: 0.17174,
  vehiculo_km_por_tipo: {
    pasajeros_auto_moto: 0.17174,
    van: 0.19260,
    carga_pesada_diesel: 0.67912,
    carga_pesada_refrigerada: 0.80843,
    mixto: 0.32597,
    desconocido: 0.17174,
  },

  // alcance 3 - materiales comprados (kg CO2e por tonelada de material)
  materiales_kg_co2e_por_tonelada: {
    construccion: 269.50416,
    organico: 114.90473,
    electrico_electronico: 4633.47826,
    metal: 3473.11953,
    plastico_papel: 2916.50513,
    otro: 3701.40359,
    desconocido: 3701.40359,
  },

  // alcance 3 - residuos comerciales a relleno (kg CO2e por tonelada)
  residuos_tonelada: 497.24244,
  residuos_kg_co2e_por_tonelada: {
    construccion: 1.26338,
    basura_general: 497.24244,
    organico: 700.30886,
    electrico_electronico: 8.98311,
    metal: 8.98311,
    plastico_papel: 1164.48940,
    otro: 497.24244,
    desconocido: 497.24244,
  },

  // alcance 3 - vuelos cortos haul promedio (kg CO2e por pasajero km)
  vuelo_pasajero_km: 0.17465,

  // alcance 3 - transporte empleados auto promedio (kg CO2e por km)
  empleado_km: 0.17174,

  // alcance 3 - agua (kg CO2e por m3)
  agua_m3: 0.19130,
  agua_m3_por_tipo: {
    water_supply: 0.19130,
    water_treatment: 0.17088,
  },
}

// conversion de pesos a kwh (estimado promedio mexico 2024)
const PRECIO_KWH_MXN = 2.8
const PRECIO_GAS_KWH_MXN = 1.2
const PRECIO_AGUA_M3_MXN = 25
const MESES_POR_ANIO = 12
const OFICINA_ESTANDAR_KWH_MES = 700
const DIESEL_KG_CO2E_POR_LITRO = 2.68
const TANQUE_PICKUP_DIESEL_LITROS = 80
const REDUCCION_DIESEL_EVITADA = 0.15

// Supuestos MVP para convertir respuestas operativas a la unidad usada por los factores.
const KWH_COMBUSTIBLE_POR_LITRO = 9.8
const KWH_COMBUSTIBLE_POR_M3_GASEOSO = 10.55
const KWH_COMBUSTIBLE_POR_KG = {
  gaseoso: 13.6,
  liquido: 12,
  solido: 6.7,
  otro: 8,
  desconocido: 8,
}

function normalizarTexto(valor = "") {
  return valor
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function factorElectricidadPorPais(pais) {
  const texto = normalizarTexto(pais)

  if (texto.includes("mex")) return FACTORES.electricidad_kwh_por_pais.mexico
  if (texto.includes("colombia")) return FACTORES.electricidad_kwh_por_pais.colombia
  if (texto.includes("brasil") || texto.includes("brazil")) return FACTORES.electricidad_kwh_por_pais.brasil
  if (texto.includes("chile")) return FACTORES.electricidad_kwh_por_pais.chile
  if (texto.includes("argentina")) return FACTORES.electricidad_kwh_por_pais.argentina
  if (texto.includes("peru")) return FACTORES.electricidad_kwh_por_pais.peru

  return FACTORES.electricidad_kwh_default
}

function numeroValido(valor) {
  return typeof valor === "number" && Number.isFinite(valor) && valor > 0
}

function estimarEmpleados(perfilEmpresa = {}) {
  const texto = perfilEmpresa.empleados || ""
  const numeros = texto.match(/\d+/g)?.map(Number) || []

  if (numeros.length >= 2) return Math.round((numeros[0] + numeros[1]) / 2)
  if (numeros.length === 1) return numeros[0]

  return 20
}

function nivel(valor, fallback = "medio") {
  return valor || fallback
}

function nivelFemenino(valor, fallback = "media") {
  return valor || fallback
}

function categoria(valor, fallback = "desconocido") {
  return valor || fallback
}

function completarDatos(datos, perfilEmpresa) {
  return {
    ...datos,
    industria: datos.industria || perfilEmpresa.industria || null,
    pais: datos.pais || perfilEmpresa.pais || null,
    empleados: datos.empleados || perfilEmpresa.empleados || null,
  }
}

function estimarElectricidadKwh(datos, empleados) {
  const electricidad = datos.electricidad || {}

  if (electricidad.tiene === false) return 0
  if (numeroValido(electricidad.kwh_mes)) return electricidad.kwh_mes

  const gastoKwh = numeroValido(electricidad.gasto_mensual)
    ? electricidad.gasto_mensual / PRECIO_KWH_MXN
    : 0

  const kwhPorNivel = {
    bajo: Math.max(800, empleados * 20),
    medio: Math.max(3500, empleados * 50),
    alto: Math.max(12000, empleados * 120),
  }[nivel(electricidad.nivel)] || 3500

  const refrigeracionKwh = {
    baja: 500,
    media: 1500,
    alta: 4000,
  }[nivelFemenino(datos.refrigeracion?.intensidad)] || 0

  const extraRefrigeracion = datos.refrigeracion?.tiene ? refrigeracionKwh : 0

  return (gastoKwh || kwhPorNivel) + extraRefrigeracion
}

function estimarCombustiblesKwh(datos) {
  const combustibles = datos.combustibles || {}

  if (combustibles.usa_combustibles === false) return 0

  const cantidad = numeroValido(combustibles.cantidad_mensual)
    ? combustibles.cantidad_mensual
    : 0
  const unidad = combustibles.unidad || "desconocido"
  const tipo = categoria(combustibles.tipo)

  if (cantidad) {
    if (unidad === "kwh") return cantidad
    if (unidad === "litros") return cantidad * KWH_COMBUSTIBLE_POR_LITRO
    if (unidad === "m3") return cantidad * KWH_COMBUSTIBLE_POR_M3_GASEOSO
    if (unidad === "kg") return cantidad * (KWH_COMBUSTIBLE_POR_KG[tipo] || KWH_COMBUSTIBLE_POR_KG.desconocido)
    if (unidad === "mxn") return cantidad / PRECIO_GAS_KWH_MXN
  }

  if (numeroValido(combustibles.gasto_mensual)) {
    return combustibles.gasto_mensual / PRECIO_GAS_KWH_MXN
  }

  return {
    bajo: 600,
    medio: 2500,
    alto: 8000,
  }[nivel(combustibles.nivel)] || 0
}

function factorCombustibleKwh(datos) {
  const tipo = categoria(datos.combustibles?.tipo)

  return FACTORES.combustibles_kwh_por_tipo[tipo] || FACTORES.combustibles_kwh_por_tipo.desconocido
}

function factorVehiculoKm(tipo) {
  return FACTORES.vehiculo_km_por_tipo[categoria(tipo)] || FACTORES.vehiculo_km_por_tipo.desconocido
}

function estimarKmVehiculos(datos) {
  const vehiculos = datos.vehiculos || {}

  if (numeroValido(vehiculos.km_mes)) return vehiculos.km_mes

  const cantidad = numeroValido(vehiculos.cantidad) ? vehiculos.cantidad : 0
  const kmVehiculos = vehiculos.tiene === false
    ? 0
    : cantidad * ({
    bajo: 800,
    medio: 2000,
    alto: 4000,
  }[nivel(vehiculos.uso)] || 2000)

  return kmVehiculos
}

function estimarMaterialesKgCo2e(datos) {
  const materiales = datos.materiales || {}
  const categorias = materiales.categorias?.length ? materiales.categorias : ["desconocido"]

  let toneladasMateriales = 0
  if (numeroValido(materiales.cantidad_mensual)) {
    if (materiales.unidad === "toneladas") toneladasMateriales = materiales.cantidad_mensual
  }

  if (!toneladasMateriales) {
    toneladasMateriales = {
      baja: 0.1,
      media: 0.5,
      alta: 1.5,
    }[nivelFemenino(materiales.intensidad)] || 0
  }

  if (!toneladasMateriales) return 0

  const factorPromedio = categorias.reduce((total, categoriaMaterial) => {
    const factor = FACTORES.materiales_kg_co2e_por_tonelada[categoria(categoriaMaterial)]
      || FACTORES.materiales_kg_co2e_por_tonelada.desconocido
    return total + factor
  }, 0) / categorias.length

  return toneladasMateriales * factorPromedio
}

function estimarResiduosToneladas(datos) {
  const residuos = datos.residuos || {}

  if (residuos.genera === false) return 0
  if (numeroValido(residuos.toneladas_mes)) return residuos.toneladas_mes

  return {
    baja: 0.1,
    media: 0.5,
    alta: 1.5,
  }[nivelFemenino(residuos.intensidad)] || 0
}

function factorResiduosTonelada(datos) {
  const tipo = categoria(datos.residuos?.tipo)

  return FACTORES.residuos_kg_co2e_por_tonelada[tipo]
    || FACTORES.residuos_kg_co2e_por_tonelada.desconocido
}

function estimarVuelosMes(datos) {
  const viajes = datos.viajes || {}

  if (numeroValido(viajes.vuelos_mes)) return viajes.vuelos_mes
  if (numeroValido(viajes.vuelos_anio)) return viajes.vuelos_anio / 12

  return viajes.vuelos_frecuentes ? 4 : 0
}

function estimarAguaM3(datos) {
  const agua = datos.agua || {}

  if (agua.usa_agua_operativamente === false) return 0
  if (numeroValido(agua.m3_mes)) return agua.m3_mes
  if (numeroValido(agua.gasto_mensual)) return agua.gasto_mensual / PRECIO_AGUA_M3_MXN

  return {
    bajo: 20,
    medio: 100,
    alto: 500,
  }[nivel(agua.nivel)] || 0

}

function factorAguaM3(datos) {
  const tipo = datos.agua?.tipo

  return FACTORES.agua_m3_por_tipo[tipo] || FACTORES.agua_m3
}

function estimarKmEmpleados(datos, perfilEmpresa) {
  const empleados = estimarEmpleados({
    empleados: datos.empleados || perfilEmpresa.empleados,
  })
  const industria = (datos.industria || perfilEmpresa.industria || "").toLowerCase()

  const proporcionCoche = industria.includes("oficina") || industria.includes("servicios")
    ? 0.35
    : 0.2

  return empleados * proporcionCoche * 20 * 22
}

export function normalizarDatosOperativos(datos = {}, perfilEmpresa = {}) {
  const diagnostico = completarDatos(datos, perfilEmpresa)
  const empleados = estimarEmpleados({ empleados: diagnostico.empleados })

  return {
    pais: diagnostico.pais,
    kwh_mes: estimarElectricidadKwh(diagnostico, empleados),
    vehiculos_km_mes: estimarKmVehiculos(diagnostico),
    gas_kwh_mes: estimarCombustiblesKwh(diagnostico),
    combustible_factor_kg_kwh: factorCombustibleKwh(diagnostico),
    vehiculo_factor_kg_km: factorVehiculoKm(diagnostico.vehiculos?.tipo),
    residuos_toneladas_mes: estimarResiduosToneladas(diagnostico),
    residuos_factor_kg_tonelada: factorResiduosTonelada(diagnostico),
    materiales_kg_co2e_mes: estimarMaterialesKgCo2e(diagnostico),
    vuelos_mes: estimarVuelosMes(diagnostico),
    empleados_km_mes: estimarKmEmpleados(diagnostico, perfilEmpresa),
    agua_m3_mes: estimarAguaM3(diagnostico),
    agua_factor_kg_m3: factorAguaM3(diagnostico),
  }
}

export function calcularHuella(datos) {
  const factorElectricidad = factorElectricidadPorPais(datos.pais)
  // electricidad - convierte pesos a kwh si es necesario
  const kwh = (datos.kwh_mes || ((datos.luz_mxn_mes || 0) / PRECIO_KWH_MXN)) * MESES_POR_ANIO
  const emisionesElectricidad = kwh * factorElectricidad  // alcance 2

  // gas - convierte pesos a kwh
  const gasKwh = (datos.gas_kwh_mes || ((datos.gas_mxn_mes || 0) / PRECIO_GAS_KWH_MXN)) * MESES_POR_ANIO
  const emisionesGas = gasKwh * (datos.combustible_factor_kg_kwh || FACTORES.gas_kwh)  // alcance 1

  // vehiculos propios
  const vehiculosKm = (datos.vehiculos_km_mes || 0) * MESES_POR_ANIO
  const emisionesVehiculos = vehiculosKm * (datos.vehiculo_factor_kg_km || FACTORES.vehiculo_km)  // alcance 1

  // residuos
  const residuosToneladas = (datos.residuos_toneladas_mes || 0) * MESES_POR_ANIO
  const emisionesResiduos = residuosToneladas * (datos.residuos_factor_kg_tonelada || FACTORES.residuos_tonelada)  // alcance 3

  const emisionesMateriales = (datos.materiales_kg_co2e_mes || 0) * MESES_POR_ANIO

  // vuelos - asume promedio 500km por vuelo
  const vuelos = (datos.vuelos_mes || 0) * MESES_POR_ANIO
  const emisionesVuelos = vuelos * 500 * FACTORES.vuelo_pasajero_km  // alcance 3

  // transporte empleados
  const empleadosKm = (datos.empleados_km_mes || 0) * MESES_POR_ANIO
  const emisionesEmpleados = empleadosKm * FACTORES.empleado_km  // alcance 3

  // agua
  const aguaM3 = (datos.agua_m3_mes || 0) * MESES_POR_ANIO
  const emisionesAgua = aguaM3 * (datos.agua_factor_kg_m3 || FACTORES.agua_m3)  // alcance 3

  // totales por alcance en kg CO2e
  const alcance1 = emisionesGas + emisionesVehiculos
  const alcance2 = emisionesElectricidad
  const alcance3 = emisionesResiduos + emisionesMateriales + emisionesVuelos + emisionesEmpleados + emisionesAgua

  const totalKg = alcance1 + alcance2 + alcance3
  const totalToneladas = totalKg / 1000
  const electricidadEquivalenteKwh = factorElectricidad > 0
    ? totalKg / factorElectricidad
    : 0
  const oficinaEstandarMeses = electricidadEquivalenteKwh / OFICINA_ESTANDAR_KWH_MES
  const dieselLitrosEquivalentes = totalKg / DIESEL_KG_CO2E_POR_LITRO
  const tanquesPickupDiesel = dieselLitrosEquivalentes / TANQUE_PICKUP_DIESEL_LITROS

  return {
    totalToneladas: Math.round(totalToneladas * 10) / 10,
    alcance1: Math.round(alcance1 / 100) / 10,
    alcance2: Math.round(alcance2 / 100) / 10,
    alcance3: Math.round(alcance3 / 100) / 10,
    electricidad_kwh_equivalentes: Math.round(electricidadEquivalenteKwh),
    oficina_estandar_meses: Math.round(oficinaEstandarMeses),
    oficina_estandar_anios: Math.round((oficinaEstandarMeses / MESES_POR_ANIO) * 10) / 10,
    tanques_pickup_diesel_equivalentes: Math.round(tanquesPickupDiesel),
    tanques_pickup_diesel_evitable_15: Math.round(tanquesPickupDiesel * REDUCCION_DIESEL_EVITADA),
    // equivalencias emocionales
    vuelos_equivalentes: Math.round(totalToneladas / 0.255),
    arboles_equivalentes: Math.round(totalToneladas * 45),
    fuente: "DEFRA 2025 UK Government GHG Conversion Factors"
  }
}
