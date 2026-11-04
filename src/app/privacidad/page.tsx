import type { Metadata } from "next";
import { PaginaLegal } from "@/components/landing/PaginaLegal";

export const metadata: Metadata = {
  title: "Política de privacidad | Elimínate",
  description: "Cómo Elimínate trata tus datos personales y sensibles, conforme a la ley chilena.",
};

export default function Privacidad() {
  return (
    <PaginaLegal titulo="Política de privacidad">
      <p>Última actualización: [fecha].</p>

      <h2>Responsable del tratamiento</h2>
      <p>[Razón social], RUT [número], domicilio en [dirección], correo [correo de contacto], en adelante “Elimínate”. Delegado o encargado de protección de datos, si corresponde: [nombre y contacto].</p>

      <h2>Marco legal</h2>
      <p>Tratamos tus datos conforme a la Ley N° 19.628 sobre Protección de la Vida Privada y a la Ley N° 21.719, que la modifica y cuya entrada en vigencia está prevista para el 1 de diciembre de 2026.</p>

      <h2>Qué datos tratamos</h2>
      <ul>
        <li>Identificación y contacto: nombre, RUT, celular, correo y comuna.</li>
        <li>Datos de tu caso: antecedentes a eliminar, montos, descripción y documentos que adjuntes (cédula de identidad, informes comerciales, certificados).</li>
        <li>Datos sensibles o especialmente protegidos: antecedentes penales y situación financiera, cuando los entregues para evaluar tu caso.</li>
        <li>Agenda: fecha de la cita y modalidad.</li>
      </ul>

      <h2>Para qué los usamos y con qué base</h2>
      <p>Para evaluar tu caso, agendar tu cita, representarte en las gestiones que contrates y enviarte avisos sobre tu solicitud por WhatsApp y correo. La base es tu consentimiento expreso, que entregas al enviar el formulario, y la ejecución del contrato de servicios. No usamos tus datos para publicidad de terceros ni los vendemos.</p>

      <h2>Con quién los compartimos</h2>
      <p>Solo con proveedores necesarios para prestar el servicio, que actúan por encargo nuestro: Supabase (base de datos y archivos), Vercel (alojamiento), Meta (WhatsApp) y Resend (correo). Algunos almacenan información fuera de Chile. También con autoridades o tribunales cuando sea necesario para tu gestión o lo exija la ley.</p>

      <h2>Seguridad</h2>
      <p>Tus documentos se guardan en un almacenamiento privado, sin enlaces públicos. El acceso está restringido a personal autorizado, con enlaces temporales y comunicaciones cifradas.</p>

      <h2>Cuánto tiempo los conservamos</h2>
      <p>Mientras dure la gestión y luego por [plazo] años para cumplir obligaciones legales y atender eventuales reclamos. Las solicitudes que no se llegan a enviar se eliminan a los [plazo] días.</p>

      <h2>Tus derechos</h2>
      <p>Puedes pedir acceso, rectificación, supresión, oposición, portabilidad y bloqueo de tus datos, y retirar tu consentimiento en cualquier momento, escribiendo a [correo de contacto]. Responderemos dentro del plazo legal. Si no estás conforme, puedes recurrir a la autoridad competente.</p>

      <h2>Almacenamiento en tu navegador</h2>
      <p>Guardamos en tu dispositivo el avance del formulario, hasta por 7 días, para que no pierdas lo que escribiste si recargas la página. Se borra al enviar tu solicitud. Tus archivos no se guardan en tu dispositivo.</p>
    </PaginaLegal>
  );
}
