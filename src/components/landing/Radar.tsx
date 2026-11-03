// Fondo de la historia: el radar escanea el historial, detecta cada antecedente y termina en verde.
// El barrido gira solo con CSS (transform); lo demás lo mueve el scroll desde Animaciones.tsx.

const ANILLOS = [120, 210, 300, 390, 480];

// Coordenadas sobre un viewBox de 1000, con el centro detrás de la tarjeta. Mismo orden que las filas.
const DETECCIONES = [
  { x: 270, y: 225, etiqueta: "Deuda castigada", lado: "izquierda" },
  { x: 722, y: 200, etiqueta: "Morosidad comercial", lado: "derecha" },
  { x: 722, y: 772, etiqueta: "Informe financiero", lado: "derecha" },
  { x: 265, y: 772, etiqueta: "Antecedente penal", lado: "izquierda" },
] as const;

export function Radar() {
  return (
    <div data-radar aria-hidden="true" className="radar pointer-events-none absolute top-1/2 left-1/2 -z-10 aspect-square w-[170vw] -translate-x-1/2 -translate-y-1/2 opacity-60 lg:w-[max(135vh,56rem)] lg:opacity-100">
      <div className="radar-mascara absolute inset-0 overflow-hidden rounded-full">
        <div className="radar-barrido absolute inset-0">
          <div data-barrido-rojo className="radar-cono-rojo absolute inset-0 rounded-full" />
          <div data-barrido-verde className="radar-cono-verde absolute inset-0 rounded-full opacity-0" />
        </div>
      </div>

      <svg viewBox="0 0 1000 1000" className="absolute inset-0 size-full overflow-visible">
        <g fill="none" stroke="var(--color-marino)" strokeOpacity="0.1" strokeWidth="1" vectorEffect="non-scaling-stroke">
          {ANILLOS.map((r) => (
            <circle key={r} cx="500" cy="500" r={r} vectorEffect="non-scaling-stroke" />
          ))}
          <line x1="20" y1="500" x2="980" y2="500" vectorEffect="non-scaling-stroke" />
          <line x1="500" y1="20" x2="500" y2="980" vectorEffect="non-scaling-stroke" />
        </g>
        <circle data-radar-pulso cx="500" cy="500" r="390" fill="none" stroke="var(--color-limpio)" strokeWidth="2" vectorEffect="non-scaling-stroke" opacity="0" />
      </svg>

      {/* Las detecciones solo caben alrededor de la tarjeta en desktop */}
      <div className="absolute inset-0 hidden lg:block">
        {DETECCIONES.map(({ x, y, etiqueta, lado }, i) => (
          <div key={etiqueta} data-deteccion={i} className="absolute" style={{ left: `${x / 10}%`, top: `${y / 10}%` }}>
            <span className="radar-punto absolute -top-1 -left-1 size-2 rounded-full bg-deuda" />
            <span className={`absolute top-1/2 hidden -translate-y-1/2 text-[0.7rem] font-medium xl:block whitespace-nowrap text-deuda ${lado === "izquierda" ? "right-3.5" : "left-3.5"}`}>
              {etiqueta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
