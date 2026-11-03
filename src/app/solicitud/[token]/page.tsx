import type { Metadata } from "next";
import { VistaSolicitud } from "@/components/wizard/VistaSolicitud";
import { configPublica } from "@/lib/store";

export const metadata: Metadata = { title: "Tu solicitud | Elimínate", robots: { index: false, follow: false } };

export default async function PaginaSolicitud({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await params;
  const consulta = await searchParams;
  const config = await configPublica();
  const paymentId = typeof consulta.payment_id === "string" ? consulta.payment_id : null;
  // Mercado Pago agrega estos parámetros al volver. Solo activan la espera: el estado lo da el servidor.
  const volvioDePago = !!paymentId || typeof consulta.status === "string" || typeof consulta.collection_status === "string";

  return <VistaSolicitud token={token} whatsapp={config.contacto.whatsapp} paymentId={paymentId} volvioDePago={volvioDePago} />;
}
