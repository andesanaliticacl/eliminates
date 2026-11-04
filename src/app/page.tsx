import { IconoBalanza, IconoCheck, IconoEscudo, IconoFlecha, IconoWhatsApp } from "@/components/iconos";
import { Animaciones } from "@/components/landing/Animaciones";
import { Cta } from "@/components/landing/Cta";
import { Navbar } from "@/components/landing/Navbar";
import { PanelTabs } from "@/components/landing/PanelTabs";
import { Pie } from "@/components/landing/Pie";
import { Escenario } from "@/components/landing/TarjetaInforme";
import { Wizard } from "@/components/wizard/Wizard";
import { enlaceWhatsApp, NOTA_LEGAL, urlSitio } from "@/lib/config";
import { configPublica } from "@/lib/store";

export const revalidate = 60;

const PREGUNTAS = [
  {
    p: "¿Cuánto demora el análisis de mi caso?",
    r: "Analizamos tus antecedentes y te entregamos una evaluación de tu situación particular dentro de 24 horas desde que recibimos tu información.",
  },
  {
    p: "¿Qué antecedentes se pueden eliminar?",
    r: "Trabajamos con informes comerciales, financieros, de deuda castigada y antecedentes penales. En la evaluación te decimos qué aplica en tu caso y por qué.",
  },
  {
    p: "¿Cuál es la diferencia entre la vía administrativa y la judicial?",
    r: "La vía administrativa se tramita ante el organismo correspondiente; la judicial, ante tribunales. Según tu caso te recomendamos la que tenga mejores posibilidades y plazos.",
  },
  {
    p: "¿Cuánto cuesta?",
    r: "La evaluación inicial es sin costo. El valor de la gestión depende de la vía y del tipo de antecedente. Si agendas una cita, antes de confirmar ves en el resumen el abono que se paga.",
  },
  {
    p: "¿Mis datos están seguros?",
    r: "Sí. Tratamos tu información de forma confidencial y solo la usamos para evaluar y gestionar tu caso.",
  },
  {
    p: "¿Qué documentos necesito?",
    r: "Tu cédula de identidad por ambos lados, tu informe DICOM o Equifax y, si aplica, tu certificado de antecedentes. Si te falta alguno, igual puedes enviar tu solicitud.",
  },
];

const PALABRAS_TITULO = ["Tu", "historial", "no", "tiene", "por", "qué", "definirte."];

