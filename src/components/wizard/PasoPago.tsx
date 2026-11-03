"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatearCLP, formatearFecha, formatearHora } from "@/lib/fechas";
import { IconoCheck } from "../iconos";
import { actualizarBorrador, useBorrador } from "./borrador";
import type { ArchivoElegido } from "./PasoCaso";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opciones: Record<string, unknown>) => string };
  }
}

function Turnstile({ alVerificar }: { alVerificar: (token: string) => void }) {
  const contenedor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!SITE_KEY) return;
    const dibujar = () => {
      if (window.turnstile && contenedor.current && !contenedor.current.hasChildNodes()) {
        window.turnstile.render(contenedor.current, { sitekey: SITE_KEY, callback: alVerificar, language: "es" });
      }
    };
    if (window.turnstile) return dibujar();
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = dibujar;
    document.head.appendChild(script);
  }, [alVerificar]);
  return SITE_KEY ? <div ref={contenedor} /> : null;
}

async function pedir(url: string, cuerpo: unknown) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
  const datos = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, datos };
}

function Cuenta({ hasta, alVencer }: { hasta: string; alVencer: () => void }) {
  const [restante, setRestante] = useState<number | null>(null);
  useEffect(() => {
    const tic = () => {
      const r = new Date(hasta).getTime() - Date.now();
      setRestante(r);
      if (r <= 0) alVencer();
    };
    tic();
    const t = setInterval(tic, 1000);
    return () => clearInterval(t);
  }, [hasta, alVencer]);
  if (restante === null || restante <= 0) return null;
  const min = Math.floor(restante / 60000);
  const seg = Math.floor((restante % 60000) / 1000);
  return (
    <span className="tabular-nums">
      {min}:{String(seg).padStart(2, "0")}
    </span>
  );
}

