"use client";

import { useState } from "react";

const OPCIONES = [
  { resultado: "approved", estado: "approved", titulo: "Aprobar pago", clase: "bg-limpio text-white" },
  { resultado: "pending", estado: "pending", titulo: "Dejar pendiente", clase: "border border-linea text-marino" },
  { resultado: "rejected", estado: "rejected", titulo: "Rechazar pago", clase: "border border-linea text-deuda" },
];

export function PagoSimulado({ token }: { token: string }) {
  const [enviando, setEnviando] = useState(false);

  const simular = async (resultado: string) => {
    setEnviando(true);
    await fetch("/api/demo/pago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, resultado }),
    });
    window.location.assign(`/solicitud/${token}?status=${resultado}`);
  };

  return (
    <main className="grid min-h-svh place-items-center bg-fondo px-4">
      <div className="w-full max-w-md rounded-3xl border border-linea/70 bg-white p-8 shadow-tarjeta">
        <p className="text-xs font-semibold tracking-wide text-tenue uppercase">Modo demo</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-marino">Pago simulado</h1>
        <p className="mt-2 text-sm leading-relaxed text-tenue">
          Esta pantalla reemplaza a Mercado Pago mientras no haya credenciales. No se cobra nada: cada botón simula lo que informaría el webhook.
        </p>
        <div className="mt-6 grid gap-2">
          {OPCIONES.map((o) => (
            <button key={o.resultado} type="button" disabled={enviando} onClick={() => simular(o.resultado)} className={`h-12 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 ${o.clase}`}>
              {o.titulo}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
