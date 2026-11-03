import { IconoBanco, IconoCandado, IconoCandadoAbierto, IconoCasa, IconoMaletin, IconoTarjeta } from "../iconos";
import { ReversoCompacto, ReversoWizard } from "./Reverso";

const FILAS = [
  { etiqueta: "Deuda castigada", valor: "$1.250.000" },
  { etiqueta: "Morosidad comercial", valor: "Vigente" },
  { etiqueta: "Informe financiero", valor: "Negativo" },
  { etiqueta: "Antecedente penal", valor: "Registrado" },
];

export const SELLOS = ["Recibido", "En análisis", "Vía legal definida", "En gestión"];

const CHIPS = [
  { nombre: "Banco", Icono: IconoBanco, posicion: "lg:-top-5 lg:left-4 xl:top-10 xl:-left-24" },
  { nombre: "Crédito", Icono: IconoTarjeta, posicion: "lg:-top-5 lg:right-4 xl:top-32 xl:-right-24" },
  { nombre: "Arriendo", Icono: IconoCasa, posicion: "lg:-bottom-5 lg:left-4 xl:bottom-36 xl:-left-28" },
  { nombre: "Trabajo", Icono: IconoMaletin, posicion: "lg:-bottom-5 lg:right-4 xl:bottom-10 xl:-right-24" },
];

/** Arco del medidor de 180°, de -90° a 90°, entre dos ángulos. */
function arco(desde: number, hasta: number, r = 44, cx = 50, cy = 50) {
  const punto = (a: number) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return `${(cx + r * Math.cos(rad)).toFixed(2)} ${(cy + r * Math.sin(rad)).toFixed(2)}`;
  };
  return `M ${punto(desde)} A ${r} ${r} 0 0 1 ${punto(hasta)}`;
}

function Medidor() {
  return (
    <div className="relative w-24 shrink-0 lg:mx-auto lg:w-52">
      <svg viewBox="0 0 100 56" className="block w-full" aria-hidden="true">
        <path d={arco(-88, -32)} fill="none" stroke="var(--color-deuda)" strokeWidth="7" strokeLinecap="round" />
        <path d={arco(-26, 26)} fill="none" stroke="var(--color-ambar)" strokeWidth="7" strokeLinecap="round" />
        <path d={arco(32, 88)} fill="none" stroke="var(--color-limpio)" strokeWidth="7" strokeLinecap="round" />
        <g data-aguja style={{ transformBox: "view-box", transformOrigin: "50px 50px", transform: "rotate(-70deg)" }}>
          <line x1="50" y1="50" x2="50" y2="17" stroke="var(--color-marino)" strokeWidth="2.2" strokeLinecap="round" />
        </g>
        <circle cx="50" cy="50" r="3.600" fill="var(--color-marino)" />
      </svg>
      <p className="mt-0.5 text-center text-[0.65rem] leading-none text-tenue lg:mt-2 lg:text-xs">
        Puntaje <span data-puntaje className="font-semibold text-marino tabular-nums">361</span>
      </p>
    </div>
  );
}

