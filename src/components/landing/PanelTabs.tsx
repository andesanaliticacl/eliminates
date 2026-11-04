"use client";

import { useEffect, useState } from "react";
import { IconoMas } from "../iconos";
import { PasosInteractivos } from "./PasosInteractivos";
import { SelectorAntecedentes } from "./SelectorAntecedentes";

const PESTANAS = [
  { id: "servicios", nombre: "Servicios" },
  { id: "como-funciona", nombre: "Cómo funciona" },
  { id: "preguntas", nombre: "Preguntas" },
];

const TITULO = "text-[1.75rem] leading-[1.1] font-semibold tracking-tight text-marino lg:text-4xl";

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
    className: activa === id ? "panel-entra mt-5" : undefined,
  });

  return (
    <>
      <div role="tablist" aria-label="Información" className="flex gap-1 rounded-full border border-linea/80 bg-white/80 p-1 backdrop-blur-sm">
        {PESTANAS.map(({ id, nombre }) => (
          <button
            key={id}
            id={`pestana-${id}`}
            type="button"
            role="tab"
            aria-selected={activa === id}
            aria-controls={id}
            onClick={() => setActiva(id)}
            className={`h-9 flex-1 rounded-full px-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
              activa === id ? "bg-marino text-white" : "text-marino hover:bg-fondo"
            }`}
          >
            {nombre}
          </button>
        ))}
      </div>

      <div {...panel("servicios")}>
        <h2 className={TITULO}>Lo que te frena, lo eliminamos.</h2>
        <p className="mt-1.5 text-tenue">Cada situación es distinta. Revisamos tu caso y elegimos la vía legal que corresponde.</p>
        <SelectorAntecedentes />
      </div>

      <div {...panel("como-funciona")}>
        <h2 className={TITULO}>De tu primer mensaje a tu historial limpio.</h2>
        <PasosInteractivos />
      </div>

      <div {...panel("preguntas")}>
        <h2 className={TITULO}>Resolvemos tus dudas.</h2>
        <p className="mt-1.5 text-tenue">¿No encuentras la tuya? Escríbenos y te respondemos.</p>
        <div className="mt-4 grid gap-2">
          {preguntas.map(({ p, r }) => (
            <details key={p} name="preguntas" className="faq tarjeta-luz rounded-2xl border border-linea/80 bg-white px-4 shadow-[0_1px_2px_rgb(11_31_58/0.04)]">
              <summary className="flex min-h-12 list-none items-center justify-between gap-4 py-2.5 font-medium text-marino">
                {p}
                <IconoMas className="faq-signo size-5 shrink-0 text-tenue transition-transform duration-300" />
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-tenue">{r}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
