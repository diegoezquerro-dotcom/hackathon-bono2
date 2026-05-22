import { useEffect, useState } from "react"
import { calcularHuella } from "./calculos"
import { registrarClickCalendly, supabase } from "./supabase"

function Resultado({ datos, empresa, correo, giro }) {
  const resultado = calcularHuella(datos)
  const paisElectricidad = datos.pais || "el pais seleccionado"
  const totalAlcances = resultado.totalToneladas || 0
  const [ranking, setRanking] = useState(null)
  const alcances = [
    {
      label: "Alcance 1 — Emisiones directas",
      shortLabel: "Alcance 1",
      description: "Emisiones directas de fuentes que controla la empresa, como vehiculos propios, combustion de gas o combustibles.",
      value: resultado.alcance1,
      color: "#3001F7",
    },
    {
      label: "Alcance 2 — Electricidad",
      shortLabel: "Alcance 2",
      description: "Emisiones indirectas asociadas a la electricidad comprada y consumida por la empresa.",
      value: resultado.alcance2,
      color: "#7243FD",
    },
    {
      label: "Alcance 3 — Cadena de valor",
      shortLabel: "Alcance 3",
      description: "Emisiones indirectas de la cadena de valor, como transporte externo, residuos, viajes, proveedores y otras actividades relacionadas.",
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

  useEffect(() => {
    if (!giro || !resultado.totalToneladas) return

    const calcularRanking = async () => {
      const { data: leads, error } = await supabase
        .from("leads")
        .select("huella")
        .eq("giro", giro)
        .not("huella", "is", null)

      if (error || !leads || leads.length < 2) {
        setRanking(null)
        return
      }

      const huellas = leads
        .map((lead) => Number(lead.huella))
        .filter((huella) => Number.isFinite(huella))
        .sort((a, b) => a - b)

      if (huellas.length < 2) {
        setRanking(null)
        return
      }

      const total = huellas.length
      const posicion = huellas.filter((huella) => huella <= resultado.totalToneladas).length
      const percentil = Math.max(0, Math.round((1 - posicion / total) * 100))

      setRanking({ posicion, total, percentil })
    }

    calcularRanking()
  }, [giro, resultado.totalToneladas])

  const getMensajeRanking = () => {
    if (!ranking) return null

    const { percentil, posicion, total } = ranking

    if (percentil <= 20) {
      return {
        emoji: "🏆",
        mensaje: `Estás en el top ${percentil + 1}% de empresas más sustentables de tu sector.`,
        cta: "Sigue así. Una asesoría con Bono puede llevarte al #1.",
      }
    }

    if (percentil <= 50) {
      return {
        emoji: "📈",
        mensaje: `Estás en el lugar ${posicion} de ${total} empresas de tu sector.`,
        cta: "Estás en la mitad superior. Con Bono podrías entrar al top 20%.",
      }
    }

    return {
      emoji: "💡",
      mensaje: `Hay ${total - posicion} empresas de tu sector con menor huella que tú.`,
      cta: "Bono puede ayudarte a reducirla y mejorar tu posición.",
    }
  }

  const infoRanking = getMensajeRanking()

  return (
    <div className="resultado-container">

      <div className="resultado-hero">
        <p className="resultado-label">La huella de carbono de {empresa || "tu empresa"} es</p>
        <h1 className="resultado-numero">
          {resultado.totalToneladas}
          <span className="resultado-unidad"> tCO₂e/año</span>
        </h1>
        <p className="fuente resultado-fuente">Calculado con factores oficiales · {resultado.fuente}</p>
      </div>

      {infoRanking && (
        <div className="ranking-card">
          <span className="ranking-emoji">{infoRanking.emoji}</span>
          <div>
            <p className="ranking-mensaje">{infoRanking.mensaje}</p>
            <p className="ranking-cta">{infoRanking.cta}</p>
          </div>
        </div>
      )}

      <div className="impacto-metricas" aria-label="Métricas de impacto">
        <div className="impacto-card">
          <span className="impacto-label">Vuelos CDMX-Madrid</span>
          <strong>{resultado.vuelos_equivalentes} vuelos</strong>
          <span>redondos de CDMX a Madrid equivalentes a las emisiones anuales estimadas.</span>
        </div>
        <div className="impacto-card">
          <span className="impacto-label">Consumo eléctrico de oficina</span>
          <strong>{resultado.oficina_estandar_meses} meses</strong>
          <span>
            de electricidad para una oficina estándar en {paisElectricidad} con consumo de 700 kWh mensuales
            {resultado.oficina_estandar_anios > 0 && ` (${resultado.oficina_estandar_anios} años)`}
          </span>
        </div>
        <div className="impacto-card">
          <span className="impacto-label">Diesel equivalente</span>
          <strong>{resultado.tanques_pickup_diesel_equivalentes} tanques</strong>
          <span>
            de 80 L equivalentes; reducir 15% la huella evitaría
            {" "}{resultado.tanques_pickup_diesel_evitable_15} tanques de diesel.
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

        <div className="alcances-descripciones" aria-label="Descripcion de alcances">
          {alcances.map((alcance) => (
            <div className="alcance-descripcion" key={alcance.shortLabel}>
              <strong>{alcance.shortLabel}</strong>
              <span>{alcance.description}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="oportunidades-card" aria-labelledby="oportunidades-title">
        <h3 id="oportunidades-title">Oportunidades de Optimización y Reducción</h3>
        <div className="oportunidades-lista">
          <article className="oportunidad-item">
            <h4>⚡ Optimización de Energía y Combustible</h4>
            <p>
              Gran parte de las emisiones de una empresa provienen del consumo diario de electricidad,
              gas y transporte. Mejorar la eficiencia operativa puede reducir costos y disminuir
              significativamente la huella de carbono sin afectar la productividad.
            </p>
          </article>
          <article className="oportunidad-item">
            <h4>🔋 Modernización de Equipos y Procesos</h4>
            <p>
              Equipos más eficientes, sistemas de refrigeración modernos y procesos optimizados pueden
              generar reducciones importantes de emisiones a largo plazo. La descarbonización también
              puede convertirse en una ventaja competitiva y operativa.
            </p>
          </article>
          <article className="oportunidad-item">
            <h4>📦 Operaciones y Logística Más Inteligentes</h4>
            <p>
              La forma en que una empresa compra, transporta y utiliza materiales tiene un impacto
              directo en sus emisiones. Optimizar rutas, reducir desperdicios y mejorar procesos puede
              disminuir el impacto ambiental mientras fortalece la operación del negocio.
            </p>
          </article>
        </div>
      </section>

      <p className="cta-copy">
        Bono puede ayudarle a identificar oportunidades concretas de reducción de emisiones y
        optimización operativa, agenda una asesoría:
      </p>
      <a
        className="btn-cta"
        href="https://calendly.com/daniangulo/asesoria-bono"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => registrarClickCalendly(correo)}
      >
        Agenda una asesoría gratuita con Bono →
      </a>

      <div className="warning-estimacion">
        ⚠️ Este resultado es una <strong>estimación basada en IA</strong> con factores oficiales DEFRA 2025.
        Para un cálculo certificado y una ruta de descarbonización personalizada, agenda una asesoría con Bono.
      </div>

    </div>
  )
}

export default Resultado
