import { IconoBalanza, IconoCheck, IconoEscudo, IconoFlecha, IconoWhatsApp } from "@/components/iconos";
import { Cta } from "@/components/landing/Cta";
import { DialogoEvaluacion } from "@/components/landing/DialogoEvaluacion";
import { InformeBorrable } from "@/components/landing/InformeBorrable";
import { LuzTarjetas } from "@/components/landing/LuzTarjetas";
import { Navbar } from "@/components/landing/Navbar";
import { PanelTabs } from "@/components/landing/PanelTabs";
import { Pie } from "@/components/landing/Pie";
import { enlaceWhatsApp, urlSitio } from "@/lib/config";
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
    r: "La evaluación inicial es sin costo y sin compromiso. El valor de la gestión depende de la vía y del tipo de antecedente, y te lo informamos con claridad antes de empezar.",
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
        {/* Inicio: una sola pantalla, con el informe como protagonista */}
        <section id="inicio" className="relative isolate overflow-hidden px-4 pt-16 pb-6 lg:flex lg:min-h-svh lg:items-center lg:pt-20 lg:pb-8">
          <div className="mx-auto grid w-full max-w-[77.5rem] items-center gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-12 lg:px-4">
            <div>
              <p className="aparece flex items-center gap-2.5" style={{ "--retraso": "0s" } as React.CSSProperties}>
                <span className="shrink-0 rounded-full bg-limpio px-2.5 py-0.5 text-sm font-bold whitespace-nowrap text-white">24 h</span>
                <span className="text-[0.8rem] leading-tight font-medium text-marino lg:text-sm">Analizamos tus antecedentes y evaluamos tu caso</span>
              </p>
              <h1 className="titular mt-3 text-[2.75rem] leading-[1] font-bold tracking-[-0.04em] text-marino sm:text-6xl lg:mt-5 lg:text-[4.5rem] lg:[@media(max-height:720px)]:text-[3.75rem]">
                Tu historial no tiene por qué <span className="marcador">definirte.</span>
              </h1>
              <p className="aparece mt-4 hidden max-w-[32rem] text-lg leading-relaxed text-tenue sm:block" style={{ "--retraso": "0.15s" } as React.CSSProperties}>
                Eliminamos antecedentes comerciales, financieros, de deuda castigada y penales, con gestión legal por vía administrativa o judicial. Borrón y cuenta nueva, hecho bien.
              </p>
              <div className="aparece mt-6 hidden flex-wrap gap-3 lg:flex" style={{ "--retraso": "0.25s" } as React.CSSProperties}>
                <Cta href="#solicitud" className="h-13 px-7 text-base">
                  Evaluar mi caso gratis
                  <IconoFlecha className="size-4" />
                </Cta>
                <Cta href="#como-funciona" variante="secundario" className="h-13 px-7 text-base">Cómo funciona</Cta>
              </div>
              <div className="aparece mt-5 hidden flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-tenue lg:flex" style={{ "--retraso": "0.35s" } as React.CSSProperties}>
                <span className="flex items-center gap-1.5"><IconoEscudo className="size-4 text-limpio" />100% confidencial</span>
                <span className="flex items-center gap-1.5"><IconoBalanza className="size-4 text-limpio" />Respaldo legal</span>
                <span className="flex items-center gap-1.5"><IconoCheck className="size-4 text-limpio" />Caso a caso</span>
              </div>
            </div>

            <InformeBorrable />

            {/* En móvil el botón va después del informe, para que se vea sin bajar */}
            <div className="flex flex-col gap-2 lg:hidden">
              <Cta href="#solicitud" className="h-13 px-7 text-base">
                Evaluar mi caso gratis
                <IconoFlecha className="size-4" />
              </Cta>
            </div>
          </div>
        </section>

        {/* Servicios, cómo funciona y preguntas: un solo panel con pestañas */}
        <section id="panel" className="relative scroll-mt-16 border-t border-linea bg-fondo px-4 py-10 lg:py-14">
          <div className="mx-auto max-w-[77.5rem] lg:px-4">
            <PanelTabs preguntas={PREGUNTAS} />
          </div>
        </section>

        {/* Solo se muestra con datos reales cargados en el panel de administración */}
        {(cifras.length > 0 || testimonios.length > 0) && (
          <section aria-label="Respaldo" className="bg-fondo px-4 pb-10">
            <div className="mx-auto grid max-w-[77.5rem] gap-3 lg:grid-cols-3 lg:px-4">
              {cifras.map(({ valor, etiqueta, prefijo }) => (
                <div key={etiqueta} className="tarjeta-luz rounded-3xl border border-linea bg-superficie p-5">
                  <p className="text-4xl font-bold tracking-tight text-marino tabular-nums">{prefijo}{valor.toLocaleString("es-CL")}</p>
                  <p className="mt-1 text-sm text-tenue">{etiqueta}</p>
                </div>
              ))}
              {testimonios.map((t) => (
                <figure key={t.nombre} className="rounded-3xl border border-linea bg-superficie p-5">
                  <blockquote className="text-sm leading-relaxed text-marino">“{t.texto}”</blockquote>
                  <figcaption className="mt-2 text-xs text-tenue">{t.nombre}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Cierre */}
        <section className="cierre-radar overflow-hidden px-4 py-12 text-center lg:py-16">
          <h2 className="text-4xl font-bold tracking-[-0.03em] lg:text-6xl">Borrón y cuenta nueva.</h2>
          <Cta href="#solicitud" variante="invertido" className="mt-6 h-13 px-8 text-base">
            Evaluar mi caso
            <IconoFlecha className="size-4" />
          </Cta>
        </section>
      </main>

      <Pie config={config} />

      <a
        href={enlaceWhatsApp(contacto.whatsapp, "Hola, quiero eliminar mi DICOM. ¿Me pueden orientar?")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Elimina tu DICOM: escríbenos por WhatsApp"
        className="pulso fixed right-3 bottom-3 z-40 isolate flex h-12 items-center gap-2 rounded-full bg-limpio px-3.5 text-sm font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-[1.03] lg:right-6 lg:bottom-6 lg:px-4"
      >
        <IconoWhatsApp className="size-6 lg:size-5" />
        <span className="hidden lg:inline">Elimina tu DICOM</span>
      </a>

      <DialogoEvaluacion whatsapp={contacto.whatsapp} />
      <LuzTarjetas />
    </>
  );
}
