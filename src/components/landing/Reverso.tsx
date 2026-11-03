"use client";

import { IconoFlecha } from "../iconos";
import { useBorrador } from "../wizard/borrador";
import { PasoDatos } from "../wizard/PasoDatos";
import { CabeceraWizard } from "../wizard/Wizard";

/**
 * Desktop: copia inerte del paso 1, en la misma posición que el wizard real. Al terminar el giro
 * se intercambian sin que se note; así nunca se escribe en una tarjeta a medio girar.
 */
export function ReversoWizard() {
  const b = useBorrador();
  return (
    <div data-reverso inert aria-hidden="true" className="perspectiva absolute top-[5.5rem] right-0 hidden w-1/2 justify-center px-4 lg:flex">
      <div data-reverso-cara className="cara tarjeta-wizard w-full max-w-[35rem] rounded-3xl border border-linea/70 bg-white p-8 opacity-0 shadow-tarjeta">
        <CabeceraWizard paso={b.paso} />
        {b.paso === 1 && <PasoDatos prefijo="reverso" />}
      </div>
    </div>
  );
}

/** Mobile: el reverso de la tarjeta compacta anuncia el formulario que viene justo debajo. */
export function ReversoCompacto() {
  return (
    <div data-reverso-compacto aria-hidden="true" className="cara absolute inset-0 flex flex-col justify-center rounded-2xl border border-linea/70 bg-white px-5 opacity-0 shadow-tarjeta lg:hidden">
      <p className="text-xs text-tenue">Paso 1 de 4</p>
      <p className="mt-0.5 text-lg font-semibold tracking-tight text-marino">Elimina tu DICOM hoy</p>
      <p className="mt-2 flex h-10 items-center justify-between rounded-lg border border-linea px-3 text-sm text-tenue">
        Nombre completo
        <IconoFlecha className="size-4 rotate-90 text-marino" />
      </p>
    </div>
  );
}
