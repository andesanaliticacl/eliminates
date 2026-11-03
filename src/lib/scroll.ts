"use client";

import type Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
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
