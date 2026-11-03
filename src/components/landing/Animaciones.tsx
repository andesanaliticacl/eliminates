"use client";

import { useEffect } from "react";

// Todo se carga de forma diferida: GSAP y Lenis no compiten con el primer pintado (Lighthouse móvil).
//
// Regla de estas escenas: cada propiedad de cada elemento la anima un solo tween. Si dos scrub
// distintos escribieran el mismo valor, al saltar con el scroll ganaría el último en ejecutarse y
// la tarjeta quedaría en un estado incorrecto. Por eso entrar y salir usan elementos anidados
// (data-chip / data-chip-caja) y el medidor suma los tramos en un solo lugar.
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

const SCRUB = 0.6;
const AGUJA_INICIAL = -70;
const AGUJA_FINAL = 68;
// Lo que sube la aguja con cada servicio y con el historial limpio.
const TRAMOS_AGUJA = [30, 22, 24, 62];

async function montar(gsap: Gsap, ScrollTrigger: ST) {
  const raiz = document.documentElement;
  const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s);
  const $$ = <T extends Element = HTMLElement>(s: string) => gsap.utils.toArray<T>(s);

  const aguja = $<SVGGElement>("[data-aguja]")!;
  const puntaje = $("[data-puntaje]")!;
  const dibujarAguja = (rotacion: number) => {
    aguja.style.transform = `rotate(${rotacion}deg)`;
    puntaje.textContent = String(Math.round(300 + ((rotacion + 90) / 180) * 550));
  };

  // Movimiento reducido: estados finales, sin animación ni smooth scroll.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    dibujarAguja(AGUJA_FINAL);
    gsap.set("[data-cabecera-limpia], [data-texto-limpio], [data-fila-eliminado], [data-fila-fondo], [data-chip], [data-candado-abierto]", { opacity: 1 });
    gsap.set("[data-texto-moroso], [data-fila-valor]", { opacity: 0 });
    gsap.set("[data-fila-etiqueta]", { opacity: 0.7 });
    gsap.set("[data-tachado]", { scaleX: 1 });
    gsap.set("[data-linea-progreso]", { scaleY: 1 });
    return () => {};
  }

  const { default: Lenis } = await import("lenis");
  const lenis = new Lenis({ lerp: 0.1 });
  window.__lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  const tic = (t: number) => lenis.raf(t * 1000);
  gsap.ticker.add(tic);
  gsap.ticker.lagSmoothing(0);

  const escena = (trigger: gsap.DOMTarget, start: string, end: string) =>
    gsap.timeline({ scrollTrigger: { trigger, start, end, scrub: SCRUB } });

  // Dentro de un timeline, fromTo pintaría su estado inicial de inmediato y pisaría al HTML.
  const desde = (tl: gsap.core.Timeline, target: gsap.TweenTarget, de: gsap.TweenVars, a: gsap.TweenVars, posicion: number) =>
    tl.fromTo(target, de, { ...a, immediateRender: false }, posicion);

  const tramos = TRAMOS_AGUJA.map((delta) => ({ delta, avance: 0 }));
  const actualizarAguja = () => dibujarAguja(tramos.reduce((suma, t) => suma + t.delta * t.avance, AGUJA_INICIAL));
  const moverAguja = (i: number, trigger: gsap.DOMTarget, start: string, end: string) =>
    gsap.to(tramos[i], {
      avance: 1,
      ease: "power2.inOut",
      onUpdate: actualizarAguja,
      scrollTrigger: { trigger, start, end, scrub: SCRUB },
    });

  // ─── Común a desktop y mobile ─────────────────────────────────────────────
  const contexto = gsap.context(() => {
    gsap.fromTo("#barra-progreso", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } });

    // Texto que entra: discreto y siempre legible.
    $$("[data-revelar]").forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" } },
      );
    });

    $$("[data-contador]").forEach((el) => {
      const meta = Number(el.dataset.contador);
      const valor = { n: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(valor, {
            n: meta,
            duration: 1.8,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = Math.round(valor.n).toLocaleString("es-CL");
            },
          });
        },
      });
    });

    // Escena 2: las puertas se cierran
    const tlProblema = escena("#escena-problema", "top 70%", "top 20%");
    desde(tlProblema, "[data-chip]", { opacity: 0, scale: 0.8, y: 10 }, { opacity: 1, scale: 1, y: 0, stagger: 0.12, duration: 0.5, ease: "power3.out" }, 0);
    desde(tlProblema, "[data-candado]", { opacity: 0, scale: 1.8 }, { opacity: 1, scale: 1, stagger: 0.12, duration: 0.35, ease: "back.out(2.4)" }, 0.3);

    // Escena 3: cada servicio elimina sus filas y sube el medidor
    const filasPorServicio = [[0, 1], [3], [2]];
    $$("[data-servicio]").forEach((tarjeta, i) => {
      const inicio = "top 80%";
      const fin = "top 52%";
      const tl = escena(tarjeta, inicio, fin);
      filasPorServicio[i].forEach((fila, j) => {
        const s = `[data-fila="${fila}"]`;
        const t = j * 0.5;
        desde(tl, `${s} [data-tachado]`, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, t);
        desde(tl, `${s} [data-fila-etiqueta]`, { opacity: 1 }, { opacity: 0.7, duration: 0.3 }, t + 0.2);
        desde(tl, `${s} [data-fila-valor]`, { opacity: 1 }, { opacity: 0, duration: 0.2 }, t + 0.35);
        desde(tl, `${s} [data-fila-fondo]`, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t + 0.35);
        desde(tl, `${s} [data-fila-eliminado]`, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(3)" }, t + 0.4);
      });
      moverAguja(i, tarjeta, inicio, fin);
    });

    // Escena 4: línea de progreso y sellos sucesivos, en un solo timeline por los cruces entre sellos
    gsap.fromTo("[data-linea-progreso]", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-lista-pasos]", start: "top 62%", end: "bottom 62%", scrub: SCRUB } });
    const tlSellos = gsap.timeline({
      scrollTrigger: { trigger: "[data-lista-pasos]", start: "top 72%", endTrigger: "#escena-confianza", end: "top 65%", scrub: SCRUB },
    });
    $$("[data-sello]").forEach((sello, i) => {
      desde(tlSellos, sello, { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power3.out" }, i);
      tlSellos.to(sello, { opacity: 0, duration: 0.25 }, i + 0.75);
    });

    // Escena 5: historial limpio
    const inicioLimpio = "top 65%";
    const finLimpio = "top 15%";
    const tlLimpio = escena("#escena-confianza", inicioLimpio, finLimpio);
    desde(tlLimpio, "[data-cabecera-limpia]", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.4);
    desde(tlLimpio, "[data-texto-moroso]", { opacity: 1 }, { opacity: 0, duration: 0.2 }, 0.4);
    desde(tlLimpio, "[data-texto-limpio]", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.5);
    desde(tlLimpio, "[data-destello]", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.5);
    tlLimpio.to("[data-destello]", { opacity: 0.35, duration: 0.4 }, 0.8);
    desde(tlLimpio, "[data-candado-caja]", { opacity: 1 }, { opacity: 0, stagger: 0.05, duration: 0.2 }, 0.55);
    desde(tlLimpio, "[data-candado-abierto]", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, stagger: 0.05, duration: 0.3, ease: "back.out(2.4)" }, 0.6);
    moverAguja(3, "#escena-confianza", inicioLimpio, finLimpio);
  });

  const mm = gsap.matchMedia();

  // ─── Desktop: tilt y giro que se convierte en el wizard ───────────────────
  mm.add("(min-width: 1024px)", () => {
    const inclinacion = $("[data-inclinacion]")!;
    const rotX = gsap.quickTo(inclinacion, "rotationX", { duration: 0.8, ease: "power3.out" });
    const rotY = gsap.quickTo(inclinacion, "rotationY", { duration: 0.8, ease: "power3.out" });
    const moverPuntero = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      rotY((e.clientX / window.innerWidth - 0.5) * 7);
      rotX((e.clientY / window.innerHeight - 0.5) * -5);
    };
    window.addEventListener("pointermove", moverPuntero, { passive: true });

    const frente = $("[data-frente]")!;
    const reverso = $("[data-reverso-cara]")!;
    const columna = $("[data-columna-tarjeta]")!;
    const distanciaAlCentro = () => {
      const caja = columna.parentElement!.getBoundingClientRect();
      return caja.left + caja.width / 2 - (caja.right - caja.width / 4);
    };

    const tlGiro = gsap.timeline({
      scrollTrigger: {
        trigger: "#escena-turno",
        start: "top 55%",
        endTrigger: "#historia",
        end: "bottom bottom",
        scrub: SCRUB,
        invalidateOnRefresh: true,
      },
    });
    tlGiro.to(columna, { x: distanciaAlCentro, duration: 1, ease: "power2.inOut" }, 0);
    tlGiro.to("[data-chip-caja]", { opacity: 0, scale: 0.85, duration: 0.3 }, 0);
    tlGiro.to("[data-destello-caja]", { opacity: 0, duration: 0.3 }, 0);
    tlGiro.to("[data-texto-turno]", { opacity: 0, y: -24, duration: 0.5, ease: "power2.in" }, 0.1);
    desde(tlGiro, frente, { rotationY: 0 }, { rotationY: -90, duration: 0.5, ease: "power2.in" }, 0.3);
    tlGiro.set(frente, { autoAlpha: 0 }, 0.8);
    tlGiro.set(reverso, { opacity: 1 }, 0.8);
    desde(tlGiro, reverso, { rotationY: 90 }, { rotationY: 0, duration: 0.5, ease: "power2.out" }, 0.8);

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
    const tl = escena("#escena-turno", "top 75%", "top 25%");
    tl.to("[data-chip-caja]", { opacity: 0, duration: 0.2 }, 0);
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
    window.removeEventListener("load", refrescar);
    contexto.revert();
    mm.revert();
    gsap.ticker.remove(tic);
    lenis.destroy();
    delete window.__lenis;
  };
}