export default async function Inicio() {
  const config = await configPublica();
  const { contadores, contacto } = config;
  // Las cifras y testimonios de fábrica no se publican: aparecen al cargar los reales en el panel.
  const testimonios = config.testimonios.filter((t) => !t.ejemplo);
  const cifras = contadores.ejemplo
    ? []
    : [
        { valor: contadores.casos_evaluados, etiqueta: "casos evaluados", prefijo: "+" },
        { valor: contadores.casos_gestionados, etiqueta: "casos gestionados", prefijo: "+" },
        { valor: contadores.anos_experiencia, etiqueta: "años de experiencia", prefijo: "" },
      ];

  const datosEstructurados = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LegalService",
        name: "Elimínate",
        url: urlSitio(),
        telephone: contacto.telefono,
        email: contacto.correo,
        areaServed: { "@type": "Country", name: "Chile" },
        description: "Gestión legal para eliminar DICOM, deuda castigada y antecedentes comerciales, financieros y penales.",
      },
      {
        "@type": "FAQPage",
        mainEntity: PREGUNTAS.map(({ p, r }) => ({ "@type": "Question", name: p, acceptedAnswer: { "@type": "Answer", text: r } })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados).replace(/</g, "\\u003c") }} />
      <Navbar logoUrl={config.logo_url} />

      <main>
        <div id="historia" className="relative overflow-x-clip pt-14 lg:pt-0">
          <Escenario />

          <div className="mx-auto max-w-[77.5rem] px-4 lg:px-8">
            <div className="lg:relative lg:z-20 lg:w-[46%]">
              {/* Inicio */}
              <section id="inicio" className="flex flex-col justify-start pt-3 pb-10 lg:min-h-svh lg:justify-center lg:pt-20 lg:pb-8">
                <p className="etiqueta-seccion aparece" style={{ "--retraso": "0s" } as React.CSSProperties}>Elimina tu DICOM</p>
                <h1 className="text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.03em] text-marino sm:text-6xl lg:text-[4.25rem] lg:[@media(max-height:760px)]:text-[3.5rem]">
                  {PALABRAS_TITULO.map((palabra, i) => (
                    <span key={i}>
                      <span className="palabra" style={{ "--i": i } as React.CSSProperties}>{palabra}</span>{" "}
                    </span>
                  ))}
                </h1>
                <p className="aparece mt-4 max-w-[34rem] text-[1.05rem] leading-relaxed text-tenue lg:mt-5 lg:text-lg" style={{ "--retraso": "0.15s" } as React.CSSProperties}>
                  Eliminamos antecedentes comerciales, financieros, de deuda castigada y penales, con gestión legal por vía administrativa o judicial. Borrón y cuenta nueva, hecho bien.
                </p>
                <p className="aparece mt-4 flex items-center gap-2.5 lg:mt-5" style={{ "--retraso": "0.2s" } as React.CSSProperties}>
                  <span className="rounded-lg bg-limpio-claro px-2 py-0.5 text-base font-semibold tracking-tight whitespace-nowrap text-limpio-oscuro">24 h</span>
                  <span className="text-sm leading-snug font-medium text-marino">Analizamos tus antecedentes y evaluamos tu caso</span>
                </p>
                <div className="aparece mt-5 flex flex-col gap-3 sm:flex-row lg:mt-6" style={{ "--retraso": "0.25s" } as React.CSSProperties}>
                  <Cta href="#solicitud" className="h-13 px-7 text-base">
                    Evaluar mi caso
                    <IconoFlecha className="size-4" />
                  </Cta>
                  <Cta href="#como-funciona" variante="secundario" className="h-13 px-7 text-base">Cómo funciona</Cta>
                </div>
                <div className="aparece mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.8rem] text-tenue lg:text-sm" style={{ "--retraso": "0.35s" } as React.CSSProperties}>
                  <span className="flex items-center gap-1.5"><IconoEscudo className="size-4 text-limpio" />100% confidencial</span>
                  <span className="flex items-center gap-1.5"><IconoBalanza className="size-4 text-limpio" />Respaldo legal</span>
                  <span className="flex items-center gap-1.5"><IconoCheck className="size-4 text-limpio" />Caso a caso</span>
                </div>
              </section>

              {/* Servicios, cómo funciona y preguntas: un solo panel con pestañas */}
              <section id="panel" className="scroll-mt-14 py-6 lg:flex lg:min-h-svh lg:scroll-mt-0 lg:flex-col lg:justify-center lg:pt-20 lg:pb-6">
                <PanelTabs preguntas={PREGUNTAS} />
              </section>
            </div>
          </div>
        </div>

        {/* Solo se muestra con datos reales cargados en el panel de administración */}
        {(cifras.length > 0 || testimonios.length > 0) && (
          <section aria-label="Respaldo" className="relative z-30 bg-white px-4 py-10">
            <div className="mx-auto grid max-w-[77.5rem] gap-3 lg:grid-cols-3 lg:px-4">
              {cifras.map(({ valor, etiqueta, prefijo }) => (
                <div key={etiqueta} className="tarjeta-luz rounded-2xl border border-linea/80 bg-white p-5">
                  <p className="text-3xl font-semibold tracking-tight text-marino tabular-nums">
                    {prefijo}<span data-contador={valor}>{valor.toLocaleString("es-CL")}</span>
                  </p>
                  <p className="mt-1 text-sm text-tenue">{etiqueta}</p>
                </div>
              ))}
              {testimonios.map((t) => (
                <figure key={t.nombre} className="rounded-2xl bg-fondo p-5">
                  <blockquote className="text-sm leading-relaxed text-marino">“{t.texto}”</blockquote>
                  <figcaption className="mt-2 text-xs text-tenue">{t.nombre}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Evaluación */}
        <section id="solicitud" aria-label="Solicitud" className="relative z-30 scroll-mt-14 bg-fondo px-4 py-12 lg:py-20">
          <div id="solicitud-inicio" />
          <div className="mx-auto grid max-w-[77.5rem] items-start gap-8 lg:grid-cols-2 lg:gap-12 lg:px-4">
            <div className="lg:sticky lg:top-28">
              <p className="etiqueta-seccion">Evaluación</p>
              <h2 className="text-[2rem] leading-[1.08] font-semibold tracking-tight text-marino lg:text-5xl">Empieza hoy. Te respondemos en 24 horas.</h2>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-tenue">
                Cuéntanos qué antecedentes te afectan. Un especialista revisará tu situación y te contactará con una propuesta concreta.
              </p>
              <ul className="mt-6 grid max-w-lg gap-2 text-sm font-medium text-marino sm:grid-cols-2">
                <li className="flex items-center gap-2 rounded-2xl border border-linea/80 bg-white p-3"><IconoEscudo className="size-5 shrink-0 text-limpio" />Tus datos son confidenciales</li>
                <li>
                  <a href={enlaceWhatsApp(contacto.whatsapp, "Hola, quiero evaluar mi caso.")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-2xl border border-linea/80 bg-white p-3 transition-colors hover:border-marino/40">
                    <IconoWhatsApp className="size-5 shrink-0 text-limpio" />Prefiero escribir por WhatsApp
                  </a>
                </li>
              </ul>
              <p className="mt-3 text-sm text-tenue">Usamos tus datos solo para evaluar tu caso.</p>
            </div>
            <div>
              <div id="solicitud-tarjeta" className="mx-auto w-full max-w-[35rem] rounded-3xl border border-linea/70 bg-white p-5 shadow-tarjeta sm:p-8 lg:mr-0">
                <Wizard servicio={config.servicio_nombre} precio={config.precio_clp} />
              </div>
              <p className="mx-auto mt-4 max-w-[35rem] text-center text-xs leading-relaxed text-tenue lg:mr-0">{NOTA_LEGAL}</p>
            </div>
          </div>
        </section>

        {/* Cierre */}
        <section className="cierre-radar relative z-30 overflow-hidden bg-marino px-4 py-14 text-center lg:py-20">
          <h2 className="text-4xl font-semibold tracking-tight text-white lg:text-6xl">Borrón y cuenta nueva.</h2>
          <Cta href="#solicitud" variante="invertido" className="mt-7 h-13 px-8 text-base">
            Evaluar mi caso
            <IconoFlecha className="size-4" />
          </Cta>
        </section>
      </main>

      <div className="relative z-30"><Pie config={config} /></div>

      <a
        href={enlaceWhatsApp(contacto.whatsapp, "Hola, quiero eliminar mi DICOM. ¿Me pueden orientar?")}
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
