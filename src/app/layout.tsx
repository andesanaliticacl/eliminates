import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { urlSitio } from "@/lib/config";
import "./globals.css";

const DESCRIPCION =
  "Elimina tu DICOM en Chile con gestión legal: deuda castigada, informes comerciales y financieros y antecedentes penales, por vía administrativa o judicial. Análisis en 24 horas.";

export const metadata: Metadata = {
  metadataBase: new URL(urlSitio()),
  title: "Elimina tu DICOM | Elimínate",
  description: DESCRIPCION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Elimina tu DICOM | Elimínate",
    description: DESCRIPCION,
    url: "/",
    siteName: "Elimínate",
    locale: "es_CL",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Elimina tu DICOM | Elimínate", description: DESCRIPCION },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

const APLICAR_TEMA = `try{if(localStorage.getItem("eliminate.tema")==="negro")document.documentElement.dataset.tema="negro"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={GeistSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: APLICAR_TEMA }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
