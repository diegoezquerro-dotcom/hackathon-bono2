import { useLocation } from "react-router-dom"
import { Analytics } from "@vercel/analytics/react";
import logo from '../brand/assets/logos/transparent/bono-logo-original-large-transparent.png';
import iconMitigation from '../brand/assets/optimized/dashboard-mitigation-projects.webp';
import iconStrategy from '../brand/assets/optimized/strategy-analysis.webp';
import iconRenewable from '../brand/assets/optimized/renewable-energy-transformation.webp';
import iconTargets from '../brand/assets/optimized/carbon-footprint-targets.webp';
import Calculadora from './Calculadora';

const calculatorHref = '/calculadora';

const painCards = [
  'Para responder mejor a clientes corporativos',
  'Para entender tus principales fuentes de emisiones',
  'Para identificar oportunidades de reducción',
];

const steps = [
  {
    title: 'Responde preguntas simples',
    text: 'Te preguntaremos sobre tu operación: electricidad, vehículos, materiales, residuos y actividad general de tu empresa.',
  },
  {
    title: 'Recibe una estimación inicial',
    text: 'Obtendrás un número estimado en toneladas de CO₂e al año, junto con una equivalencia sencilla para dimensionar el impacto.',
  },
  {
    title: 'Desbloquea tu diagnóstico completo',
    text: 'Después del resultado inicial, podrás ver el desglose por Alcance 1, 2 y 3, una clasificación de impacto y recomendaciones para avanzar.',
  },
];

const checklist = [
  'Tipo de empresa o industria',
  'Número aproximado de empleados',
  'Consumo mensual de electricidad, o una estimación del gasto',
  'Vehículos propios o transporte usado por la empresa',
  'Residuos generados de forma aproximada',
  'Viajes, materiales o residuos, si aplican',
];

const scopes = [
  {
    label: 'Alcance 1',
    text: 'Emisiones directas de fuentes que controla la empresa, como vehículos propios, combustión de gas o combustibles.',
  },
  {
    label: 'Alcance 2',
    text: 'Emisiones indirectas asociadas a la electricidad comprada y consumida por la empresa.',
  },
  {
    label: 'Alcance 3',
    text: 'Emisiones indirectas de la cadena de valor, como transporte externo, residuos, viajes, proveedores y otras actividades relacionadas.',
  },
];

const faqs = [
  {
    question: '¿Cómo se mide la huella de carbono de una empresa?',
    answer:
      'Se estima identificando las actividades que generan gases de efecto invernadero, como consumo de electricidad, uso de combustibles, transporte, residuos y actividades de la cadena de valor. Luego se aplican factores de emisión para convertir esas actividades en toneladas de CO₂e.',
  },
  {
    question: '¿Qué significa CO₂e?',
    answer:
      'CO₂e significa dióxido de carbono equivalente. Es una unidad que permite expresar distintos gases de efecto invernadero en una sola medida comparable.',
  },
  {
    question: '¿Qué son las emisiones de Alcance 1, 2 y 3?',
    answer:
      'Alcance 1 son emisiones directas de la empresa. Alcance 2 son emisiones indirectas por electricidad comprada. Alcance 3 son otras emisiones indirectas de la cadena de valor, como proveedores, transporte, residuos y viajes.',
  },
  {
    question: '¿Esta calculadora sirve para responder cuestionarios como CDP, EcoVadis o solicitudes de clientes?',
    answer:
      'Sirve como primer diagnóstico para entender tus emisiones y preparar mejor la información que suelen pedir clientes corporativos. No reemplaza una medición formal, pero ayuda a identificar datos clave y brechas de información.',
  },
  {
    question: '¿La estimación es exacta?',
    answer:
      'No. Es una estimación rápida basada en respuestas simplificadas. Su precisión depende de la calidad de los datos ingresados. Para reportes formales o decisiones de inversión, se recomienda una medición más detallada.',
  },
];

const industries = [
  {
    title: 'Restaurantes y alimentos',
    text: 'Electricidad, gas, refrigeración, residuos orgánicos y materiales pueden ser fuentes relevantes de emisiones.',
    icon: iconMitigation,
  },
  {
    title: 'Manufactura ligera',
    text: 'Energía, combustibles, materiales, transporte y residuos suelen concentrar gran parte de la huella.',
    icon: iconRenewable,
  },
  {
    title: 'Transporte y distribución',
    text: 'Vehículos, combustibles y distancia recorrida suelen ser los principales motores de emisiones.',
    icon: iconStrategy,
  },
  {
    title: 'Oficinas y servicios',
    text: 'Electricidad, viajes, traslados del equipo, compras y servicios contratados pueden ser las principales fuentes.',
    icon: iconTargets,
  },
];

const beforeResults = [
  'Tu estimación total en toneladas de CO₂e al año',
  'Una equivalencia simple para entender la magnitud del impacto',
];

const afterResults = [
  'Desglose por Alcance 1, 2 y 3',
  'Clasificación visual de impacto',
  'Explicación de tus principales fuentes de emisiones',
  'Primeras oportunidades de reducción',
  'Opción para agendar una asesoría con Bono',
];

function Header() {
  return (
    <header className="site-header">
      <nav className="nav-shell" aria-label="Navegación principal">
        <a className="brand-link" href="/" aria-label="Bono inicio">
          <img src={logo} alt="Bono2" />
        </a>
        <div className="nav-links" aria-label="Secciones">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#metodologia">Metodología</a>
          <a href="#faq">Preguntas frecuentes</a>
        </div>
        <a className="nav-cta" href={calculatorHref}>
          Calcular mi huella
        </a>
      </nav>
    </header>
  );
}


