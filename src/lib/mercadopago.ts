import { urlSitio } from "./config";
import type { Solicitud } from "./tipos";

const API = "https://api.mercadopago.com";

export interface PagoMP {
  id: number;
  status: string;
  external_reference: string | null;
  transaction_amount: number;
  currency_id: string;
}

function cabeceras(): Record<string, string> {
  if (!process.env.MP_ACCESS_TOKEN) throw new Error("Falta MP_ACCESS_TOKEN");
  return { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, "Content-Type": "application/json" };
}

export async function crearPreferencia(solicitud: Solicitud, expiraEn: Date): Promise<{ id: string; init_point: string }> {
  const sitio = urlSitio();
  const retorno = `${sitio}/solicitud/${solicitud.token}`;
  const respuesta = await fetch(`${API}/checkout/preferences`, {
    method: "POST",
    headers: cabeceras(),
    body: JSON.stringify({
      items: [
        {
          id: solicitud.id,
          title: solicitud.servicio,
          quantity: 1,
          unit_price: solicitud.monto_clp,
          currency_id: "CLP",
        },
      ],
      payer: { name: solicitud.nombre, email: solicitud.correo },
      external_reference: solicitud.id,
      back_urls: { success: retorno, pending: retorno, failure: retorno },
      // Mercado Pago rechaza auto_return si las back_urls no son https (por ejemplo, en localhost).
      ...(sitio.startsWith("https://") ? { auto_return: "approved" } : {}),
      notification_url: `${sitio}/api/webhooks/mercadopago`,
      expires: true,
      expiration_date_to: expiraEn.toISOString(),
      statement_descriptor: "ELIMINATE",
    }),
  });
  if (!respuesta.ok) throw new Error(`Mercado Pago ${respuesta.status}: ${await respuesta.text()}`);
  return (await respuesta.json()) as { id: string; init_point: string };
}

export async function obtenerPago(id: string): Promise<PagoMP> {
  const respuesta = await fetch(`${API}/v1/payments/${encodeURIComponent(id)}`, { headers: cabeceras(), cache: "no-store" });
  if (!respuesta.ok) throw new Error(`Mercado Pago ${respuesta.status} al consultar el pago ${id}`);
  return (await respuesta.json()) as PagoMP;
}
