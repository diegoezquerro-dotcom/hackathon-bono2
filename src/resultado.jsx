import { calcularHuella } from "./calculos"

function Resultado({ datos, nombre }) {
  const resultado = calcularHuella(datos)

  return (
    <div className="resultado-container">

      {/* numero principal */}
      <div className="resultado-hero">
        <p className="resultado-label">La huella de carbono de tu empresa es</p>
        <h1 className="resultado-numero">
          {resultado.totalToneladas}
          <span className="resultado-unidad"> tCO₂e/año</span>
        </h1>
      </div>

      {/* equivalencias emocionales */}
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

      {/* desglose por alcances */}
      <div className="alcances">
        <h3 className="alcances-titulo">Desglose por alcance</h3>
        <div className="alcance-barra-container">
          <div className="alcance-row">
            <span className="alcance-label">Alcance 1 — Emisiones directas</span>
            <span className="alcance-valor">{resultado.alcance1} t</span>
          </div>
          <div className="alcance-barra">
            <div
              className="alcance-barra-fill"
              style={{ width: `${(resultado.alcance1 / resultado.totalToneladas) * 100}%`, background: "#3001F7" }}
            />
          </div>

          <div className="alcance-row">
            <span className="alcance-label">Alcance 2 — Electricidad</span>
            <span className="alcance-valor">{resultado.alcance2} t</span>
          </div>
          <div className="alcance-barra">
            <div
              className="alcance-barra-fill"
              style={{ width: `${(resultado.alcance2 / resultado.totalToneladas) * 100}%`, background: "#7243FD" }}
            />
          </div>

          <div className="alcance-row">
            <span className="alcance-label">Alcance 3 — Cadena de valor</span>
            <span className="alcance-valor">{resultado.alcance3} t</span>
          </div>
          <div className="alcance-barra">
            <div
              className="alcance-barra-fill"
              style={{ width: `${(resultado.alcance3 / resultado.totalToneladas) * 100}%`, background: "#9B6FFF" }}
            />
          </div>
        </div>
      </div>

      {/* fuente */}
      <p className="fuente">
        Calculado con factores oficiales · {resultado.fuente}
      </p>

      {/* CTA */}
        {/* warning estimaciones */}
      <div className="warning-estimacion">
        ⚠️ Este resultado es una <strong>estimación basada en IA</strong> con factores oficiales DEFRA 2025.
        Para un cálculo certificado y una ruta de descarbonización personalizada, agenda una asesoría con Bono.
      </div>


      <button className="btn-cta">
        Agenda una asesoría gratuita con Bono →
      </button>

    </div>
  )
}

export default Resultado