"use client";

import { useEffect } from "react";
import type { Antecedente } from "@/lib/tipos";
import { IconoCheck, IconoFlecha } from "../iconos";
import { actualizarBorrador, useBorrador } from "../wizard/borrador";
import { Cta } from "./Cta";

const OPCIONES: { id: Antecedente; titulo: string; texto: string }[] = [
  { id: "dicom", titulo: "Deuda castigada", texto: "DICOM y deudas castigadas." },
  { id: "informe_comercial", titulo: "Morosidad comercial", texto: "Informes comerciales." },
  { id: "financiero", titulo: "Informe financiero", texto: "Antecedentes financieros." },
  { id: "penal", titulo: "Antecedente penal", texto: "Requisitos, preparación y seguimiento." },
];

// Lo que se marca aquí mueve el informe (Animaciones.tsx) y queda elegido en el paso 2 del wizard.
export function SelectorAntecedentes() {
  const { antecedentes } = useBorrador();

  useEffect(() => {
    window.dispatchEvent(new Event("eliminate:seleccion"));
  }, [antecedentes]);

  const alternar = (id: Antecedente) => {
    actualizarBorrador({ antecedentes: antecedentes.includes(id) ? antecedentes.filter((a) => a !== id) : [...antecedentes, id] });
  };

  const total = antecedentes.length;

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {OPCIONES.map(({ id, titulo, texto }) => {
          const activa = antecedentes.includes(id);
          return (
            <button
              key={id}
              type="button"
              aria-pressed={activa}
              onClick={() => alternar(id)}
              className={`flex min-h-32 flex-col rounded-2xl border p-4 text-left transition-[border-color,background-color,box-shadow] duration-300 lg:min-h-36 lg:p-5 ${
                activa ? "border-limpio bg-limpio-claro" : "border-linea bg-white shadow-[0_1px_2px_rgb(11_31_58/0.05)] hover:border-marino/40 hover:shadow-md"
              }`}
            >
              <span className={`grid size-6 place-items-center rounded-full border transition-colors duration-300 ${activa ? "border-limpio bg-limpio text-white" : "border-linea text-transparent"}`}>
                <IconoCheck className="size-3.5" strokeWidth={2.4} />
              </span>
              <span className="mt-3 font-semibold tracking-tight text-marino lg:text-lg">{titulo}</span>
              <span className="mt-1 text-sm leading-snug text-tenue">{texto}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-2xl bg-fondo p-4">
        <p className="text-sm font-semibold text-marino">Gestión legal completa</p>
        <ul className="mt-2 flex flex-wrap gap-1.5 text-xs font-medium text-marino">
          <li className="rounded-full border border-linea bg-white px-2.5 py-1">Vía administrativa</li>
          <li className="rounded-full border border-linea bg-white px-2.5 py-1">Vía judicial</li>
          <li className="rounded-full border border-linea bg-white px-2.5 py-1">Representación completa</li>
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-tenue" aria-live="polite">
          {total === 0 ? "Toca lo que te aplica." : `${total} de 4 seleccionados.`}
        </p>
        {total > 0 && (
          <Cta href="#solicitud" className="h-11 px-5 text-sm">
            Continuar
            <IconoFlecha className="size-4" />
          </Cta>
        )}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-tenue">Simulación ilustrativa. Lo que procede en tu caso te lo confirma un abogado.</p>
    </>
  );
}
