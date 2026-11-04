import Link from "next/link";
import { enlaceWhatsApp, NOTA_LEGAL } from "@/lib/config";
import type { Config } from "@/lib/tipos";
import { Logo } from "./Logo";

export function Pie({ config }: { config: Config }) {
  const { contacto, abogado } = config;
  return (
    <footer className="border-t border-linea bg-fondo">
      <div className="mx-auto grid max-w-[77.5rem] gap-10 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo url={config.logo_url} />
          <p className="mt-3 text-sm leading-relaxed text-tenue">Gestión legal para eliminar antecedentes comerciales, financieros, de deuda castigada y penales en Chile.</p>
          <p className="mt-3 text-sm text-tenue">{abogado.nombre}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-marino">Contacto</h3>
          <ul className="mt-3 grid gap-2 text-sm text-tenue">
            <li><a href={`tel:${contacto.telefono.replace(/\s/g, "")}`} className="hover:text-marino">{contacto.telefono}</a></li>
            <li><a href={enlaceWhatsApp(contacto.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:text-marino">WhatsApp</a></li>
            <li><a href={`mailto:${contacto.correo}`} className="hover:text-marino">{contacto.correo}</a></li>
            <li>{contacto.direccion}</li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-marino">Servicios</h3>
          <ul className="mt-3 grid gap-2 text-sm text-tenue">
            <li>Comerciales y financieros</li>
            <li>Antecedentes penales</li>
            <li>Gestión legal</li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-marino">Legal</h3>
          <ul className="mt-3 grid gap-2 text-sm text-tenue">
            <li><Link href="/privacidad" className="hover:text-marino">Política de privacidad</Link></li>
            <li><Link href="/terminos" className="hover:text-marino">Términos y condiciones</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-[77.5rem] border-t border-linea px-4 py-6 text-xs leading-relaxed text-tenue lg:px-8">
        <p>{NOTA_LEGAL}</p>
        <p className="mt-2">© {new Date().getFullYear()} Elimínate. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
