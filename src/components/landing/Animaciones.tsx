"use client";

import { useEffect } from "react";
import type { Antecedente } from "@/lib/tipos";
import { actualizarBorrador, antecedentesActuales } from "../wizard/borrador";

// Todo se carga de forma diferida: GSAP y Lenis no compiten con el primer pintado (Lighthouse móvil).
//
// El informe no lo mueve el scroll: refleja un estado (qué eligió la persona y si ya llegó a la
// escena de confianza). pintar() anima desde donde esté hacia ese estado, así nunca queda a medias.
// Solo el giro final sigue atado al scroll.
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
    })().catch((error) => {
      console.error(error);
      // Si la animación no cargó, el wizard debe quedar disponible igual.
      document.documentElement.removeAttribute("data-anim");
    });

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
const SCRUB = 0.8;

/** Envuelve cada palabra en una máscara para que suba desde abajo. El texto sigue siendo el mismo. */
function dividirTitulo(titulo: HTMLElement): () => void {
  const original = titulo.textContent ?? "";
  titulo.replaceChildren();
  original.split(" ").forEach((palabra, i) => {
    if (i > 0) titulo.append(" ");
    const mascara = document.createElement("span");
    mascara.className = "palabra-mascara";
    const interior = document.createElement("span");
    interior.dataset.palabra = "";
    interior.textContent = palabra;
    mascara.append(interior);
    titulo.append(mascara);
  });
  return () => {
    titulo.textContent = original;
  };
}

