import { NextResponse } from "next/server";
import { firmaValida } from "@/lib/firma-mp";
import { procesarPagoMP } from "@/lib/pagos";
import { leerJson } from "@/lib/servidor";

export async function POST(req: Request) {
  const secreto = process.env.MP_WEBHOOK_SECRET;
  if (!secreto) {
    console.error("Falta MP_WEBHOOK_SECRET: webhook rechazado");
    return new NextResponse(null, { status: 500 });
  }

  const url = new URL(req.url);
  const cuerpo = await leerJson(req);
  const dataId = url.searchParams.get("data.id");
  const valida = firmaValida({
    firma: req.headers.get("x-signature"),
    requestId: req.headers.get("x-request-id"),
    dataId,
    secreto,
  });
  if (!valida) return new NextResponse(null, { status: 401 });

  const tipo = url.searchParams.get("type") ?? cuerpo.type;
  if (tipo !== "payment" || !dataId) return new NextResponse(null, { status: 200 });

  try {
    // Un 500 hace que Mercado Pago reintente; lo ya aplicado o enviado no se repite.
    const ok = await procesarPagoMP(dataId);
    return new NextResponse(null, { status: ok ? 200 : 500 });
  } catch (e) {
    console.error("Error procesando el webhook", e);
    return new NextResponse(null, { status: 500 });
  }
}
