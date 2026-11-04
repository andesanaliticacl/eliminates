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
      <header className="fixed inset-x-0 top-1.5 z-40 px-2 lg:top-3 lg:px-4">
        <nav aria-label="Principal" className={`mx-auto flex h-12 max-w-[76rem] items-center justify-between rounded-full border pr-1.5 pl-4 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 lg:h-14 lg:pr-2 lg:pl-6 ${solida ? "border-linea/70 bg-white/75 shadow-[0_8px_30px_-12px_rgb(11_31_58/0.25)] backdrop-blur-xl" : "border-transparent"}`}>
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
