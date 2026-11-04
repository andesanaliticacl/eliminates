"use client";

import { useEffect } from "react";
import type { Antecedente } from "@/lib/tipos";
import { IconoBalanza, IconoCheck, IconoDocumento, IconoEscudo, IconoFlecha } from "../iconos";
import { actualizarBorrador, useBorrador } from "../wizard/borrador";
import { Cta } from "./Cta";

const TODOS: Antecedente[] = ["dicom", "informe_comercial", "financiero", "penal"];

const SERVICIOS: {
  titulo: string;
  texto: string;
  Icono: typeof IconoDocumento;
  opciones?: { id: Antecedente; etiqueta: string }[];
  detalles?: string[];
}[] = [
  {
    titulo: "Antecedentes comerciales y financieros",
    texto: "Eliminación de informes comerciales, financieros y de deuda castigada que hoy te cierran puertas en bancos, créditos o trabajos.",
    Icono: IconoDocumento,
    opciones: [
      { id: "dicom", etiqueta: "Deuda castigada" },
      { id: "informe_comercial", etiqueta: "Informes comerciales" },
      { id: "financiero", etiqueta: "Antecedentes financieros" },
    ],
  },
  {
    titulo: "Antecedentes penales",
    texto: "Gestionamos la eliminación de antecedentes penales para que tu certificado deje de ser un obstáculo para trabajar y avanzar.",
    Icono: IconoEscudo,
    opciones: [{ id: "penal", etiqueta: "Antecedentes penales" }],
    detalles: ["Revisión de requisitos", "Preparación de antecedentes", "Seguimiento hasta el resultado"],
  },
  {
    titulo: "Gestión legal",
    texto: "Llevamos tu caso mediante procedimiento administrativo o judicial, según lo que más te convenga. Tú no haces trámites.",
    Icono: IconoBalanza,
    detalles: ["Vía administrativa", "Vía judicial", "Representación completa"],
  },
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
      <ul className="mt-4 grid gap-2.5">
        {SERVICIOS.map(({ titulo, texto, Icono, opciones, detalles }) => (
          <li key={titulo} className="tarjeta-luz rounded-2xl border border-linea/80 bg-white p-4 shadow-[0_1px_2px_rgb(11_31_58/0.05)]">
            <h3 className="flex items-center gap-2 font-semibold tracking-tight text-marino">
              <Icono className="size-5 shrink-0" />
              {titulo}
            </h3>
            <p className="mt-1 text-sm leading-snug text-tenue">{texto}</p>
            {opciones && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {opciones.map(({ id, etiqueta }) => {
                  const activa = antecedentes.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={activa}
                      onClick={() => alternar(id)}
                      className={`flex min-h-8 items-center gap-1.5 rounded-full border px-3 py-1 text-[0.8rem] font-medium transition-colors duration-200 ${
                        activa ? "border-limpio bg-limpio text-white" : "border-linea bg-white text-marino hover:border-marino/50"
                      }`}
                    >
                      {activa && <IconoCheck className="size-3.5" strokeWidth={2.4} />}
                      {etiqueta}
                    </button>
                  );
                })}
              </div>
            )}
            {detalles && <p className="mt-2 text-xs leading-relaxed text-tenue">{detalles.join(" · ")}</p>}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="flex flex-wrap items-center gap-x-3 text-sm text-tenue" aria-live="polite">
          {total === 0 ? "Toca lo que te afecta." : `${total} de ${TODOS.length} seleccionados.`}
          <button
            type="button"
            onClick={() => actualizarBorrador({ antecedentes: total === TODOS.length ? [] : TODOS })}
            className="font-medium text-marino underline underline-offset-4 hover:text-marino-claro"
          >
            {total === TODOS.length ? "Quitar todos" : "Seleccionar todos"}
          </button>
        </p>
        <Cta href="#solicitud" className="h-10 px-5 text-sm">
          Evaluar mi caso
          <IconoFlecha className="size-4" />
        </Cta>
      </div>
      <p className="mt-2 text-xs text-tenue">Simulación ilustrativa. Lo que procede en tu caso te lo confirma un abogado.</p>
    </>
  );
}
