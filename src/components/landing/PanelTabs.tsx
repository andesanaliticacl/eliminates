"use client";

import { useEffect, useState } from "react";
import { abrirEvaluacion } from "@/lib/scroll";
import { IconoBalanza, IconoCheck, IconoDocumento, IconoEscudo, IconoFlecha, IconoMas } from "../iconos";
import { PasosInteractivos } from "./PasosInteractivos";

const PESTANAS = [
  { id: "servicios", nombre: "Servicios", titulo: "Lo que te frena, lo eliminamos.", bajada: "Cada situación es distinta. Revisamos tu caso y elegimos la vía legal que corresponde." },
  { id: "como-funciona", nombre: "Cómo funciona", titulo: "De tu primer mensaje a tu historial limpio.", bajada: "Cuatro pasos. Tú no haces trámites." },
  { id: "preguntas", nombre: "Preguntas", titulo: "Resolvemos tus dudas.", bajada: "¿No encuentras la tuya? Escríbenos y te respondemos." },
];

const SERVICIOS = [
  {
    titulo: "Antecedentes comerciales y financieros",
    texto: "Eliminación de informes comerciales, financieros y de deuda castigada que hoy te cierran puertas en bancos, créditos o trabajos.",
    Icono: IconoDocumento,
    fondoIcono: "bg-deuda/15 text-deuda",
    puntos: ["Deuda castigada", "Informes comerciales", "Antecedentes financieros"],
  },
  {
    titulo: "Antecedentes penales",
    texto: "Gestionamos la eliminación de antecedentes penales para que tu certificado deje de ser un obstáculo para trabajar y avanzar.",
    Icono: IconoEscudo,
    fondoIcono: "bg-ambar/20 text-ambar",
    puntos: ["Revisión de requisitos", "Preparación de antecedentes", "Seguimiento hasta el resultado"],
  },
  {
    titulo: "Gestión legal",
    texto: "Llevamos tu caso mediante procedimiento administrativo o judicial, según lo que más te convenga. Tú no haces trámites.",
    Icono: IconoBalanza,
    fondoIcono: "bg-limpio/15 text-limpio",
    puntos: ["Vía administrativa", "Vía judicial", "Representación completa"],
  },
];

// Todo el contenido queda en el HTML (SEO), pero se muestra en un solo lugar: menos scroll.
export function PanelTabs({ preguntas }: { preguntas: { p: string; r: string }[] }) {
  const [activa, setActiva] = useState("servicios");

  useEffect(() => {
    const abrir = (e: Event) => setActiva((e as CustomEvent<string>).detail);
    window.addEventListener("eliminate:pestana", abrir);
    const hash = window.location.hash.slice(1);
    if (PESTANAS.some((p) => p.id === hash)) setActiva(hash);
    return () => window.removeEventListener("eliminate:pestana", abrir);
  }, []);

  const panel = (id: string) => ({
    id,
    role: "tabpanel",
    "aria-labelledby": `pestana-${id}`,
    hidden: activa !== id,
    className: activa === id ? "panel-entra" : undefined,
  });

  const actual = PESTANAS.find((p) => p.id === activa)!;

  return (
    <>
      <div role="tablist" aria-label="Información" className="mx-auto flex w-full max-w-lg gap-1 rounded-full border border-linea bg-superficie p-1">
        {PESTANAS.map(({ id, nombre }) => (
          <button
            key={id}
            id={`pestana-${id}`}
            type="button"
            role="tab"
            aria-selected={activa === id}
            aria-controls={id}
            onClick={() => setActiva(id)}
            className={`h-10 flex-1 rounded-full px-2 text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
              activa === id ? "bg-marino text-white" : "text-tenue hover:text-marino"
            }`}
          >
            {nombre}
          </button>
        ))}
      </div>

      <div key={activa} className="panel-entra mx-auto mt-6 max-w-3xl text-center lg:mt-8">
        <h2 className="text-3xl leading-[1.08] font-bold tracking-[-0.03em] text-marino lg:text-5xl">{actual.titulo}</h2>
        <p className="mx-auto mt-2 text-tenue lg:text-lg">{actual.bajada}</p>
      </div>

      <div className="mt-6 lg:mt-8">
        <div {...panel("servicios")}>
          <ul className="carrusel -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pt-1 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:gap-4">
            {SERVICIOS.map(({ titulo, texto, Icono, fondoIcono, puntos }) => (
              <li key={titulo} className="tarjeta-luz tarjeta-alza flex w-[85%] shrink-0 snap-center flex-col rounded-3xl border border-linea bg-superficie p-5 md:w-auto lg:p-6">
                <span className={`grid size-12 place-items-center rounded-2xl ${fondoIcono}`}>
                  <Icono className="size-6" />
                </span>
                <h3 className="mt-4 text-lg leading-snug font-bold tracking-tight text-marino">{titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-tenue">{texto}</p>
                <ul className="mt-3 grid gap-1.5 text-sm font-medium text-marino">
                  {puntos.map((punto) => (
                    <li key={punto} className="flex items-center gap-2">
                      <IconoCheck className="size-4 shrink-0 text-limpio" strokeWidth={2.4} />
                      {punto}
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={abrirEvaluacion} className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-semibold text-limpio-oscuro">
                  Evaluar mi caso
                  <IconoFlecha className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div {...panel("como-funciona")}>
          <PasosInteractivos />
        </div>

        <div {...panel("preguntas")}>
          <div className="grid items-start gap-2.5 md:grid-cols-2">
            {preguntas.map(({ p, r }) => (
              <details key={p} name="preguntas" className="faq tarjeta-luz rounded-2xl border border-linea bg-superficie px-5">
                <summary className="flex min-h-14 list-none items-center justify-between gap-4 py-3 font-semibold text-marino">
                  {p}
                  <IconoMas className="faq-signo size-5 shrink-0 text-tenue transition-transform duration-300" />
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-tenue">{r}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
