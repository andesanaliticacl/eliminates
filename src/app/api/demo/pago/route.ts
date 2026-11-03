import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { aplicarPago } from "@/lib/pagos";
import { error, leerJson, ruta } from "@/lib/servidor";
import { esDemo, obtenerStore } from "@/lib/store";

// Simula el webhook en DEMO_MODE. Fuera de ese modo responde 404.
export const POST = ruta(async (req: Request) => {
  if (!esDemo()) return error("No encontrado.", 404);
  const { token, resultado } = await leerJson(req);
  if (resultado !== "approved" && resultado !== "rejected" && resultado !== "pending") return error("Resultado no válido.", 400);

  const store = await obtenerStore();
  const solicitud = typeof token === "string" ? await store.solicitudPorToken(token) : null;
  if (!solicitud) return error("Solicitud no encontrada.", 404);

  await aplicarPago({
    solicitudId: solicitud.id,
    paymentId: String(randomInt(1e9, 2e9)),
    status: resultado,
    monto: solicitud.monto_clp,
    moneda: "CLP",
  });
  return NextResponse.json({ ok: true });
});