export function PasoPago({
  servicio,
  precio,
  archivos,
  alCambiarArchivos,
  alVencerHorario,
}: {
  servicio: string;
  precio: number;
  archivos: ArchivoElegido[];
  alCambiarArchivos: (lista: ArchivoElegido[]) => void;
  alVencerHorario: (mensaje: string) => void;
}) {
  const b = useBorrador();
  const [consentimiento, setConsentimiento] = useState(false);
  const [intentado, setIntentado] = useState(false);
  const [estado, setEstado] = useState<string | null>(null);
  const [fallo, setFallo] = useState<string | null>(null);
  const [turnstile, setTurnstile] = useState("");
  const honeypot = useRef<HTMLInputElement>(null);

  const vencer = useRef(() => {});
  vencer.current = () => {
    if (!b.solicitudToken) alVencerHorario("Tu reserva de horario venció. Elige una hora nuevamente.");
  };
  const alVencer = useRef(() => vencer.current()).current;

  const subirArchivos = async (token: string) => {
    let lista = [...archivos];
    const rechazados: string[] = [];
    // Un archivo inválido no tiene arreglo reintentando, y desde aquí ya no se vuelve al paso 2:
    // se saca de la lista y se avisa. Los errores de red o del servidor sí se pueden reintentar.
    const revisar = (r: Awaited<ReturnType<typeof pedir>>, item: ArchivoElegido) => {
      if (r.ok) return true;
      if (r.status >= 500 || r.status === 429) throw new Error(r.datos.error ?? "No se pudieron subir tus documentos. Reintenta.");
      rechazados.push(item.archivo.name);
      lista = lista.filter((a) => a.id !== item.id);
      alCambiarArchivos(lista);
      return false;
    };

    for (const [i, item] of archivos.entries()) {
      if (item.subido) continue;
      setEstado(`Subiendo documentos (${i + 1} de ${archivos.length})…`);
      const { archivo } = item;
      const firma = await pedir("/api/documentos/firmar", { token, mime: archivo.type, tamano: archivo.size });
      if (!revisar(firma, item)) continue;

      const cuerpo = new FormData();
      cuerpo.append("cacheControl", "3600");
      cuerpo.append("", archivo);
      const subida = await fetch(firma.datos.url, { method: "PUT", body: cuerpo, headers: { "x-upsert": "false" } });
      if (!subida.ok) throw new Error(`${archivo.name}: no se pudo subir. Reintenta.`);

      const confirmacion = await pedir("/api/documentos/confirmar", { token, ruta: firma.datos.ruta, mime: archivo.type, nombre: archivo.name });
      if (!revisar(confirmacion, item)) continue;

      lista = lista.map((a) => (a.id === item.id ? { ...a, subido: true } : a));
      alCambiarArchivos(lista);
    }

    if (rechazados.length > 0) {
      throw new Error(`No pudimos adjuntar ${rechazados.join(", ")}: no es un PDF, JPG o PNG válido. Puedes continuar con el pago y enviárselo después al abogado.`);
    }
  };

  const pagar = async () => {
    setIntentado(true);
    setFallo(null);
    if (!consentimiento) return;
    if (SITE_KEY && !turnstile && !b.solicitudToken) {
      setFallo("Completa la verificación antes de continuar.");
      return;
    }
    try {
      let token = b.solicitudToken;
      if (!token) {
        setEstado("Guardando tu solicitud…");
        const creada = await pedir("/api/solicitudes", {
          datos: {
            nombre: b.nombre,
            rut: b.rut,
            telefono: b.telefono,
            correo: b.correo,
            comuna: b.comuna,
            antecedentes: b.antecedentes,
            monto_aproximado: b.monto || null,
            descripcion: b.descripcion,
          },
          holdToken: b.holdToken,
          consentimiento,
          turnstile,
          sitio_web: honeypot.current?.value,
        });
        if (creada.datos.codigo === "HOLD_EXPIRADO") {
          alVencerHorario(creada.datos.error);
          return;
        }
        if (!creada.ok) throw new Error(creada.datos.error ?? "No pudimos guardar tu solicitud.");
        token = creada.datos.token as string;
        actualizarBorrador({ solicitudToken: token });
      }

      await subirArchivos(token);

      setEstado("Conectando con Mercado Pago…");
      const pago = await pedir("/api/pagos/crear", { token });
      if (pago.datos.url) {
        window.location.assign(pago.datos.url);
        return;
      }
      // Ya pagada, o el horario se perdió: esa página sabe resolver ambos casos.
      if (pago.datos.yaPagada || pago.status === 409) {
        window.location.assign(`/solicitud/${token}`);
        return;
      }
      throw new Error(pago.datos.error ?? "No pudimos iniciar el pago.");
    } catch (e) {
      setFallo(e instanceof Error ? e.message : "Ocurrió un error. Inténtalo nuevamente.");
      setEstado(null);
    }
  };

  return (
    <div className="grid gap-5">
      <dl className="divide-y divide-linea rounded-xl border border-linea px-4 text-sm">
        <div className="flex justify-between gap-4 py-3">
          <dt className="text-tenue">Servicio</dt>
          <dd className="text-right font-medium text-marino">{servicio}</dd>
        </div>
        {b.inicio && (
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-tenue">Cita</dt>
            <dd className="text-right font-medium text-marino">
              {formatearFecha(b.inicio)}, {formatearHora(b.inicio)}
            </dd>
          </div>
        )}
        <div className="flex justify-between gap-4 py-3">
          <dt className="text-tenue">Modalidad</dt>
          <dd className="font-medium text-marino">{b.modalidad === "videollamada" ? "Videollamada" : "Presencial"}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-3">
          <dt className="text-tenue">Total</dt>
          <dd className="text-xl font-semibold tracking-tight text-marino tabular-nums">{formatearCLP(precio)}</dd>
        </div>
      </dl>

      {b.holdExpira && !b.solicitudToken && (
        <p className="text-sm text-tenue">
          Reservamos tu horario por <Cuenta hasta={b.holdExpira} alVencer={alVencer} /> mientras pagas.
        </p>
      )}

      {/* Honeypot: invisible para personas, tentador para bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Sitio web
          <input ref={honeypot} name="sitio_web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-marino has-focus-visible:[&>span]:ring-3 has-focus-visible:[&>span]:ring-marino/20">
        <input type="checkbox" className="sr-only" checked={consentimiento} onChange={(e) => setConsentimiento(e.target.checked)} />
        <span aria-hidden="true" className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors ${consentimiento ? "border-marino bg-marino text-white" : intentado ? "border-deuda" : "border-linea"}`}>
          {consentimiento && <IconoCheck className="size-3.5" strokeWidth={2.4} />}
        </span>
        <span>
          Autorizo el tratamiento de mis datos personales y sensibles para evaluar y gestionar mi caso, según la{" "}
          <Link href="/privacidad" target="_blank" className="underline underline-offset-2">política de privacidad</Link>.
        </span>
      </label>
      {intentado && !consentimiento && (
        <p role="alert" className="-mt-3 text-sm text-deuda">Necesitamos tu autorización para continuar.</p>
      )}

      <Turnstile alVerificar={setTurnstile} />

      {fallo && <p role="alert" className="rounded-xl bg-deuda/5 px-4 py-3 text-sm text-deuda">{fallo}</p>}

      <button
        type="button"
        onClick={pagar}
        disabled={!!estado}
        className="flex h-13 w-full items-center justify-center rounded-xl bg-[#009ee3] px-5 text-base font-semibold text-white transition-colors hover:bg-[#0089c7] disabled:opacity-70"
      >
        {estado ?? `Pagar ${formatearCLP(precio)} con Mercado Pago`}
      </button>
    </div>
  );
}
