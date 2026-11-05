"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { abrirEvaluacion } from "@/lib/scroll";
import { IconoBanco, IconoCandado, IconoCandadoAbierto, IconoCasa, IconoFlecha, IconoMaletin, IconoTarjeta } from "../iconos";
import { Radar } from "./Radar";

const FILAS = [
  { etiqueta: "Deuda castigada", valor: "$1.250.000" },
  { etiqueta: "Morosidad comercial", valor: "Vigente" },
  { etiqueta: "Informe financiero", valor: "Negativo" },
  { etiqueta: "Antecedente penal", valor: "Registrado" },
];

const PUERTAS = [
  { nombre: "Banco", Icono: IconoBanco },
  { nombre: "Crédito", Icono: IconoTarjeta },
  { nombre: "Arriendo", Icono: IconoCasa },
  { nombre: "Trabajo", Icono: IconoMaletin },
];

/** Arco del medidor de 180°, de -90° a 90°, entre dos ángulos. */
function arco(desde: number, hasta: number, r = 44, cx = 50, cy = 50) {
  const punto = (a: number) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return `${(cx + r * Math.cos(rad)).toFixed(2)} ${(cy + r * Math.sin(rad)).toFixed(2)}`;
  };
  return `M ${punto(desde)} A ${r} ${r} 0 0 1 ${punto(hasta)}`;
}