export function TarjetaInforme() {
  return (
    <div className="perspectiva relative w-full max-w-[25rem] lg:w-[25rem]" data-tarjeta>
      <div data-inclinacion className="relative" style={{ transformStyle: "preserve-3d" }}>
        <div data-frente className="cara relative">
          <div data-destello-caja aria-hidden="true" className="absolute -inset-10 -z-10">
            <div data-destello className="size-full rounded-[3rem] bg-limpio/25 opacity-0 blur-2xl" />
          </div>

          <div
            role="img"
            aria-label="Ilustración de un informe comercial: pasa de estado moroso, con cuatro antecedentes, a historial limpio."
            className="relative overflow-hidden rounded-2xl border border-linea/70 bg-white shadow-tarjeta lg:rounded-[1.75rem]"
          >
            {/* Encabezado: dos capas para cambiar de color animando solo opacidad */}
            <div className="relative flex h-8 items-center justify-between overflow-hidden bg-deuda px-3.5 text-white lg:h-16 lg:px-6">
              <div data-cabecera-limpia className="absolute inset-0 bg-limpio opacity-0" />
              <span className="relative text-[0.6rem] font-medium tracking-[0.14em] uppercase lg:text-[0.68rem]">Informe comercial</span>
              <span className="relative grid justify-items-end text-[0.72rem] font-semibold tracking-wide lg:text-base">
                <span data-texto-moroso className="col-start-1 row-start-1">MOROSO</span>
                <span data-texto-limpio className="col-start-1 row-start-1 opacity-0">HISTORIAL LIMPIO ✓</span>
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 lg:block lg:p-6">
              <Medidor />
              <ul className="min-w-0 flex-1 lg:mt-5">
                {FILAS.map((fila, i) => (
                  <li key={fila.etiqueta} data-fila={i} className="relative border-t border-linea/70 first:border-t-0">
                    <div data-fila-fondo className="absolute inset-0 -mx-1 rounded bg-limpio-claro opacity-0 lg:-mx-2" />
                    <div className="relative flex items-center justify-between gap-2 py-[0.2rem] lg:py-2.5">
                      <span className="relative min-w-0 truncate text-[0.68rem] text-marino lg:text-sm">
                        <span data-fila-etiqueta>{fila.etiqueta}</span>
                        <span data-tachado className="absolute inset-x-0 top-1/2 h-px origin-left scale-x-0 bg-marino/70" />
                      </span>
                      <span className="grid shrink-0 justify-items-end text-[0.62rem] font-semibold lg:text-[0.8rem]">
                        <span data-fila-valor className="col-start-1 row-start-1 text-deuda">{fila.valor}</span>
                        <span data-fila-eliminado className="col-start-1 row-start-1 text-limpio-oscuro opacity-0">ELIMINADO</span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {SELLOS.map((sello, i) => (
              <span
                key={sello}
                data-sello={i}
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-6 rounded-lg border-2 border-marino bg-white/90 px-3 py-1 text-xs font-bold tracking-wider whitespace-nowrap text-marino uppercase opacity-0 lg:px-5 lg:py-2 lg:text-lg"
              >
                {sello}
              </span>
            ))}
          </div>

          {/* Puertas que el historial mantiene cerradas */}
          <ul aria-hidden="true" className="absolute inset-x-0 -bottom-4 flex justify-center gap-1 lg:static lg:contents">
            {CHIPS.map(({ nombre, Icono, posicion }, i) => (
              <li key={nombre} data-chip-caja className={`relative lg:absolute ${posicion}`}>
                <div data-chip={i} className="flex items-center gap-1 rounded-full border border-linea/80 bg-white px-1.5 py-1 text-[0.6rem] font-medium whitespace-nowrap text-marino opacity-0 shadow-sm lg:gap-1.5 lg:px-3 lg:py-2 lg:text-xs">
                  <Icono className="size-3.5 lg:size-4" />
                  <span>{nombre}</span>
                  <span className="relative size-3.5 lg:size-4">
                    <span data-candado-caja className="absolute inset-0">
                      <IconoCandado data-candado className="size-full text-deuda opacity-0" strokeWidth={2} />
                    </span>
                    <IconoCandadoAbierto data-candado-abierto className="absolute inset-0 size-full text-limpio opacity-0" strokeWidth={2} />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <ReversoCompacto />
      </div>
    </div>
  );
}

export function Escenario() {
  return (
    <>
      {/* Mobile: compacta y fija arriba. Desktop: columna derecha, a toda la altura de la historia. */}
      <div data-escenario className="pointer-events-none sticky top-14 z-20 bg-linear-to-b from-white from-85% to-white/0 px-4 pt-3 pb-7 lg:absolute lg:inset-0 lg:top-0 lg:z-10 lg:bg-none lg:p-0">
        <div className="lg:sticky lg:top-0 lg:h-svh">
          <div className="relative mx-auto h-full max-w-[77.5rem]">
            <div className="flex justify-center lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 lg:items-center" data-columna-tarjeta>
              <TarjetaInforme />
            </div>
          </div>
          <ReversoWizard />
        </div>
      </div>
    </>
  );
}
