"use client";

import { useEffect, useRef, useState } from "react";

const PASOS = [
  { titulo: "Nos cuentas tu caso", texto: "Formulario breve, sin costo y sin compromiso." },
  { titulo: "Análisis en 24 horas", texto: "Un abogado revisa tus antecedentes." },
  { titulo: "Te proponemos la vía legal", texto: "Con plazos y costos claros." },
  { titulo: "Gestionamos todo hasta el cierre", texto: "Tú sigues con lo tuyo." },
];

const INTERVALO_MS = 2400;

// Avanza solo mientras se ve en pantalla, hasta que la persona toca un paso.
export function PasosInteractivos() {
  const raiz = useRef<HTMLOListElement>(null);
  const [activo, setActivo] = useState(0);
  const [visible, setVisible] = useState(false);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    const observador = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    if (raiz.current) observador.observe(raiz.current);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || manual || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setActivo((a) => (a + 1) % PASOS.length), INTERVALO_MS);
    return () => clearInterval(t);
  }, [visible, manual]);

  // El sello de la tarjeta del informe acompaña al paso activo.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("eliminate:sello", { detail: visible ? activo : -1 }));
  }, [visible, activo]);

  return (
    <ol ref={raiz} className="relative mt-6 grid gap-3">
      <span aria-hidden="true" className="absolute top-6 bottom-6 left-[1.875rem] w-px bg-linea lg:left-[2.125rem]" />
      <span
        aria-hidden="true"
        className="absolute top-6 bottom-6 left-[1.875rem] w-px origin-top bg-limpio transition-transform duration-500 ease-out lg:left-[2.125rem]"
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
              className={`flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition-[border-color,background-color,box-shadow] duration-300 lg:p-4 ${
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
