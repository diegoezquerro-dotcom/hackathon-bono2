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