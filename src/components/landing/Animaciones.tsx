"use client";

import { useEffect } from "react";

// Todo se carga de forma diferida: GSAP y Lenis no compiten con el primer pintado (Lighthouse móvil).
//
// Regla de estas escenas: cada propiedad de cada elemento la anima un solo timeline. Si dos scrub
// distintos escribieran el mismo valor, al saltar con el scroll ganaría el último en ejecutarse y
// la tarjeta quedaría en un estado incorrecto. Por eso entrar y salir usan elementos anidados
// (data-chip / data-chip-caja) y el medidor suma sus tramos en un solo lugar.
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

const SCRUB = 0.8;
const AGUJA_BASE = -90;
const AGUJA_FINAL = 68;
// Lo que sube la aguja: barrido al cargar, cada servicio y el historial limpio.
const TRAMOS_AGUJA = [20, 30, 22, 24, 62];
// Filas del informe que elimina cada tarjeta de servicio.
const FILAS_POR_SERVICIO = [[0, 1], [3], [2]];

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

  const aguja = $<SVGGElement>("[data-aguja]")!;
  const puntaje = $("[data-puntaje]")!;
  const dibujarAguja = (rotacion: number) => {
    aguja.style.transform = `rotate(${rotacion}deg)`;
    puntaje.textContent = String(Math.round(300 + ((rotacion + 90) / 180) * 550));
  };

  // Movimiento reducido: estados finales, sin animación ni smooth scroll.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    dibujarAguja(AGUJA_FINAL);
    gsap.set("[data-texto-limpio], [data-fila-eliminado], [data-chip], [data-chip-verde], [data-candado-abierto], [data-servicio-ok], [data-servicio-borde], [data-paso-punto], [data-barrido-verde]", { opacity: 1 });
    gsap.set("[data-texto-moroso], [data-fila-valor], [data-barrido-rojo], [data-deteccion]", { opacity: 0 });
    gsap.set("[data-fila-etiqueta]", { opacity: 0.7 });
    gsap.set("[data-tachado], [data-fila-fondo], [data-cabecera-limpia]", { scaleX: 1 });
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
  const actualizarAguja = () => dibujarAguja(tramos.reduce((suma, t) => suma + t.delta * t.avance, AGUJA_BASE));
  const moverAguja = (i: number, trigger: gsap.DOMTarget, start: string, end: string) =>
    gsap.to(tramos[i], { avance: 1, ease: "power2.inOut", onUpdate: actualizarAguja, scrollTrigger: { trigger, start, end, scrub: SCRUB } });

  const restaurarTitulos = $$("[data-titulo]").map(dividirTitulo);

  // ─── Común a desktop y mobile ─────────────────────────────────────────────
  const contexto = gsap.context(() => {
    gsap.fromTo("#barra-progreso", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } });

    // Al cargar, la aguja barre hasta la zona roja
    gsap.to(tramos[0], { avance: 1, delay: 0.5, duration: 1.4, ease: "power3.out", onUpdate: actualizarAguja });

    // Titulares: cada palabra sube desde su máscara
    $$("[data-titulo]").forEach((titulo) => {
      gsap.fromTo(
        titulo.querySelectorAll("[data-palabra]"),
        { yPercent: 115 },
        { yPercent: 0, duration: 1, stagger: 0.06, ease: "power4.out", scrollTrigger: { trigger: titulo, start: "top 88%", toggleActions: "play none none reverse" } },
      );
    });

    // Texto corrido: discreto y siempre legible
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
    const tlProblema = escena("#escena-problema", "top 72%", "top 18%");
    $$("[data-chip]").forEach((chip, i) => {
      const t = i * 0.3;
      desde(tlProblema, chip, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, t);
      desde(tlProblema, chip.querySelector("[data-candado]"), { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" }, t + 0.3);
      desde(tlProblema, chip.querySelector("[data-chip-rojo]"), { opacity: 0 }, { opacity: 1, duration: 0.2 }, t + 0.35);
    });

    // Escena 3: cada servicio elimina sus filas y apaga su detección en el radar
    $$("[data-servicio]").forEach((tarjeta, i) => {
      const inicio = "top 92%";
      const fin = "top 48%";
      const tl = escena(tarjeta, inicio, fin);
      desde(tl, tarjeta, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0);
      FILAS_POR_SERVICIO[i].forEach((fila, j) => {
        const s = `[data-fila="${fila}"]`;
        const t = 0.45 + j * 0.45;
        desde(tl, `${s} [data-tachado]`, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power2.inOut" }, t);
        desde(tl, `${s} [data-fila-fondo]`, { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power3.out" }, t + 0.2);
        desde(tl, `${s} [data-fila-etiqueta]`, { opacity: 1 }, { opacity: 0.7, duration: 0.2 }, t + 0.2);
        desde(tl, `${s} [data-fila-valor]`, { opacity: 1, x: 0 }, { opacity: 0, x: 10, duration: 0.15 }, t + 0.25);
        desde(tl, `${s} [data-fila-eliminado]`, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }, t + 0.3);
        desde(tl, `[data-deteccion="${fila}"]`, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.6, duration: 0.35, ease: "power2.in" }, t + 0.2);
      });
      const cierre = 0.8 + (FILAS_POR_SERVICIO[i].length - 1) * 0.45;
      desde(tl, tarjeta.querySelector("[data-servicio-borde]"), { opacity: 0 }, { opacity: 1, duration: 0.25 }, cierre);
      desde(tl, tarjeta.querySelector("[data-servicio-ok]"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, cierre);
      moverAguja(i + 1, tarjeta, inicio, fin);
    });

    // Escena 4: línea de progreso, puntos que se encienden y sellos sucesivos
    gsap.fromTo("[data-linea-progreso]", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-lista-pasos]", start: "top 62%", end: "bottom 62%", scrub: SCRUB } });
    $$("[data-paso]").forEach((paso) => {
      const tl = escena(paso, "top 66%", "top 56%");
      desde(tl, paso.querySelector("[data-paso-punto]"), { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 1, ease: "power2.out" }, 0);
    });
    const tlSellos = gsap.timeline({
      scrollTrigger: { trigger: "[data-lista-pasos]", start: "top 72%", endTrigger: "#escena-confianza", end: "top 65%", scrub: SCRUB },
    });
    $$("[data-sello]").forEach((sello, i) => {
      desde(tlSellos, sello, { opacity: 0, scale: 1.2, rotation: -4, xPercent: -50, yPercent: -50 }, { opacity: 1, scale: 1, rotation: -4, xPercent: -50, yPercent: -50, duration: 0.3, ease: "power3.out" }, i);
      tlSellos.to(sello, { opacity: 0, duration: 0.2 }, i + 0.8);
    });

    // Escena 5: historial limpio. El radar pasa a verde y emite un pulso
    const inicioLimpio = "top 65%";
    const finLimpio = "top 12%";
    const tlLimpio = escena("#escena-confianza", inicioLimpio, finLimpio);
    desde(tlLimpio, "[data-cabecera-limpia]", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, 0.3);
    desde(tlLimpio, "[data-texto-moroso]", { yPercent: 0, opacity: 1 }, { yPercent: -130, opacity: 0, duration: 0.2, ease: "power2.in" }, 0.45);
    desde(tlLimpio, "[data-texto-limpio]", { yPercent: 130, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, 0.6);
    desde(tlLimpio, "[data-barrido-rojo]", { opacity: 1 }, { opacity: 0, duration: 0.5 }, 0.3);
    desde(tlLimpio, "[data-barrido-verde]", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.3);
    desde(tlLimpio, "[data-destello]", { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.6);
    tlLimpio.to("[data-destello]", { opacity: 0.4, duration: 0.5 }, 0.85);
    tlLimpio.fromTo("[data-radar-pulso]", { attr: { r: 120 }, opacity: 0 }, { keyframes: { opacity: [0, 0.55, 0] }, attr: { r: 480 }, duration: 0.7, ease: "none", immediateRender: false }, 0.5);
    $$("[data-chip]").forEach((chip, i) => {
      const t = 0.6 + i * 0.07;
      desde(tlLimpio, chip.querySelector("[data-candado-caja]"), { opacity: 1 }, { opacity: 0, duration: 0.12 }, t);
      desde(tlLimpio, chip.querySelector("[data-candado-abierto]"), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }, t + 0.05);
      desde(tlLimpio, chip.querySelector("[data-chip-verde]"), { opacity: 0 }, { opacity: 1, duration: 0.2 }, t);
    });
    moverAguja(4, "#escena-confianza", inicioLimpio, finLimpio);
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

    // El texto del hero se aleja mientras la historia empieza
    gsap.fromTo("[data-hero-texto]", { opacity: 1, y: 0 }, { opacity: 0, y: -48, ease: "power1.in", scrollTrigger: { trigger: "#inicio", start: "top top", end: "bottom 30%", scrub: SCRUB } });
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
    const tl = escena("#escena-turno", "top 75%", "top 25%");
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
    window.removeEventListener("load", refrescar);
    contexto.revert();
    mm.revert();
    restaurarTitulos.forEach((restaurar) => restaurar());
    gsap.ticker.remove(tic);
    lenis.destroy();
    delete window.__lenis;
  };
}
