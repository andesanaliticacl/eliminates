"use client";

import { useEffect } from "react";
import type { Antecedente } from "@/lib/tipos";
import { actualizarBorrador, antecedentesActuales } from "../wizard/borrador";

// Todo se carga de forma diferida: GSAP y Lenis no compiten con el primer pintado (Lighthouse móvil).
//
// El informe no lo mueve el scroll: refleja un estado (qué eligió la persona y en qué paso del
// proceso está). pintar() anima desde donde esté hacia ese estado, así nunca queda a medias.
export function Animaciones() {
  useEffect(() => {
    let cancelado = false;
    let limpiar = () => {};

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelado) return;
      gsap.registerPlugin(ScrollTrigger);
      limpiar = await montar(gsap, ScrollTrigger);
      if (cancelado) limpiar();
    })().catch((error) => console.error(error));

    return () => {
      cancelado = true;
      limpiar();
    };
  }, []);

  return null;
}

type Gsap = typeof import("gsap").gsap;
type ST = typeof import("gsap/ScrollTrigger").ScrollTrigger;

// Mismo orden que las filas del informe y las detecciones del radar.
const ORDEN_FILAS: Antecedente[] = ["dicom", "informe_comercial", "financiero", "penal"];
const AGUJA_INICIO = -90;
const AGUJA_MOROSO = -70;
const AGUJA_POR_FILA = 34;
const AGUJA_LIMPIO = 68;
const ULTIMO_PASO = 3;

