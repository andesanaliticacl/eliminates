"use client";

import { useEffect, useRef, useState } from "react";

const PASOS = [
  { titulo: "Nos cuentas tu caso", texto: "Completas un formulario breve o nos escribes. Sin costo y sin compromiso." },
  { titulo: "Análisis en 24 horas", texto: "Revisamos tus antecedentes y evaluamos tu situación particular." },
  { titulo: "Te proponemos la vía", texto: "Administrativa o judicial: te explicamos opciones, plazos y costos con claridad." },
  { titulo: "Gestionamos todo", texto: "Nos encargamos del proceso completo y te mantenemos informado hasta el cierre." },
];

const INTERVALO_MS = 2400;

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

  return (
    <ol ref={raiz} className="carrusel -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pt-1 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4 lg:gap-4">
      {PASOS.map(({ titulo, texto }, i) => {
        const hecho = i <= activo;
        return (
          <li key={titulo} className="w-[78%] shrink-0 snap-center sm:w-auto">
            <button
              type="button"
              aria-current={i === activo ? "step" : undefined}
              onClick={() => {
                setManual(true);
                setActivo(i);
              }}
              className={`tarjeta-luz tarjeta-alza flex size-full flex-col rounded-3xl border bg-superficie p-5 text-left transition-colors duration-300 lg:p-6 ${
                i === activo ? "border-limpio" : "border-linea"
              }`}
            >
              <span className={`text-5xl font-bold tracking-[-0.04em] tabular-nums transition-colors duration-300 lg:text-6xl ${hecho ? "text-limpio" : "text-linea"}`}>0{i + 1}</span>
              <span className="mt-3 h-1 w-full overflow-hidden rounded-full bg-linea">
                <span className={`block h-full origin-left rounded-full bg-limpio transition-transform duration-500 ease-out ${hecho ? "scale-x-100" : "scale-x-0"}`} />
              </span>
              <span className="mt-4 text-lg leading-snug font-bold tracking-tight text-marino">{titulo}</span>
              <span className="mt-1.5 text-sm leading-relaxed text-tenue">{texto}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
