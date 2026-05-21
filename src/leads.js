const FORM_URL = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSfiN-hXB2aXptLaJ9Zkr7nBkcXf-0ZGw0FR80eVgxm7sBwOKA/formResponse"

const CAMPOS = {
  nombre:   "entry.1862159201",
  empresa:  "entry.884830285",
  correo:   "entry.1495666974",
  giro:     "entry.1752053099",
  huella:   "entry.110402986",
}

export async function guardarLead({ nombre, empresa, correo, giro, huella }) {
  const body = new FormData()
  body.append(CAMPOS.nombre,  nombre)
  body.append(CAMPOS.empresa, empresa)
  body.append(CAMPOS.correo,  correo)
  body.append(CAMPOS.giro,    giro)
  body.append(CAMPOS.huella,  `${huella} tCO₂e/año`)

  try {
    await fetch(FORM_URL, {
      method: "POST",
      mode: "no-cors", // google forms no permite cors, pero igual guarda
      body,
    })
    return true
  } catch {
    return false
  }
}