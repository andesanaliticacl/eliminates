import type { Metadata } from "next";
import { PaginaLegal } from "@/components/landing/PaginaLegal";
import { NOTA_LEGAL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Términos y condiciones | Elimínate",
  description: "Condiciones del servicio de gestión legal de Elimínate.",
};

export default function Terminos() {
  return (
    <PaginaLegal titulo="Términos y condiciones">
      <p>Última actualización: [fecha].</p>

      <h2>El servicio</h2>
      <p>[Razón social], RUT [número], presta servicios de asesoría y gestión legal para la eliminación de antecedentes comerciales, financieros y penales, por vía administrativa o judicial.</p>

      <h2>Sin garantía de resultado</h2>
      <p>{NOTA_LEGAL} La obligación de Elimínate es de medios: gestionar tu caso con diligencia profesional, no garantizar un resultado determinado.</p>

      <h2>Abono y cita</h2>
      <p>El abono indicado al solicitar reserva tu cita con un abogado y [describir qué cubre el abono y cómo se imputa al valor de la gestión]. El valor total de la gestión se informa por escrito antes de iniciarla, según la vía y el tipo de antecedente.</p>

      <h2>Pagos, reagendamiento y devoluciones</h2>
      <p>Los pagos se procesan a través de Mercado Pago. Puedes reagendar tu cita avisando con [plazo] de anticipación. Las devoluciones proceden [condiciones], sin perjuicio de los derechos que te otorga la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores.</p>

      <h2>Tus obligaciones</h2>
      <p>Debes entregar información y documentos veraces y completos. Elimínate no presenta gestiones basadas en información falsa.</p>

      <h2>Datos personales</h2>
      <p>El tratamiento de tus datos se rige por nuestra política de privacidad.</p>

      <h2>Ley aplicable</h2>
      <p>Estos términos se rigen por la ley chilena. Contacto: [correo de contacto], [dirección].</p>
    </PaginaLegal>
  );
}