function Medidor({ limpio }: { limpio: boolean }) {
  return (
    <div className="w-24 shrink-0 text-center sm:w-32 lg:w-36">
      <svg viewBox="0 0 100 56" className="block w-full" aria-hidden="true">
        <path d={arco(-88, -32)} fill="none" stroke="var(--color-deuda)" strokeWidth="7" strokeLinecap="round" />
        <path d={arco(-26, 26)} fill="none" stroke="var(--color-ambar)" strokeWidth="7" strokeLinecap="round" />
        <path d={arco(32, 88)} fill="none" stroke="var(--color-limpio)" strokeWidth="7" strokeLinecap="round" />
        <g className="informe-aguja">
          <line x1="50" y1="50" x2="50" y2="17" stroke="var(--color-marino)" strokeWidth="2.4" strokeLinecap="round" />
        </g>
        <circle cx="50" cy="50" r="4.4" fill="var(--color-superficie)" stroke="var(--color-marino)" strokeWidth="1.8" />
      </svg>
      <p className="mt-1 text-[0.65rem] leading-none text-tenue lg:text-xs">
        Puntaje <span data-puntaje className="font-semibold text-marino tabular-nums">361</span>
      </p>
      <p className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[0.6rem] leading-tight font-semibold whitespace-nowrap lg:text-[0.68rem] ${limpio ? "bg-limpio-claro text-limpio-oscuro" : "bg-deuda/15 text-deuda"}`}>
        {limpio ? "Listo para empezar" : "Riesgo alto"}
      </p>
    </div>
  );
}

/** Las dos caras son el mismo informe, sucio y limpio: el deslizador recorta una sobre la otra. */
function Cara({ limpio }: { limpio: boolean }) {
  return (
    <div className="bg-superficie">
      <div className={`flex h-10 items-center justify-between gap-2 px-4 text-[#fff] lg:h-12 lg:px-5 ${limpio ? "bg-[#0a7d59]" : "bg-[#a8433f]"}`}>
        <span className="text-[0.6rem] font-medium tracking-[0.1em] whitespace-nowrap uppercase lg:text-[0.68rem]">Informe de antecedentes</span>
        <span className="text-xs font-bold tracking-wide whitespace-nowrap lg:text-sm">{limpio ? "HISTORIAL LIMPIO ✓" : "MOROSO"}</span>
      </div>
      <div className="flex items-center gap-3 p-3 sm:gap-5 lg:p-5">
        <Medidor limpio={limpio} />
        <ul className="min-w-0 flex-1">
          {FILAS.map(({ etiqueta, valor }) => (
            <li key={etiqueta} className={`flex items-center justify-between gap-2 border-t py-1.5 first:border-t-0 lg:py-2.5 ${limpio ? "border-limpio/15" : "border-linea/70"}`}>
              <span className={`min-w-0 truncate text-[0.72rem] lg:text-sm ${limpio ? "text-tenue line-through" : "text-marino"}`}>{etiqueta}</span>
              <span className={`shrink-0 text-[0.65rem] font-semibold lg:text-[0.8rem] ${limpio ? "text-limpio-oscuro" : "text-deuda"}`}>{limpio ? "ELIMINADO" : valor}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function InformeBorrable() {
  const raiz = useRef<HTMLDivElement>(null);
  const control = useRef<HTMLInputElement>(null);
  const arrastrando = useRef(false);
  const demoActiva = useRef(true);
  const [abiertas, setAbiertas] = useState(0);

  const aplicar = useCallback((p: number) => {
    const valor = Math.max(0, Math.min(100, p));
    raiz.current?.style.setProperty("--avance", valor.toFixed(2));
    raiz.current?.querySelectorAll("[data-puntaje]").forEach((n) => {
      n.textContent = String(Math.round(361 + valor * 4.22));
    });
    if (control.current) control.current.value = String(Math.round(valor));
    setAbiertas(valor >= 99 ? 4 : Math.floor(valor / 25));
  }, []);

  // Al cargar, el propio informe muestra qué se puede hacer con él
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tramos = [
      { desde: 0, hasta: 0, ms: 1000 },
      { desde: 0, hasta: 62, ms: 1500 },
      { desde: 62, hasta: 62, ms: 450 },
      { desde: 62, hasta: 0, ms: 1000 },
    ];
    let cuadro = 0;
    let t0 = 0;
    let i = 0;
    const paso = (t: number) => {
      if (!demoActiva.current || i >= tramos.length) return;
      t0 ||= t;
      const { desde, hasta, ms } = tramos[i];
      const x = Math.min(1, (t - t0) / ms);
      aplicar(desde + (hasta - desde) * (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2));
      if (x >= 1) {
        i += 1;
        t0 = t;
      }
      cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [aplicar]);

  const desdePuntero = (e: PointerEvent<HTMLDivElement>) => {
    const caja = e.currentTarget.getBoundingClientRect();
    aplicar(((e.clientX - caja.left) / caja.width) * 100);
  };

  const listo = abiertas === 4;

  return (
    <div ref={raiz} className="informe-raiz relative mx-auto w-full max-w-[34rem]">
      <Radar abiertas={abiertas} />

      <div aria-hidden="true" className="informe-aura-roja absolute -inset-8 -z-10 rounded-[3rem] blur-3xl" />
      <div aria-hidden="true" className="informe-aura-verde absolute -inset-8 -z-10 rounded-[3rem] blur-3xl" />

      <div className="aparece" style={{ "--retraso": "0.1s" } as React.CSSProperties}>
        <div
          onPointerDown={(e) => {
            demoActiva.current = false;
            arrastrando.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            desdePuntero(e);
          }}
          onPointerMove={(e) => arrastrando.current && desdePuntero(e)}
          onPointerUp={() => {
            arrastrando.current = false;
            // Casi al final cuenta como terminado: no hay que acertar al último píxel
            if (Number(control.current?.value) >= 90) aplicar(100);
          }}
          onPointerCancel={() => {
            arrastrando.current = false;
          }}
          className="informe-lienzo relative cursor-ew-resize overflow-hidden rounded-3xl border border-linea shadow-tarjeta select-none"
        >
          <Cara limpio={false} />
          <div aria-hidden="true" className="informe-cara-limpia absolute inset-0">
            <Cara limpio />
          </div>

          <input
            ref={control}
            type="range"
            min={0}
            max={100}
            defaultValue={0}
            aria-label="Borrar el informe de ejemplo"
            onChange={(e) => {
              demoActiva.current = false;
              aplicar(Number(e.target.value));
            }}
            className="peer sr-only"
          />
          <div aria-hidden="true" className="informe-mango absolute inset-y-0 w-0.5 bg-[#fff] shadow-[0_0_18px_rgb(255_255_255/0.9)] peer-focus-visible:[&>span]:ring-4">
            <span className="absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#fff] text-[#0b1f3a] shadow-[0_6px_24px_rgb(0_0_0/0.35)] ring-[#2fc795]">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />
              </svg>
            </span>
          </div>
        </div>

        <ul className="mt-3 grid grid-cols-4 gap-2" aria-label="Puertas que se abren al limpiar tu historial">
          {PUERTAS.map(({ nombre, Icono }, i) => {
            const abierta = i < abiertas;
            return (
              <li key={nombre} className={`flex flex-col items-center gap-1 rounded-2xl border py-2 transition-colors duration-300 lg:flex-row lg:justify-center lg:gap-2 ${abierta ? "border-limpio/50 bg-limpio-claro" : "border-linea bg-superficie"}`}>
                <span className={`grid size-7 place-items-center rounded-full transition-colors duration-300 ${abierta ? "bg-limpio text-white" : "bg-deuda/15 text-deuda"}`}>
                  <Icono className="size-4" />
                </span>
                <span className="flex items-center gap-1 text-[0.68rem] font-medium text-marino lg:text-xs">
                  {nombre}
                  {abierta ? <IconoCandadoAbierto className="size-3 text-limpio" strokeWidth={2} /> : <IconoCandado className="size-3 text-deuda" strokeWidth={2} />}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 flex h-11 items-center justify-center" aria-live="polite">
          {listo ? (
            <button type="button" onClick={abrirEvaluacion} className="panel-entra flex h-11 items-center gap-2 rounded-full bg-limpio px-5 text-sm font-semibold text-white">
              Evalúa tu caso gratis
              <IconoFlecha className="size-4" />
            </button>
          ) : (
            <p className="text-center text-sm text-tenue">
              <span className="font-semibold text-marino">Desliza el informe</span> y mira cómo se abren las puertas. <span className="whitespace-nowrap">Es un ejemplo ilustrativo.</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
