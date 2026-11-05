import type { CSSProperties } from "react";

// Fondo del informe: escanea en rojo, apaga cada detección al borrar y termina en verde.
// El barrido gira solo con CSS (transform); el color lo mueve --avance, de InformeBorrable.

const ANILLOS = [90, 180, 270, 360, 450];
const SEGUNDOS_VUELTA = 7; // igual que radar-gira en globals.css

// Coordenadas sobre un viewBox de 1000, con el centro detrás del informe.
const DETECCIONES = [
  { x: 235, y: 270, etiqueta: "Deuda castigada" },
  { x: 690, y: 270, etiqueta: "Morosidad comercial" },
  { x: 690, y: 750, etiqueta: "Informe financiero" },
  { x: 235, y: 750, etiqueta: "Antecedente penal" },
];

export function Radar({ abiertas }: { abiertas: number }) {
  return (
    <div aria-hidden="true" className="radar pointer-events-none absolute top-1/2 left-1/2 -z-20 aspect-square w-[170vw] -translate-x-1/2 -translate-y-1/2 sm:w-[120vw] lg:w-[max(125vh,56rem)]">
      <div className="radar-mascara absolute inset-0 overflow-hidden rounded-full">
        <div className="radar-barrido absolute inset-0">
          <div className="radar-cono-rojo absolute inset-0 rounded-full" />
          <div className="radar-cono-verde absolute inset-0 rounded-full" />
        </div>
      </div>

      <svg viewBox="0 0 1000 1000" className="radar-anillos absolute inset-0 size-full overflow-visible">
        <g fill="none" stroke="var(--color-marino)" strokeWidth="1">
          {ANILLOS.map((r) => (
            <circle key={r} cx="500" cy="500" r={r} vectorEffect="non-scaling-stroke" />
          ))}
          <line x1="50" y1="500" x2="950" y2="500" vectorEffect="non-scaling-stroke" />
          <line x1="500" y1="50" x2="500" y2="950" vectorEffect="non-scaling-stroke" />
        </g>
      </svg>

      {/* Se vuelve a montar al completar el informe, para disparar el pulso una vez */}
      {abiertas === 4 && <span key="pulso" className="radar-pulso absolute inset-[5%] rounded-full border-2 border-limpio" />}

      <div className="absolute inset-0 hidden lg:block">
        {DETECCIONES.map(({ x, y, etiqueta }, i) => (
          <div
            key={etiqueta}
            className="absolute transition-opacity duration-500"
            style={{ left: `${x / 10}%`, top: `${y / 10}%`, opacity: i < abiertas ? 0 : 1 }}
          >
            <span
              className="radar-punto absolute -top-1 -left-1 size-2 rounded-full bg-deuda"
              style={{ "--eco": `${(((((Math.atan2(x - 500, 500 - y) * 180) / Math.PI + 360) % 360) / 360) * SEGUNDOS_VUELTA).toFixed(2)}s` } as CSSProperties}
            />
            <span className="absolute top-1/2 left-3.5 hidden -translate-y-1/2 text-[0.7rem] font-medium whitespace-nowrap text-deuda xl:block">{etiqueta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
