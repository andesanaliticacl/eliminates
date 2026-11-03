import { IconoBalanza, IconoCheck, IconoDocumento, IconoEscudo, IconoFlecha, IconoMas, IconoWhatsApp } from "@/components/iconos";
import { Animaciones } from "@/components/landing/Animaciones";
import { Cta } from "@/components/landing/Cta";
import { Navbar } from "@/components/landing/Navbar";
import { Pie } from "@/components/landing/Pie";
import { Escenario } from "@/components/landing/TarjetaInforme";
import { Wizard } from "@/components/wizard/Wizard";
import { enlaceWhatsApp, NOTA_LEGAL, urlSitio } from "@/lib/config";
import { configPublica } from "@/lib/store";

export const revalidate = 60;

const SERVICIOS = [
  {
    titulo: "Antecedentes comerciales y financieros",
    texto: "DICOM, deuda castigada e informes comerciales.",
    Icono: IconoDocumento,
  },
  {
    titulo: "Antecedentes penales",
    texto: "Revisión de requisitos, preparación de antecedentes y seguimiento hasta el resultado.",
    Icono: IconoEscudo,
  },
  {
    titulo: "Gestión legal",
    texto: "Vía administrativa, vía judicial y representación completa.",
    Icono: IconoBalanza,
  },
];

const PASOS = [
  { titulo: "Nos cuentas tu caso", texto: "Formulario breve, sin costo y sin compromiso." },
  { titulo: "Análisis en 24 horas", texto: "Un abogado revisa tus antecedentes y qué se puede hacer." },
  { titulo: "Te proponemos la vía legal", texto: "Con plazos y costos claros, antes de avanzar." },
  { titulo: "Gestionamos todo hasta el cierre", texto: "Tú sigues con lo tuyo; nosotros hacemos el trámite." },
];

const PREGUNTAS = [
  {
    p: "¿Cuánto demora el análisis?",
    r: "24 horas desde que recibimos tu información. En ese plazo te decimos qué antecedentes se pueden eliminar en tu caso y por qué vía.",
  },
  {
    p: "¿Qué antecedentes se pueden eliminar?",
    r: "Trabajamos con DICOM y deuda castigada, informes comerciales, antecedentes financieros y antecedentes penales. Que proceda o no depende de los requisitos legales aplicables a cada caso, y te lo explicamos desde el primer análisis.",
  },
  {
    p: "¿Cuál es la diferencia entre la vía administrativa y la judicial?",
    r: "La vía administrativa se tramita ante la entidad que mantiene el registro o la autoridad correspondiente, sin juicio. La vía judicial se presenta ante tribunales, cuando la administrativa no procede o no basta. Te recomendamos la que corresponde a tu caso, con sus plazos y costos.",
  },
  {
    p: "¿Cuánto cuesta?",
    r: "La evaluación inicial no tiene costo; el valor de la gestión depende de la vía y del tipo de antecedente. Al agendar tu cita se paga el abono que ves en el resumen, antes de confirmar.",
  },
  {
    p: "¿Mis datos están seguros?",
    r: "Tus documentos se guardan en un almacenamiento privado, cifrado en tránsito y con acceso restringido al equipo que lleva tu caso. Solo los usamos para evaluar y gestionar tu solicitud. El detalle está en la política de privacidad.",
  },
  {
    p: "¿Qué documentos necesito?",
    r: "Tu cédula de identidad por ambos lados, tu informe DICOM o Equifax y, si aplica, tu certificado de antecedentes. Si te falta alguno, igual puedes enviar tu solicitud: te ayudamos a conseguirlo.",
  },
];

