import { calcularHuella } from "./calculos"
import { registrarClickCalendly } from "./supabase"

function Resultado({ datos, empresa, correo }) {
  const resultado = calcularHuella(datos)
  const totalAlcances = resultado.totalToneladas || 0
  const alcances = [
    {
      label: "Alcance 1 — Emisiones directas",
      value: resultado.alcance1,
      color: "#3001F7",
    },
    {
      label: "Alcance 2 — Electricidad",
      value: resultado.alcance2,
      color: "#7243FD",
    },
    {
      label: "Alcance 3 — Cadena de valor",
      value: resultado.alcance3,
      color: "#9B6FFF",
    },
  ]
  let pieStart = 0
  const pieGradient = totalAlcances > 0
    ? alcances
        .map((alcance) => {
          const start = pieStart
          const end = start + (alcance.value / totalAlcances) * 100
          pieStart = end
          return `${alcance.color} ${start}% ${end}%`
        })
        .join(", ")
    : "#f1eff8 0% 100%"

  return (
    <div className="resultado-container">

      <div className="resultado-hero">
        <p className="resultado-label">La huella de carbono de {empresa || "tu empresa"} es</p>
        <h1 className="resultado-numero">
          {resultado.totalToneladas}
          <span className="resultado-unidad"> tCO₂e/año</span>
        </h1>
      </div>

      <div className="equivalencias">
        <div className="equivalencia-card">
          <span className="equivalencia-icono">✈️</span>
          <span className="equivalencia-texto">
            Equivale a <strong>{resultado.vuelos_equivalentes} vuelos</strong> de CDMX a Madrid
          </span>
        </div>
        <div className="equivalencia-card">
          <span className="equivalencia-icono">🌳</span>
          <span className="equivalencia-texto">
            Necesitarías plantar <strong>{resultado.arboles_equivalentes} árboles</strong> para compensarlo
          </span>
        </div>
      </div>

      <div className="alcances">
        <h3 className="alcances-titulo">Desglose por alcance</h3>
        <div className="alcances-chart">
          <div
            className="alcances-pie"
            style={{ background: `conic-gradient(${pieGradient})` }}
            role="img"
            aria-label={`Desglose por alcance: Alcance 1 ${resultado.alcance1} toneladas, Alcance 2 ${resultado.alcance2} toneladas, Alcance 3 ${resultado.alcance3} toneladas`}
          >
            <span>{resultado.totalToneladas} t</span>
          </div>

          <div className="alcances-lista">
            {alcances.map((alcance) => (
              <div className="alcance-row" key={alcance.label}>
                <span className="alcance-label">
                  <span className="alcance-color" style={{ background: alcance.color }} />
                  {alcance.label}
                </span>
                <span className="alcance-valor">{alcance.value} t</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="fuente">Calculado con factores oficiales · {resultado.fuente}</p>

      <div className="warning-estimacion">
        ⚠️ Este resultado es una <strong>estimación basada en IA</strong> con factores oficiales DEFRA 2025.
        Para un cálculo certificado y una ruta de descarbonización personalizada, agenda una asesoría con Bono.
      </div>

      <a
        className="btn-cta"
        href="https://calendly.com/daniangulo/asesoria-bono"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => registrarClickCalendly(correo)}
      >
        Agenda una asesoría gratuita con Bono →
      </a>

    </div>
  )
}

export default Resultado
