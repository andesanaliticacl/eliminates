"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { enlaceWhatsApp } from "@/lib/config";
import { formatearCLP, formatearFecha, formatearHora } from "@/lib/fechas";
import { IconoWhatsApp } from "../iconos";
import { limpiarBorrador } from "./borrador";
import { SelectorHorario } from "./SelectorHorario";

interface Estado {
  estado: "nueva" | "pendiente_pago" | "en_curso" | "cerrada";
  numero_atencion: string | null;
  pago_estado: string | null;
  nombre: string;
  servicio: string;
  monto_clp: number;
  conflicto: boolean;
  cita: { inicio: string; modalidad: string; estado: string; expira_en: string | null } | null;
}

const INTERVALO_MS = 2500;
const ESPERA_MAX_MS = 60_000;

function NumeroAnimado({ numero }: { numero: string }) {
  const [texto, setTexto] = useState(numero);
  useEffect(() => {
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const meta = Number(numero.replace(/\D/g, ""));
    if (reducido || !meta) return;
    const inicio = performance.now();
    let cuadro = 0;
    const paso = (t: number) => {
      const avance = Math.min(1, (t - inicio) / 1200);
      const suave = 1 - Math.pow(1 - avance, 3);
      setTexto(`ELM-${String(Math.round(meta * suave)).padStart(6, "0")}`);
      if (avance < 1) cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [numero]);
  return (
    <p className="mt-1 text-4xl font-semibold tracking-tight text-marino tabular-nums" aria-label={numero}>
      {texto}
    </p>
  );
}

function Confirmacion({ datos, whatsapp }: { datos: Estado; whatsapp: string }) {
  const numero = datos.numero_atencion!;
  return (
    <div className="text-center">
      <svg viewBox="0 0 64 64" className="mx-auto size-20" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="none" stroke="var(--color-limpio)" strokeWidth="2.5" className="dibujar-circulo" />
        <path d="M20 33l8.500 8.500L45 24" fill="none" stroke="var(--color-limpio)" strokeWidth="3.500" strokeLinecap="round" strokeLinejoin="round" className="dibujar-check" />
      </svg>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-marino">{datos.nombre}, tu solicitud ya está en curso</h1>
      <p className="mt-6 text-sm text-tenue">Tu número de atención</p>
      <NumeroAnimado numero={numero} />

      {datos.conflicto || !datos.cita ? (
        <p className="mx-auto mt-6 max-w-sm rounded-xl bg-ambar/10 px-4 py-3 text-sm leading-relaxed text-marino">
          Recibimos tu pago, pero el horario que elegiste ya no estaba disponible. Un abogado te contactará para coordinar una nueva hora.
        </p>
      ) : (
        <p className="mt-6 text-marino">
          Tu cita quedó para el <span className="font-medium">{formatearFecha(datos.cita.inicio)}</span> a las{" "}
          <span className="font-medium">{formatearHora(datos.cita.inicio)}</span>
          <span className="block text-sm text-tenue">{datos.cita.modalidad === "videollamada" ? "Videollamada" : "Presencial"}</span>
        </p>
      )}
      <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-tenue">
        Ya vas a ser atendido: un abogado revisará tu caso y te contactará. Te enviamos estos datos por WhatsApp y correo.
      </p>
      <a
        href={enlaceWhatsApp(whatsapp, `Hola, mi número de atención es ${numero}.`)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-marino px-6 text-sm font-semibold text-white transition-colors hover:bg-marino-claro"
      >
        <IconoWhatsApp className="size-5" />
        Escribir por WhatsApp
      </a>
    </div>
  );
}

function Reintento({ token, datos }: { token: string; datos: Estado }) {
  const [elegir, setElegir] = useState(false);
  const [inicio, setInicio] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [fallo, setFallo] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const enProceso = datos.pago_estado === "pending" || datos.pago_estado === "in_process";
  const rechazado = datos.pago_estado === "rejected" || datos.pago_estado === "cancelled";

  const reintentar = async () => {
    setCargando(true);
    setFallo(null);
    try {
      const r = await fetch("/api/pagos/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...(elegir && inicio ? { inicio } : {}) }),
      });
      const respuesta = await r.json();
      if (respuesta.url) return window.location.assign(respuesta.url);
      if (respuesta.yaPagada) return window.location.reload();
      if (respuesta.codigo === "HORARIO_TOMADO") {
        setElegir(true);
        setInicio(null);
        setVersion((v) => v + 1);
      }
      setFallo(respuesta.error ?? "No pudimos iniciar el pago.");
    } catch {
      setFallo("Revisa tu conexión e inténtalo nuevamente.");
    }
    setCargando(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-marino">
        {rechazado ? "Tu pago no se pudo completar" : enProceso ? "Tu pago está en proceso" : "Tu pago está pendiente"}
      </h1>
      <p className="mt-3 leading-relaxed text-tenue">
        {enProceso
          ? "Mercado Pago todavía lo está procesando. Te avisaremos apenas se confirme. Espera antes de pagar de nuevo, para evitar un doble cobro."
          : `${datos.nombre}, guardamos tu solicitud. Puedes reintentar el pago desde este mismo enlace.`}
      </p>
      <dl className="mt-6 divide-y divide-linea rounded-xl border border-linea px-4 text-sm">
        <div className="flex justify-between gap-4 py-3">
          <dt className="text-tenue">Servicio</dt>
          <dd className="text-right font-medium text-marino">{datos.servicio}</dd>
        </div>
        {datos.cita && !elegir && (
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-tenue">Cita</dt>
            <dd className="text-right font-medium text-marino">{formatearFecha(datos.cita.inicio)}, {formatearHora(datos.cita.inicio)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4 py-3">
          <dt className="text-tenue">Total</dt>
          <dd className="font-semibold text-marino tabular-nums">{formatearCLP(datos.monto_clp)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-tenue">El horario se libera 30 minutos después de iniciado el pago. Si ya no está disponible, podrás elegir otro.</p>

      {elegir && (
        <div className="mt-6">
          <SelectorHorario seleccion={inicio} alElegir={setInicio} version={version} />
        </div>
      )}
      {fallo && <p role="alert" className="mt-4 rounded-xl bg-deuda/5 px-4 py-3 text-sm text-deuda">{fallo}</p>}

      <button
        type="button"
        onClick={reintentar}
        disabled={cargando || (elegir && !inicio)}
        className="mt-6 flex h-13 w-full items-center justify-center rounded-xl bg-[#009ee3] px-5 text-base font-semibold text-white transition-colors hover:bg-[#0089c7] disabled:opacity-60"
      >
        {cargando ? "Conectando con Mercado Pago…" : `Reintentar pago de ${formatearCLP(datos.monto_clp)}`}
      </button>
    </div>
  );
}

export function VistaSolicitud({ token, whatsapp, paymentId, volvioDePago }: { token: string; whatsapp: string; paymentId: string | null; volvioDePago: boolean }) {
  const [datos, setDatos] = useState<Estado | null>(null);
  const [fallo, setFallo] = useState<string | null>(null);
  const [esperando, setEsperando] = useState(volvioDePago);

  const consultar = useCallback(async () => {
    const parametros = new URLSearchParams({ token });
    if (paymentId) parametros.set("payment_id", paymentId);
    const r = await fetch(`/api/solicitudes/estado?${parametros}`, { cache: "no-store" });
    const respuesta = await r.json();
    if (!r.ok) throw new Error(respuesta.error);
    setDatos(respuesta);
    return respuesta as Estado;
  }, [token, paymentId]);

  useEffect(() => {
    limpiarBorrador();
    let activo = true;
    let temporizador: ReturnType<typeof setTimeout>;
    const inicio = Date.now();

    // La confirmación depende del servidor: se pregunta hasta que el webhook la aplique.
    const ciclo = async () => {
      try {
        const actual = await consultar();
        if (!activo) return;
        const resuelto = !!actual.numero_atencion || actual.pago_estado === "rejected" || actual.pago_estado === "cancelled";
        if (resuelto || !volvioDePago || Date.now() - inicio > ESPERA_MAX_MS) {
          setEsperando(false);
          return;
        }
        temporizador = setTimeout(ciclo, INTERVALO_MS);
      } catch (e) {
        if (activo) setFallo(e instanceof Error ? e.message : "No pudimos cargar tu solicitud.");
      }
    };
    ciclo();
    return () => {
      activo = false;
      clearTimeout(temporizador);
    };
  }, [consultar, volvioDePago]);

  return (
    <main className="grid min-h-svh place-items-center bg-fondo px-4 py-12">
      <div className="w-full max-w-[34rem] rounded-3xl border border-linea/70 bg-white p-6 shadow-tarjeta sm:p-10">
        {fallo ? (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-marino">No encontramos esta solicitud</h1>
            <p className="mt-2 text-tenue">Revisa el enlace o escríbenos y te ayudamos.</p>
            <Link href="/" className="mt-6 inline-block text-sm font-medium text-marino underline underline-offset-2">Volver al inicio</Link>
          </div>
        ) : !datos || (esperando && !datos.numero_atencion) ? (
          <div className="py-10 text-center" role="status">
            <div className="mx-auto size-10 animate-spin rounded-full border-2 border-linea border-t-marino" aria-hidden="true" />
            <p className="mt-5 font-medium text-marino">Estamos confirmando tu pago…</p>
            <p className="mt-1 text-sm text-tenue">No cierres esta página, toma solo unos segundos.</p>
          </div>
        ) : datos.numero_atencion ? (
          <Confirmacion datos={datos} whatsapp={whatsapp} />
        ) : (
          <Reintento token={token} datos={datos} />
        )}
      </div>
    </main>
  );
}