export default async function Inicio() {
  const config = await configPublica();
  const { contadores, testimonios } = config;

  const datosEstructurados = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LegalService",
        name: "Elimínate",
        url: urlSitio(),
        telephone: config.contacto.telefono,
        email: config.contacto.correo,
        areaServed: { "@type": "Country", name: "Chile" },
        description: "Gestión legal para eliminar DICOM, deuda castigada y antecedentes comerciales, financieros y penales.",
      },
      {
        "@type": "FAQPage",
        mainEntity: PREGUNTAS.map(({ p, r }) => ({ "@type": "Question", name: p, acceptedAnswer: { "@type": "Answer", text: r } })),
      },
    ],
  };

  const cifras = [
    { valor: contadores.casos_evaluados, etiqueta: "casos evaluados", prefijo: "+" },
    { valor: contadores.casos_gestionados, etiqueta: "casos gestionados", prefijo: "+" },
    { valor: contadores.anos_experiencia, etiqueta: "años de experiencia", prefijo: "" },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados).replace(/</g, "\\u003c") }} />
      <Navbar logoUrl={config.logo_url} />

      <main>
        <div id="historia" className="relative pt-14 lg:pt-0">
          <Escenario />

          <div className="mx-auto max-w-[77.5rem] px-4 lg:px-8">
            <div className="lg:w-[46%]">
              {/* 1. Hero */}
              <section id="inicio" className="relative flex min-h-[calc(100svh-13rem)] flex-col justify-start pt-3 pb-16 lg:min-h-svh lg:justify-center lg:py-24">
                <h1 className="text-[3.25rem] leading-[0.98] font-semibold tracking-[-0.035em] text-marino sm:text-7xl lg:text-[5.5rem]">
                  <span className="palabra" style={{ "--i": 0 } as React.CSSProperties}>ELIMINA</span>{" "}
                  <span className="palabra" style={{ "--i": 1 } as React.CSSProperties}>TU</span>{" "}
                  <span className="palabra" style={{ "--i": 2 } as React.CSSProperties}>DICOM</span>
                </h1>
                <p className="aparece mt-5 max-w-[34rem] text-[1.05rem] leading-relaxed text-tenue lg:mt-7 lg:text-xl" style={{ "--retraso": "0.15s" } as React.CSSProperties}>
                  Eliminamos deuda castigada, informes comerciales, financieros y antecedentes penales con gestión legal administrativa o judicial. Borrón y cuenta nueva.
                </p>
                <div className="aparece mt-6 flex flex-col gap-3 sm:flex-row lg:mt-9" style={{ "--retraso": "0.25s" } as React.CSSProperties}>
                  <Cta href="#solicitud" className="h-13 px-7 text-base">
                    Elimina tu DICOM ahora
                    <IconoFlecha className="size-4" />
                  </Cta>
                  <Cta href="#como-funciona" variante="secundario" offset={-80} className="h-13 px-7 text-base">Cómo funciona</Cta>
                </div>
                <p className="aparece mt-6 text-[0.8rem] text-tenue lg:mt-8 lg:text-sm" style={{ "--retraso": "0.35s" } as React.CSSProperties}>
                  100% confidencial · Respaldo legal · Respuesta en 24 h
                </p>
                <div aria-hidden="true" className="aparece absolute bottom-8 left-0 hidden items-center gap-3 text-xs tracking-wide text-tenue lg:flex" style={{ "--retraso": "0.8s" } as React.CSSProperties}>
                  <span className="relative h-7 w-4 rounded-full border border-linea">
                    <span className="desliza-punto absolute top-1.5 left-1/2 -ml-0.5 size-1 rounded-full bg-marino" />
                  </span>
                  Desliza
                </div>
              </section>

              {/* 2. El problema */}
              <section id="escena-problema" className="py-16 lg:flex lg:min-h-[90svh] lg:flex-col lg:justify-center lg:py-24">
                <h2 data-revelar className="text-4xl leading-[1.05] font-semibold tracking-tight text-marino lg:text-6xl">Tu historial te está cerrando puertas</h2>
                <p data-revelar className="mt-5 max-w-md text-lg leading-relaxed text-tenue">
                  Un crédito rechazado, un arriendo que no sale, una oferta de trabajo que no avanza. Todo por un registro que quizás ya se puede eliminar.
                </p>
              </section>

              {/* 3. Servicios */}
              <section id="servicios" className="scroll-mt-20 py-16 lg:py-24">
                <h2 data-revelar className="text-4xl leading-[1.05] font-semibold tracking-tight text-marino lg:text-6xl">Lo que te frena, lo eliminamos</h2>
                <div className="mt-10 grid gap-5 lg:mt-20 lg:gap-[28svh]">
                  {SERVICIOS.map(({ titulo, texto, Icono }) => (
                    <article key={titulo} data-servicio className="rounded-2xl border border-linea/80 bg-white p-6 shadow-[0_1px_2px_rgb(11_31_58/0.04)] lg:p-8">
                      <Icono className="size-6 text-marino" />
                      <h3 className="mt-4 text-xl font-semibold tracking-tight text-marino lg:text-2xl">{titulo}</h3>
                      <p className="mt-2 leading-relaxed text-tenue">{texto}</p>
                    </article>
                  ))}
                </div>
              </section>

              {/* 4. Cómo funciona */}
              <section id="como-funciona" className="scroll-mt-20 py-16 lg:py-32">
                <h2 data-revelar className="text-4xl leading-[1.05] font-semibold tracking-tight text-marino lg:text-6xl">Cómo funciona</h2>
                <ol data-lista-pasos className="relative mt-10 grid gap-10 lg:mt-20 lg:gap-[18svh]">
                  <span aria-hidden="true" className="absolute top-2 bottom-2 left-[1.0625rem] w-px bg-linea" />
                  <span aria-hidden="true" data-linea-progreso className="absolute top-2 bottom-2 left-[1.0625rem] w-px origin-top scale-y-0 bg-limpio" />
                  {PASOS.map(({ titulo, texto }, i) => (
                    <li key={titulo} data-paso className="relative flex gap-5">
                      <span className="relative grid size-9 shrink-0 place-items-center rounded-full border border-linea bg-white text-xs font-semibold text-marino tabular-nums">0{i + 1}</span>
                      <div data-revelar>
                        <h3 className="text-xl font-semibold tracking-tight text-marino lg:text-2xl">{titulo}</h3>
                        <p className="mt-1.5 leading-relaxed text-tenue">{texto}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              {/* 5. Confianza */}
              <section id="escena-confianza" className="py-16 lg:py-32">
                <h2 data-revelar className="text-4xl leading-[1.05] font-semibold tracking-tight text-marino lg:text-6xl">Borrón y cuenta nueva, con respaldo</h2>
                <dl className="mt-10 grid grid-cols-3 gap-4">
                  {cifras.map(({ valor, etiqueta, prefijo }) => (
                    <div key={etiqueta}>
                      <dt className="sr-only">{etiqueta}</dt>
                      <dd className="text-3xl font-semibold tracking-tight text-marino tabular-nums lg:text-5xl">
                        {prefijo}<span data-contador={valor}>{valor.toLocaleString("es-CL")}</span>
                      </dd>
                      <p aria-hidden="true" className="mt-1 text-sm leading-snug text-tenue">{etiqueta}</p>
                    </div>
                  ))}
                </dl>
                {contadores.ejemplo && <p className="mt-3 text-xs text-tenue">Cifras de ejemplo.</p>}

                <ul className="mt-10 grid gap-3">
                  {testimonios.map((t) => (
                    <li key={t.nombre} data-revelar className="rounded-2xl bg-fondo p-5">
                      <blockquote className="leading-relaxed text-marino">“{t.texto}”</blockquote>
                      <p className="mt-2 text-sm text-tenue">
                        {t.nombre}
                        {t.ejemplo && <span className="ml-2 rounded-full border border-linea bg-white px-2 py-0.5 text-xs">Ejemplo</span>}
                      </p>
                    </li>
                  ))}
                </ul>

                <ul className="mt-8 grid gap-3 text-sm font-medium text-marino sm:grid-cols-2">
                  <li className="flex items-center gap-2"><IconoBalanza className="size-5 text-limpio" />Respaldo legal</li>
                  <li className="flex items-center gap-2"><IconoEscudo className="size-5 text-limpio" />100% confidencial</li>
                </ul>
              </section>

              {/* 6. Transición */}
              <section id="escena-turno" className="py-16 lg:flex lg:min-h-[170svh] lg:items-start lg:pt-[30svh]">
                <div data-texto-turno>
                  <h2 className="text-4xl leading-[1.05] font-semibold tracking-tight text-marino lg:text-6xl">Ahora es tu turno</h2>
                  <p className="mt-4 text-lg text-tenue">Sigue bajando: tu solicitud empieza en la tarjeta.</p>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* El wizard real. En desktop se superpone al escenario y aparece al terminar el giro. */}
        <section id="solicitud" aria-label="Solicitud" className="relative z-30 min-h-svh px-4 pb-20 lg:pt-[5.5rem] lg:pointer-events-none">
          <div id="solicitud-inicio" />
          <div id="solicitud-tarjeta" className="mx-auto w-full max-w-[35rem] rounded-3xl border border-linea/70 bg-white p-5 shadow-tarjeta sm:p-8 lg:pointer-events-auto">
            <Wizard servicio={config.servicio_nombre} precio={config.precio_clp} />
          </div>
          <p className="mx-auto mt-5 max-w-[35rem] text-center text-xs leading-relaxed text-tenue">{NOTA_LEGAL}</p>
        </section>

        {/* 7. Preguntas frecuentes */}
        <section id="preguntas" className="relative z-30 scroll-mt-20 bg-white px-4 py-20 lg:py-32">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-4xl font-semibold tracking-tight text-marino lg:text-5xl">Preguntas frecuentes</h2>
            <div className="mt-10 border-t border-linea">
              {PREGUNTAS.map(({ p, r }) => (
                <details key={p} className="faq border-b border-linea">
                  <summary className="flex list-none items-center justify-between gap-6 py-5 text-lg font-medium text-marino">
                    {p}
                    <IconoMas className="faq-signo size-5 shrink-0 text-tenue transition-transform duration-300" />
                  </summary>
                  <p className="max-w-2xl pb-6 leading-relaxed text-tenue">{r}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Cierre */}
        <section className="relative z-30 bg-marino px-4 py-24 text-center lg:py-36">
          <h2 className="mx-auto max-w-4xl text-4xl leading-[1.05] font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Elimina tu DICOM. Borrón y cuenta nueva.
          </h2>
          <Cta href="#solicitud" variante="invertido" className="mt-10 h-14 px-8 text-base">
            Elimina tu DICOM ahora
            <IconoCheck className="size-4" />
          </Cta>
        </section>
      </main>

      <div className="relative z-30"><Pie config={config} /></div>

      <a
        href={enlaceWhatsApp(config.contacto.whatsapp, "Hola, quiero eliminar mi DICOM. ¿Me pueden orientar?")}
        target="_blank"
        rel="noopener noreferrer"
        className="pulso fixed right-4 bottom-4 z-40 isolate flex h-12 items-center gap-2 rounded-full bg-limpio px-4 text-sm font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-[1.03] lg:right-6 lg:bottom-6"
      >
        <IconoWhatsApp className="size-5" />
        Elimina tu DICOM
      </a>

      <Animaciones />
    </>
  );
}