async function montar(gsap: Gsap, ScrollTrigger: ST) {
  const raiz = document.documentElement;
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
  let llegoAConfianza = false;
  let estabaLimpio = false;
  let primeraVez = true;
  let puertasVisibles = false;
  let yaToco = false;

  const riesgo = $("[data-riesgo]");
  const pintarRiesgo = (limpio: boolean, eliminadas: number) => {
    if (!riesgo) return;
    const [nivel, texto, clases] = limpio
      ? ["limpio", "Sin antecedentes", "bg-limpio-claro text-limpio-oscuro"]
      : eliminadas >= 2
        ? ["medio", "Riesgo medio", "bg-ambar/20 text-marino"]
        : ["alto", "Riesgo alto", "bg-deuda/10 text-deuda"];
    if (riesgo.dataset.riesgo === nivel) return;
    riesgo.dataset.riesgo = nivel;
    riesgo.textContent = texto;
    riesgo.className = `rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold ${clases}`;
  };
  const pintarPista = () => {
    gsap.to("[data-pista]", { autoAlpha: yaToco || puertasVisibles ? 0 : 1, duration: seg(0.3), overwrite: "auto" });
  };

  const pintar = () => {
    const elegidas = antecedentesActuales();
    const limpio = llegoAConfianza || elegidas.length === ORDEN_FILAS.length;
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

  // En el momento limpio no compite ningún sello con el encabezado verde.
  let selloPedido = -1;
  const pintarSello = () => {
    const activo = llegoAConfianza ? -1 : selloPedido;
    $$("[data-sello]").forEach((sello, i) => {
      const si = i === activo;
      gsap.to(sello, { opacity: si ? 1 : 0, scale: si ? 1 : 1.12, duration: seg(si ? 0.35 : 0.2), ease: "power3.out", overwrite: "auto" });
    });
  };
  const alCambiarSello = (e: Event) => {
    selloPedido = (e as CustomEvent<number>).detail;
    pintarSello();
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
  window.addEventListener("eliminate:sello", alCambiarSello);
  pintar();

  const contexto = gsap.context(() => {
    // Las puertas aparecen con el problema
    ScrollTrigger.create({
      trigger: "#escena-problema",
      start: "top 75%",
      end: "max",
      onToggle: (self) => {
        puertasVisibles = self.isActive;
        pintarPista();
        gsap.to("[data-chip]", { opacity: self.isActive ? 1 : 0, y: self.isActive ? 0 : 8, duration: seg(0.45), stagger: seg(0.08), ease: "power2.out", overwrite: "auto" });
      },
    });

    // Al llegar a la confianza, el informe queda limpio; al volver, respeta lo que se había elegido
    ScrollTrigger.create({
      trigger: "#escena-confianza",
      start: "top 45%",
      end: "max",
      onToggle: (self) => {
        llegoAConfianza = self.isActive;
        pintar();
        pintarSello();
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
    window.removeEventListener("eliminate:sello", alCambiarSello);
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

  const restaurarTitulos = $$("[data-titulo]").map(dividirTitulo);

  // Dentro de un timeline, fromTo pintaría su estado inicial de inmediato y pisaría al HTML.
  const desde = (tl: gsap.core.Timeline, target: gsap.TweenTarget, de: gsap.TweenVars, a: gsap.TweenVars, posicion: number) =>
    tl.fromTo(target, de, { ...a, immediateRender: false }, posicion);

  contexto.add(() => {
    gsap.fromTo("#barra-progreso", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } });

    $$("[data-titulo]").forEach((titulo) => {
      gsap.fromTo(
        titulo.querySelectorAll("[data-palabra]"),
        { yPercent: 135 },
        { yPercent: 0, duration: 0.9, stagger: 0.05, ease: "power4.out", scrollTrigger: { trigger: titulo, start: "top 92%", toggleActions: "play none none reverse" } },
      );
    });

    // Tarjetas: entran juntas y rápido, sin esperar scroll
    $$("[data-revelar]").forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 95%", toggleActions: "play none none reverse" } },
      );
    });
  });

  const mm = gsap.matchMedia();

  // ─── Desktop: tilt sutil y giro en su lugar, que convierte la tarjeta en el wizard ───
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

    gsap.fromTo("[data-desliza]", { opacity: 1 }, { opacity: 0, ease: "none", scrollTrigger: { start: 0, end: 160, scrub: 0.2 } });

    const frente = $("[data-frente]")!;
    const reverso = $("[data-reverso-cara]")!;
    const tlGiro = gsap.timeline({
      scrollTrigger: { trigger: "#escena-turno", start: "top 45%", endTrigger: "#historia", end: "bottom bottom", scrub: SCRUB },
    });
    tlGiro.to("[data-chip-caja]", { opacity: 0, duration: 0.25 }, 0);
    tlGiro.to("[data-destello-caja]", { opacity: 0, duration: 0.25 }, 0);
    tlGiro.to("[data-radar]", { opacity: 0, duration: 0.5 }, 0.7);
    desde(tlGiro, frente, { rotationY: 0 }, { rotationY: -90, duration: 0.5, ease: "power2.in" }, 0.2);
    tlGiro.set(frente, { autoAlpha: 0 }, 0.7);
    tlGiro.set(reverso, { opacity: 1 }, 0.7);
    desde(tlGiro, reverso, { rotationY: 90 }, { rotationY: 0, duration: 0.5, ease: "power2.out" }, 0.7);

    // Al terminar, el wizard real toma el lugar del reverso.
    let enfocado = false;
    const intercambio = ScrollTrigger.create({
      trigger: "#historia",
      start: "bottom bottom",
      end: "max",
      onToggle: (self) => {
        if (self.isActive) {
          raiz.setAttribute("data-wizard", "");
          // Un cuadro después: un refresh de ScrollTrigger puede activar y desactivar esto de paso.
          requestAnimationFrame(() => {
            if (enfocado || !self.isActive) return;
            enfocado = true;
            window.dispatchEvent(new Event("eliminate:enfocar-nombre"));
          });
        } else {
          raiz.removeAttribute("data-wizard");
        }
      },
    });

    return () => {
      window.removeEventListener("pointermove", moverPuntero);
      intercambio.kill();
      raiz.removeAttribute("data-wizard");
    };
  });

  // ─── Mobile: giro simple dentro de la tarjeta compacta ────────────────────
  mm.add("(max-width: 1023px)", () => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: "#escena-turno", start: "top 75%", end: "top 25%", scrub: SCRUB } });
    tl.to("[data-chip-caja]", { opacity: 0, duration: 0.2 }, 0);
    tl.to("[data-radar]", { opacity: 0, duration: 0.5 }, 0.3);
    desde(tl, "[data-frente]", { rotationY: 0 }, { rotationY: -90, duration: 0.5, ease: "power2.in" }, 0);
    tl.set("[data-frente]", { autoAlpha: 0 }, 0.5);
    tl.set("[data-reverso-compacto]", { opacity: 1 }, 0.5);
    desde(tl, "[data-reverso-compacto]", { rotationY: 90 }, { rotationY: 0, duration: 0.5, ease: "power2.out" }, 0.5);
  });

  // El alto de las fuentes y de los bloques cambia las posiciones al terminar de cargar.
  const refrescar = () => ScrollTrigger.refresh();
  window.addEventListener("load", refrescar);
  document.fonts?.ready.then(refrescar);

  return () => {
    quitarEventos();
    window.removeEventListener("load", refrescar);
    contexto.revert();
    mm.revert();
    restaurarTitulos.forEach((restaurar) => restaurar());
    gsap.ticker.remove(tic);
    lenis.destroy();
    delete window.__lenis;
  };
}