async function montar(gsap: Gsap, ScrollTrigger: ST) {
  const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s);
  const $$ = <T extends Element = HTMLElement>(s: string) => gsap.utils.toArray<T>(s);

  // Movimiento reducido: el informe igual responde, pero cambia sin animar y sin smooth scroll.
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const seg = (s: number) => (reducido ? 0 : s);

  const aguja = $<SVGGElement>("[data-aguja]")!;
  const puntaje = $("[data-puntaje]")!;
  const rotacion = { r: AGUJA_INICIO };
  const dibujarAguja = () => {
    aguja.style.transform = `rotate(${rotacion.r}deg)`;
    puntaje.textContent = String(Math.round(300 + ((rotacion.r + 90) / 180) * 550));
  };

  gsap.set("[data-sello]", { xPercent: -50, yPercent: -50, rotation: -4 });

  // ─── Estado del informe ───────────────────────────────────────────────────
  let pasoFinal = false;
  let estabaLimpio = false;
  let primeraVez = true;
  let puertasVisibles = false;
  let yaToco = false;

  const riesgo = $("[data-riesgo]");
  const pintarRiesgo = (limpio: boolean, eliminadas: number) => {
    if (!riesgo) return;
    const [nivel, texto, clases] = limpio
      ? ["limpio", "Listo para empezar de nuevo", "bg-limpio-claro text-limpio-oscuro"]
      : eliminadas >= 2
        ? ["medio", "Riesgo medio", "bg-ambar/20 text-marino"]
        : ["alto", "Riesgo alto", "bg-deuda/10 text-deuda"];
    if (riesgo.dataset.riesgo === nivel) return;
    riesgo.dataset.riesgo = nivel;
    riesgo.textContent = texto;
    riesgo.className = `rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold whitespace-nowrap ${clases}`;
  };
  const pintarPista = () => {
    gsap.to("[data-pista]", { autoAlpha: yaToco || puertasVisibles ? 0 : 1, duration: seg(0.3), overwrite: "auto" });
  };

  const pintar = () => {
    const elegidas = antecedentesActuales();
    const limpio = pasoFinal || elegidas.length === ORDEN_FILAS.length;
    const a = { overwrite: "auto" as const };

    let eliminadas = 0;
    ORDEN_FILAS.forEach((id, i) => {
      const activa = limpio || elegidas.includes(id);
      if (activa) eliminadas += 1;
      const s = `[data-fila="${i}"]`;
      $(s)?.setAttribute("aria-pressed", String(elegidas.includes(id)));
      gsap.to(`${s} [data-tachado]`, { scaleX: activa ? 1 : 0, duration: seg(0.4), ease: "power2.inOut", ...a });
      gsap.to(`${s} [data-fila-fondo]`, { scaleX: activa ? 1 : 0, duration: seg(0.5), delay: seg(activa ? 0.1 : 0), ease: "power3.out", ...a });
      gsap.to(`${s} [data-fila-etiqueta]`, { opacity: activa ? 0.7 : 1, duration: seg(0.3), ...a });
      gsap.to(`${s} [data-fila-valor]`, { opacity: activa ? 0 : 1, duration: seg(0.2), ...a });
      gsap.to(`${s} [data-fila-eliminado]`, { opacity: activa ? 1 : 0, scale: activa ? 1 : 0.85, duration: seg(0.35), delay: seg(activa ? 0.15 : 0), ease: "back.out(1.7)", ...a });
      gsap.to(`[data-deteccion="${i}"]`, { opacity: activa ? 0 : 1, scale: activa ? 0.6 : 1, duration: seg(0.4), ...a });
    });

    gsap.to(rotacion, {
      r: limpio ? AGUJA_LIMPIO : AGUJA_MOROSO + eliminadas * AGUJA_POR_FILA,
      duration: seg(primeraVez ? 1.4 : 0.8),
      delay: seg(primeraVez ? 0.4 : 0),
      ease: "power3.out",
      overwrite: true,
      onUpdate: dibujarAguja,
      onComplete: dibujarAguja,
    });

    gsap.to("[data-cabecera-limpia]", { scaleX: limpio ? 1 : 0, duration: seg(0.6), ease: "power2.inOut", ...a });
    gsap.to("[data-texto-moroso]", { yPercent: limpio ? -130 : 0, opacity: limpio ? 0 : 1, duration: seg(0.3), ...a });
    gsap.to("[data-texto-limpio]", { yPercent: limpio ? 0 : 130, opacity: limpio ? 1 : 0, duration: seg(0.4), delay: seg(limpio ? 0.15 : 0), ...a });
    gsap.to("[data-barrido-rojo]", { opacity: limpio ? 0 : 1, duration: seg(0.6), ...a });
    gsap.to("[data-barrido-verde]", { opacity: limpio ? 1 : 0, duration: seg(0.6), ...a });
    gsap.to("[data-destello]", { opacity: limpio ? 0.45 : 0, duration: seg(0.6), ...a });
    gsap.to("[data-candado-caja]", { opacity: limpio ? 0 : 1, duration: seg(0.25), ...a });
    gsap.to("[data-candado-abierto]", { opacity: limpio ? 1 : 0, duration: seg(0.3), ...a });
    gsap.to("[data-chip-verde]", { opacity: limpio ? 1 : 0, duration: seg(0.4), ...a });

    if (limpio && !estabaLimpio && !reducido) {
      gsap.fromTo("[data-radar-pulso]", { attr: { r: 120 }, opacity: 0.55 }, { attr: { r: 480 }, opacity: 0, duration: 1.4, ease: "power2.out", overwrite: "auto" });
    }
    if (elegidas.length > 0) yaToco = true;
    pintarRiesgo(limpio, eliminadas);
    pintarPista();
    estabaLimpio = limpio;
    primeraVez = false;
  };

  // Cada paso del proceso pone su sello; el último deja el historial limpio.
  const alCambiarPaso = (e: Event) => {
    const paso = (e as CustomEvent<number>).detail;
    const final = paso === ULTIMO_PASO;
    $$("[data-sello]").forEach((sello, i) => {
      const si = i === paso && !final;
      gsap.to(sello, { opacity: si ? 1 : 0, scale: si ? 1 : 1.12, duration: seg(si ? 0.35 : 0.2), ease: "power3.out", overwrite: "auto" });
    });
    if (final !== pasoFinal) {
      pasoFinal = final;
      pintar();
    }
  };

  // Las filas del propio informe también se tocan: comparten la selección con las tarjetas
  const alTocarFila = (e: Event) => {
    const fila = (e.target as Element).closest<HTMLElement>("[data-fila]");
    if (!fila) return;
    const id = ORDEN_FILAS[Number(fila.dataset.fila)];
    const elegidas = antecedentesActuales();
    actualizarBorrador({ antecedentes: elegidas.includes(id) ? elegidas.filter((a) => a !== id) : [...elegidas, id] });
  };
  document.addEventListener("click", alTocarFila);

  // Luz de las tarjetas: una sola escucha para toda la página
  const moverLuz = (e: PointerEvent) => {
    const tarjeta = (e.target as Element).closest?.<HTMLElement>(".tarjeta-luz");
    if (!tarjeta) return;
    const caja = tarjeta.getBoundingClientRect();
    tarjeta.style.setProperty("--luz-x", `${e.clientX - caja.left}px`);
    tarjeta.style.setProperty("--luz-y", `${e.clientY - caja.top}px`);
  };
  document.addEventListener("pointermove", moverLuz, { passive: true });

  window.addEventListener("eliminate:seleccion", pintar);
  window.addEventListener("eliminate:sello", alCambiarPaso);
  pintar();

  const contexto = gsap.context(() => {
    // Las puertas aparecen junto con el panel
    ScrollTrigger.create({
      trigger: "#panel",
      start: "top 75%",
      end: "max",
      onToggle: (self) => {
        puertasVisibles = self.isActive;
        pintarPista();
        gsap.to("[data-chip]", { opacity: self.isActive ? 1 : 0, y: self.isActive ? 0 : 8, duration: seg(0.45), stagger: seg(0.08), ease: "power2.out", overwrite: "auto" });
      },
    });

    $$("[data-contador]").forEach((el) => {
      if (reducido) return;
      const meta = Number(el.dataset.contador);
      const valor = { n: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          gsap.to(valor, {
            n: meta,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = Math.round(valor.n).toLocaleString("es-CL");
            },
          });
        },
      });
    });
  });

  const quitarEventos = () => {
    document.removeEventListener("click", alTocarFila);
    document.removeEventListener("pointermove", moverLuz);
    window.removeEventListener("eliminate:seleccion", pintar);
    window.removeEventListener("eliminate:sello", alCambiarPaso);
  };

  if (reducido) {
    return () => {
      quitarEventos();
      contexto.revert();
    };
  }

  const { default: Lenis } = await import("lenis");
  const lenis = new Lenis({ lerp: 0.12 });
  window.__lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  const tic = (t: number) => lenis.raf(t * 1000);
  gsap.ticker.add(tic);
  gsap.ticker.lagSmoothing(0);

  contexto.add(() => {
    gsap.fromTo("#barra-progreso", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } });
  });

  // Tilt sutil de la tarjeta, solo con mouse
  const mm = gsap.matchMedia();
  mm.add("(min-width: 1024px)", () => {
    const inclinacion = $("[data-inclinacion]")!;
    const rotX = gsap.quickTo(inclinacion, "rotationX", { duration: 1.1, ease: "power3.out" });
    const rotY = gsap.quickTo(inclinacion, "rotationY", { duration: 1.1, ease: "power3.out" });
    const moverPuntero = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      rotY((e.clientX / window.innerWidth - 0.5) * 6);
      rotX((e.clientY / window.innerHeight - 0.5) * -4);
    };
    window.addEventListener("pointermove", moverPuntero, { passive: true });
    return () => window.removeEventListener("pointermove", moverPuntero);
  });

  // Cambiar de pestaña altera el alto de la página.
  const refrescar = () => ScrollTrigger.refresh();
  window.addEventListener("load", refrescar);
  window.addEventListener("eliminate:pestana", refrescar);
  document.fonts?.ready.then(refrescar);

  return () => {
    quitarEventos();
    window.removeEventListener("load", refrescar);
    window.removeEventListener("eliminate:pestana", refrescar);
    contexto.revert();
    mm.revert();
    gsap.ticker.remove(tic);
    lenis.destroy();
    delete window.__lenis;
  };
}
