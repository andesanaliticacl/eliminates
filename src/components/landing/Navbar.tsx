"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Cta } from "./Cta";
import { Logo } from "./Logo";

export function Navbar({ logoUrl }: { logoUrl: string }) {
  const [solida, setSolida] = useState(false);

  useEffect(() => {
    const revisar = () => setSolida(window.scrollY > 12);
    revisar();
    window.addEventListener("scroll", revisar, { passive: true });
    return () => window.removeEventListener("scroll", revisar);
  }, []);

  return (
    <>
      <div id="barra-progreso" aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left scale-x-0 bg-limpio" />
      <header className={`fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${solida ? "bg-white/80 shadow-[0_1px_0_rgb(11_31_58/0.06)] backdrop-blur-xl" : ""}`}>
        <nav aria-label="Principal" className="mx-auto flex h-14 max-w-[77.5rem] items-center justify-between px-4 lg:h-16 lg:px-8">
          <Link href="/" aria-label="Elimínate, inicio"><Logo url={logoUrl} /></Link>
          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-6 text-sm text-marino/80 lg:flex">
              <a href="#servicios" className="transition-colors hover:text-marino">Servicios</a>
              <a href="#como-funciona" className="transition-colors hover:text-marino">Cómo funciona</a>
              <a href="#preguntas" className="transition-colors hover:text-marino">Preguntas</a>
            </div>
            <Cta href="#solicitud" className="h-9 px-4 text-[0.8rem] lg:h-10 lg:px-5 lg:text-sm">Elimina tu DICOM</Cta>
          </div>
        </nav>
      </header>
    </>
  );
}
