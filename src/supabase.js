import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function guardarLeadSupabase({ nombre, empresa, correo, giro, huella }) {
  const { error } = await supabase
    .from("leads")
    .insert([{ nombre, empresa, correo, giro, huella }])

  if (error) {
    console.log("Error guardando lead:", error)
    return false
  }

  return true
}

export async function iniciarSesion(giro) {
  const inicio = Date.now()
  window._sesionInicio = inicio
  window._sesionGiro = giro
}

export async function completarSesion() {
  if (!window._sesionInicio) return

  const tiempoSegundos = Math.round((Date.now() - window._sesionInicio) / 1000)

  const { error } = await supabase
    .from("sesiones")
    .insert([{
      giro: window._sesionGiro || "desconocido",
      tiempo_segundos: tiempoSegundos,
      completo: true
    }])

  if (error) console.log("Error guardando sesion:", error)
}

export async function registrarClickCalendly(correo) {
  const { error } = await supabase
    .from("leads")
    .update({ clicks_calendly: true })
    .eq("correo", correo)

  if (error) console.log("Error registrando click:", error)
}