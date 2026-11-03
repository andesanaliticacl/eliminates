import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { esDemo } from "@/lib/store";
import { PagoSimulado } from "./PagoSimulado";

export const metadata: Metadata = { title: "Pago simulado | Elimínate", robots: { index: false, follow: false } };

export default async function PaginaPagoDemo({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  if (!esDemo()) notFound();
  const { token } = await searchParams;
  if (!token) notFound();
  return <PagoSimulado token={token} />;
}
