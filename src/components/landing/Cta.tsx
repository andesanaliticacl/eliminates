"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { irA } from "@/lib/scroll";

const VARIANTES = {
  primario: "bg-marino text-white hover:bg-marino-claro",
  secundario: "border border-linea bg-white text-marino hover:border-marino/40",
  invertido: "bg-white text-marino hover:bg-white/90",
};

/** Enlace a un ancla con hover magnético sutil. Sigue siendo un <a>, así funciona sin JS. */
export function Cta({
  href,
  variante = "primario",
  className = "",
  offset,
  children,
}: {
  href: string;
  variante?: keyof typeof VARIANTES;
  className?: string;
  offset?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const mover = (e: PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const caja = ref.current.getBoundingClientRect();
    const x = (e.clientX - caja.left - caja.width / 2) * 0.12;
    const y = (e.clientY - caja.top - caja.height / 2) * 0.2;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };
  const soltar = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <a
      ref={ref}
      href={href}
      onClick={(e) => {
        e.preventDefault();
        irA(href, { offset });
      }}
      onPointerMove={mover}
      onPointerLeave={soltar}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[transform,background-color,border-color] duration-300 ease-out motion-reduce:transform-none ${VARIANTES[variante]} ${className}`}
    >
      {children}
    </a>
  );
}