function Hero() {
  return (
    <section className="hero section-grid" aria-labelledby="hero-title">
      <div className="hero-copy reveal">
        <h1 id="hero-title">Calcula la huella de carbono de tu empresa</h1>
        <p className="hero-time">En menos de 3 minutos</p>
        <div className="cta-stack">
          <a className="primary-cta" href={calculatorHref}>
            Calcular mi huella
            <span aria-hidden="true">→</span>
          </a>
        </div>
        <p>
          Estima tus emisiones de CO₂e en lenguaje
          simple y empieza con datos aproximados.
        </p>
      </div>
    </section>
  );
}

function PainPoint() {
  return (
    <section className="pain section-band" aria-labelledby="pain-title">
      <div className="section-copy">
        <h2 id="pain-title">¿Te pidieron información de sustentabilidad y no sabes qué responder?</h2>
        <p>
          Cada vez más empresas grandes solicitan a sus proveedores datos sobre emisiones, energía,
          transporte, residuos y prácticas de reducción. Muchas PyMEs reciben cuestionarios de
          sustentabilidad sin tener un inventario formal de carbono. Esta calculadora te ayuda a
          obtener una primera estimación clara y accionable.
        </p>
      </div>
      <div className="pain-cards">
        {painCards.map((card) => (
          <article className="mini-card" key={card}>
            <span aria-hidden="true">✓</span>
            <h3>{card}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="steps section-shell" id="como-funciona" aria-labelledby="steps-title">
      <div className="section-heading">
        <h2 id="steps-title">Cómo funciona</h2>
      </div>
      <div className="step-grid">
        {steps.map((step, index) => (
          <article className="step-card" key={step.title}>
            <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>
      <div className="mid-cta-row">
        <a className="primary-cta" href={calculatorHref}>
          Empezar ahora
        </a>
      </div>
    </section>
  );
}

function Requirements() {
  return (
    <section className="requirements section-grid" aria-labelledby="requirements-title">
      <div className="section-copy">
        <h2 id="requirements-title">No necesitas ser experto en carbono</h2>
        <p>Puedes completar el cálculo con información aproximada de tu empresa.</p>
        <p className="microcopy">
          Mientras mejores sean tus datos, más confiable será la estimación. Si no tienes un dato
          exacto, la herramienta puede trabajar con aproximaciones.
        </p>
      </div>
      <ul className="checklist" aria-label="Información que puedes tener a la mano">
        {checklist.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function Methodology() {
  return (
    <section className="method section-shell" id="metodologia" aria-labelledby="method-title">
      <div className="method-intro">
        <h2 id="method-title">Estimación alineada con estándares de medición de emisiones</h2>
        <p>
          La calculadora organiza las emisiones en Alcance 1, Alcance 2 y Alcance 3, siguiendo la
          lógica del GHG Protocol. El objetivo es entregar una estimación rápida y útil, no sustituir
          un inventario de carbono auditado.
        </p>
      </div>
      <div className="scope-grid">
        {scopes.map((scope) => (
          <article className="scope-card" key={scope.label}>
            <h3>{scope.label}</h3>
            <p>{scope.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="faq section-shell" id="faq" aria-labelledby="faq-title">
      <div className="section-heading wide">
        <h2 id="faq-title">Preguntas frecuentes sobre huella de carbono empresarial</h2>
      </div>
      <div className="faq-list">
        {faqs.map((faq) => (
          <details className="faq-item" key={faq.question}>
            <summary>
              <span>{faq.question}</span>
              <span className="faq-indicator" aria-hidden="true">
                +
              </span>
            </summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Industries() {
  return (
    <section className="industries section-shell" aria-labelledby="industries-title">
      <div className="section-heading">
        <h2 id="industries-title">Diseñada para distintos tipos de PyMEs</h2>
      </div>
      <div className="industry-grid">
        {industries.map((industry) => (
          <article className="industry-card" key={industry.title}>
            <img src={industry.icon} alt="" aria-hidden="true" loading="lazy" />
            <h3>{industry.title}</h3>
            <p>{industry.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ResultsPreview() {
  return (
    <section className="results section-grid" aria-labelledby="results-title">
      <div className="section-copy">
        <h2 id="results-title">Qué recibirás al terminar</h2>
        <div className="result-lists">
          <div>
            <h3>Antes de registrarte</h3>
            <ul>
              {beforeResults.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Después de registrarte</h3>
            <ul>
              {afterResults.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <div>
        <h2 id="final-cta-title">Obtén tu primera estimación de emisiones hoy</h2>
        <p>
          Responde preguntas simples sobre tu empresa y recibe un diagnóstico inicial en menos de 3
          minutos.
        </p>
      </div>
      <div className="cta-stack">
        <a className="primary-cta light" href={calculatorHref}>
          Empezar cálculo gratuito
          <span aria-hidden="true">→</span>
        </a>
        <small>Pensado para PyMEs. Sin lenguaje técnico. Sin compromiso.</small>
      </div>
    </section>
  );
}

export default function App() {
  const location = useLocation()

  if (location.pathname === calculatorHref) {
    return <Calculadora />;
  }

  return (
    <>
      <Header />
      <main>
        <Hero />
        <PainPoint />
        <HowItWorks />
        <Requirements />
        <Methodology />
        <Faq />
        <Industries />
        <ResultsPreview />
        <FinalCta />
      </main>
      <Analytics />
    </>
  );
}
