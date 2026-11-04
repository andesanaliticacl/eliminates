"use client";

import { useEffect, useRef, useState } from "react";

const PASOS = [
  { titulo: "Nos cuentas tu caso", texto: "Completas un formulario breve o nos escribes. Sin costo y sin compromiso." },
  { titulo: "Análisis en 24 horas", texto: "Revisamos tus antecedentes y evaluamos tu situación particular." },
  { titulo: "Te proponemos la vía", texto: "Administrativa o judicial: te explicamos opciones, plazos y costos con claridad." },
  { titulo: "Gestionamos todo", texto: "Nos encargamos del proceso completo y te mantenemos informado hasta el cierre." },
];

const INTERVALO_MS = 2600;

// Avanza solo mientras se ve en pantalla, hasta que la persona toca un paso.
export function PasosInteractivos() {
  const raiz = useRef<HTMLOListElement>(null);
  const [activo, setActivo] = useState(0);
  const [visible, setVisible] = useState(false);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    const observador = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 });
    if (raiz.current) observador.observe(raiz.current);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || manual || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setActivo((a) => (a + 1) % PASOS.length), INTERVALO_MS);
    return () => clearInterval(t);
  }, [visible, manual]);

  // El informe acompaña al paso activo: un sello en cada etapa e historial limpio al final.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("eliminate:sello", { detail: visible ? activo : -1 }));
  }, [visible, activo]);

  return (
    <ol ref={raiz} className="relative mt-4 grid gap-2.5">
      <span aria-hidden="true" className="absolute top-6 bottom-6 left-[2.125rem] w-px bg-linea" />
      <span
        aria-hidden="true"
        className="absolute top-6 bottom-6 left-[2.125rem] w-px origin-top bg-limpio transition-transform duration-500 ease-out"
        style={{ transform: `scaleY(${activo / (PASOS.length - 1)})` }}
      />
      {PASOS.map(({ titulo, texto }, i) => {
        const hecho = i <= activo;
        return (
          <li key={titulo} className="relative">
            <button
              type="button"
              aria-current={i === activo ? "step" : undefined}
              onClick={() => {
                setManual(true);
                setActivo(i);
              }}
              className={`tarjeta-luz flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-[border-color,background-color,box-shadow] duration-300 ${
                i === activo ? "border-limpio bg-white shadow-md" : "border-linea/80 bg-white/90 hover:border-marino/40"
              }`}
            >
              <span className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums transition-colors duration-300 ${hecho ? "bg-limpio text-white" : "border border-linea bg-white text-marino"}`}>
                0{i + 1}
              </span>
              <span>
                <span className="block font-semibold tracking-tight text-marino">{titulo}</span>
                <span className="block text-sm leading-snug text-tenue">{texto}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
