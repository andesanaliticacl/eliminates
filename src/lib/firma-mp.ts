import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifica x-signature de Mercado Pago ("ts=...,v1=...").
 * Manifest documentado: id:{data.id};request-id:{x-request-id};ts:{ts};
 * data.id va en minúsculas cuando es alfanumérico.
 */
export function firmaValida(params: {
  firma: string | null;
  requestId: string | null;
  dataId: string | null;
  secreto: string;
}): boolean {
  const { firma, requestId, dataId, secreto } = params;
  if (!firma || !dataId || !secreto) return false;

  const partes = Object.fromEntries(
    firma.split(",").map((p) => {
      const [k, ...v] = p.trim().split("=");
      return [k, v.join("=")];
    }),
  );
  if (!partes.ts || !partes.v1) return false;

  let manifest = `id:${dataId.toLowerCase()};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${partes.ts};`;

  const esperada = Buffer.from(createHmac("sha256", secreto).update(manifest).digest("hex"));
  const recibida = Buffer.from(partes.v1);
  return esperada.length === recibida.length && timingSafeEqual(esperada, recibida);
}
