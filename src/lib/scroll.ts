"use client";

const PESTANAS = ["#servicios", "#como-funciona", "#preguntas"];

/** Abre el panel lateral con el formulario de evaluación. */
export function abrirEvaluacion() {
  window.dispatchEvent(new Event("eliminate:evaluar"));
}

/** Las secciones del panel abren su pestaña en lugar de ir a otro lugar de la página. */
export function irASeccion(href: string) {
  if (href === "#solicitud") return abrirEvaluacion();
  const destino = PESTANAS.includes(href) ? "#panel" : href;
  if (PESTANAS.includes(href)) window.dispatchEvent(new CustomEvent("eliminate:pestana", { detail: href.slice(1) }));
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelector(destino)?.scrollIntoView({ behavior: reducido ? "auto" : "smooth" });
}
