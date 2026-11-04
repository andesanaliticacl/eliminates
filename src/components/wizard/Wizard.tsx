"use client";

import { useEffect, useRef, useState } from "react";
import { irA } from "@/lib/scroll";
import { IconoAtras, IconoFlecha, IconoPersona, IconoVideo } from "../iconos";
import { actualizarBorrador, useBorrador } from "./borrador";
import { PasoCaso, type ArchivoElegido } from "./PasoCaso";
import { erroresDatos, PasoDatos } from "./PasoDatos";
import { PasoPago } from "./PasoPago";
import { SelectorHorario } from "./SelectorHorario";

const PASOS = ["Tus datos", "Tu caso", "Agenda", "Pago"];

/** Cabecera compartida con el reverso de la tarjeta, para que el paso de uno a otro no se note. */
export function CabeceraWizard({ paso }: { paso: number }) {
  return (
    <header className="mb-6">
      <h2 className="text-[1.75rem] leading-tight font-semibold tracking-tight text-marino">Elimina tu DICOM hoy</h2>
      <p className="mt-1 text-[0.95rem] text-tenue">Toma 3 minutos.</p>
      <div className="mt-5" role="progressbar" aria-label="Avance de la solicitud" aria-valuemin={1} aria-valuemax={4} aria-valuenow={paso}>
        <div className="flex gap-1.5">
          {PASOS.map((nombre, i) => (
            <span key={nombre} className="h-1 flex-1 overflow-hidden rounded-full bg-linea">
              <span className={`block h-full origin-left rounded-full bg-limpio transition-transform duration-500 ease-out ${i < paso ? "scale-x-100" : "scale-x-0"}`} />
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-tenue">
          Paso {paso} de 4 · <span className="font-medium text-marino">{PASOS[paso - 1]}</span>
        </p>
      </div>
    </header>
  );
}

function BotonModalidad({ activo, alElegir, icono, titulo }: { activo: boolean; alElegir: () => void; icono: React.ReactNode; titulo: string }) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={alElegir}
      className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm transition-colors ${
        activo ? "border-marino bg-marino/[.03] font-medium text-marino" : "border-linea text-marino hover:border-marino/40"
      }`}
    >
      {icono}
      {titulo}
    </button>
  );
}

export function Wizard({ servicio, precio }: { servicio: string; precio: number }) {
  const b = useBorrador();
  const raiz = useRef<HTMLDivElement>(null);
  const [direccion, setDireccion] = useState(1);
  const [mostrarErrores, setMostrarErrores] = useState(false);
  const [archivos, setArchivos] = useState<ArchivoElegido[]>([]);
  const [perdidos, setPerdidos] = useState<string[]>([]);
  const [fallo, setFallo] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [version, setVersion] = useState(0);
  const revisado = useRef(false);

  // Tras recargar, el borrador recuerda los nombres de archivos pero no los archivos.
  useEffect(() => {
    if (revisado.current || b.archivos.length === 0) return;
    revisado.current = true;
    if (archivos.length === 0 && !b.solicitudToken) setPerdidos(b.archivos);
  }, [b.archivos, b.solicitudToken, archivos.length]);

  const irAPaso = (paso: number, dir: number) => {
    setDireccion(dir);
    setMostrarErrores(false);
    setFallo(null);
    actualizarBorrador({ paso });
    irA("#solicitud-inicio", { offset: -72 });
  };

  const pasoValido = () => {
    if (b.paso === 1) return Object.values(erroresDatos(b)).every((e) => !e);
    if (b.paso === 2) return b.antecedentes.length > 0;
    return !!b.inicio && !!b.modalidad;
  };

  const continuar = async () => {
    setFallo(null);
    if (!pasoValido()) {
      setMostrarErrores(true);
      raiz.current?.querySelector<HTMLElement>("[data-campo-invalido]")?.focus();
      return;
    }
    if (b.paso < 3) return irAPaso(b.paso + 1, 1);

    // Paso 3 → 4: el horario se retiene aquí, sin datos personales todavía.
    setCargando(true);
    try {
      const r = await fetch("/api/citas/retener", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inicio: b.inicio, modalidad: b.modalidad, holdPrevio: b.holdToken }),
      });
      const datos = await r.json();
      if (!r.ok) {
        setFallo(datos.error);
        if (r.status === 409) {
          actualizarBorrador({ inicio: null });
          setVersion((v) => v + 1);
        }
        return;
      }
      actualizarBorrador({ holdToken: datos.hold_token, holdExpira: datos.expira_en });
      irAPaso(4, 1);
    } catch {
      setFallo("No pudimos reservar el horario. Revisa tu conexión.");
    } finally {
      setCargando(false);
    }
  };

  const horarioVencido = (mensaje: string) => {
    actualizarBorrador({ holdToken: null, holdExpira: null, inicio: null, paso: 3 });
    setDireccion(-1);
    setFallo(mensaje);
    setVersion((v) => v + 1);
  };

  return (
    // El margen negativo deja espacio al anillo de foco de los campos dentro del recorte lateral.
    <div ref={raiz} className="relative -mx-1 overflow-x-clip px-1">
      <CabeceraWizard paso={b.paso} />

      <div key={b.paso} className={direccion > 0 ? "wizard-entra-derecha" : "wizard-entra-izquierda"}>
        {b.paso === 1 && <PasoDatos mostrarErrores={mostrarErrores} />}
        {b.paso === 2 && (
          <PasoCaso
            archivos={archivos}
            alCambiarArchivos={(lista) => {
              setArchivos(lista);
              setPerdidos([]);
            }}
            perdidos={perdidos}
            mostrarErrores={mostrarErrores}
          />
        )}
        {b.paso === 3 && (
          <div className="grid gap-6">
            <SelectorHorario seleccion={b.inicio} alElegir={(inicio) => actualizarBorrador({ inicio })} version={version} />
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-marino">Modalidad</legend>
              <div className="grid grid-cols-2 gap-2">
                <BotonModalidad activo={b.modalidad === "presencial"} alElegir={() => actualizarBorrador({ modalidad: "presencial" })} icono={<IconoPersona className="size-4" />} titulo="Presencial" />
                <BotonModalidad activo={b.modalidad === "videollamada"} alElegir={() => actualizarBorrador({ modalidad: "videollamada" })} icono={<IconoVideo className="size-4" />} titulo="Videollamada" />
              </div>
            </fieldset>
            {mostrarErrores && !pasoValido() && (
              <p role="alert" className="text-sm text-deuda">Elige un horario y una modalidad.</p>
            )}
          </div>
        )}
        {b.paso === 4 && (
          <PasoPago servicio={servicio} precio={precio} archivos={archivos} alCambiarArchivos={setArchivos} alVencerHorario={horarioVencido} />
        )}
      </div>

      {fallo && b.paso < 4 && (
        <p role="alert" className="mt-4 rounded-xl bg-deuda/5 px-4 py-3 text-sm text-deuda">{fallo}</p>
      )}

      <div className={`mt-6 flex items-center gap-3 ${b.paso === 4 && b.solicitudToken ? "hidden" : ""}`}>
        {b.paso > 1 && (
          <button type="button" onClick={() => irAPaso(b.paso - 1, -1)} className="flex h-12 items-center gap-2 rounded-xl px-4 text-sm font-medium text-marino transition-colors hover:bg-fondo">
            <IconoAtras className="size-4" />
            Atrás
          </button>
        )}
        {b.paso < 4 && (
          <button type="button" onClick={continuar} disabled={cargando} className="ml-auto flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-marino px-6 text-sm font-semibold text-white transition-colors hover:bg-marino-claro disabled:opacity-70 sm:flex-none">
            {cargando ? "Reservando horario…" : "Continuar"}
            {!cargando && <IconoFlecha className="size-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
