// factores de emision - fuente: DEFRA 2025 UK Government GHG Conversion Factors

const FACTORES = {
  // alcance 2 - electricidad (kg CO2e por kWh)
  electricidad_kwh: 0.177,

  // alcance 1 - gas natural (kg CO2e por kWh)
  gas_kwh: 0.2027,

  // alcance 1 - vehiculos promedio diesel (kg CO2e por km)
  vehiculo_km: 0.17304,

  // alcance 3 - residuos comerciales a relleno (kg CO2e por tonelada)
  residuos_tonelada: 520.53,

  // alcance 3 - vuelos cortos haul promedio (kg CO2e por pasajero km)
  vuelo_pasajero_km: 0.255,

  // alcance 3 - transporte empleados auto promedio (kg CO2e por km)
  empleado_km: 0.16725,

  // alcance 3 - agua (kg CO2e por m3)
  agua_m3: 0.149,
}

// conversion de pesos a kwh (estimado promedio mexico 2024)
const PRECIO_KWH_MXN = 2.8
const PRECIO_GAS_KWH_MXN = 1.2

export function calcularHuella(datos) {
  // electricidad - convierte pesos a kwh si es necesario
  const kwh = datos.kwh_mes || 0
  const emisionesElectricidad = kwh * FACTORES.electricidad_kwh  // alcance 2

  // gas - convierte pesos a kwh
  const gasKwh = datos.gas_kwh_mes || 0
  const emisionesGas = gasKwh * FACTORES.gas_kwh  // alcance 1

  // vehiculos propios
  const vehiculosKm = datos.vehiculos_km_mes || 0
  const emisionesVehiculos = vehiculosKm * FACTORES.vehiculo_km  // alcance 1

  // residuos - convierte kg a toneladas
  const residuosKg = datos.residuos_kg_mes || 0
  const emisionesResiduos = (residuosKg / 1000) * FACTORES.residuos_tonelada  // alcance 3

  // vuelos - asume promedio 500km por vuelo
  const vuelos = datos.vuelos_mes || 0
  const emisionesVuelos = vuelos * 500 * FACTORES.vuelo_pasajero_km  // alcance 3

  // transporte empleados
  const empleadosKm = datos.empleados_km_mes || 0
  const emisionesEmpleados = empleadosKm * FACTORES.empleado_km  // alcance 3

  // agua
  const aguaM3 = datos.agua_m3_mes || 0
  const emisionesAgua = aguaM3 * FACTORES.agua_m3  // alcance 3

  // totales por alcance en kg CO2e
  const alcance1 = emisionesGas + emisionesVehiculos
  const alcance2 = emisionesElectricidad
  const alcance3 = emisionesResiduos + emisionesVuelos + emisionesEmpleados + emisionesAgua

  const totalKg = alcance1 + alcance2 + alcance3
  const totalToneladas = totalKg / 1000

  return {
    totalToneladas: Math.round(totalToneladas * 10) / 10,
    alcance1: Math.round(alcance1 / 100) / 10,
    alcance2: Math.round(alcance2 / 100) / 10,
    alcance3: Math.round(alcance3 / 100) / 10,
    // equivalencias emocionales
    vuelos_equivalentes: Math.round(totalToneladas / 0.255),
    arboles_equivalentes: Math.round(totalToneladas * 45),
    fuente: "DEFRA 2025 UK Government GHG Conversion Factors"
  }
}