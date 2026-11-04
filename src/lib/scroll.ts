"use client";

import type Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

const PESTANAS = ["#servicios", "#como-funciona", "#preguntas"];

/** Como irA, pero las secciones del panel abren su pestaña en lugar de ir a otro lugar de la página. */
export function irASeccion(href: string) {
  if (PESTANAS.includes(href)) {
    window.dispatchEvent(new CustomEvent("eliminate:pestana", { detail: href.slice(1) }));
    const escenario = window.innerWidth < 1024 ? document.querySelector("[data-escenario]") : null;
    irA("#panel", { offset: escenario ? -escenario.getBoundingClientRect().bottom : 0 });
  } else {
    irA(href);
  }
}

/** Lleva a un ancla con Lenis cuando está activo; si no (movimiento reducido, sin JS cargado), de forma nativa. */
export function irA(selector: string, opciones?: { offset?: number; inmediato?: boolean }) {
  const destino = document.querySelector<HTMLElement>(selector);
  if (!destino) return;
  if (window.__lenis) {
    window.__lenis.scrollTo(destino, { offset: opciones?.offset ?? 0, duration: 1.8, immediate: opciones?.inmediato });
  } else {
    const y = destino.getBoundingClientRect().top + window.scrollY + (opciones?.offset ?? 0);
    window.scrollTo({ top: y });
  }
}
