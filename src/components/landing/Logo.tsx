export function Logo({ url, claro = false }: { url?: string; claro?: boolean }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element -- logo configurable desde el panel, de cualquier origen
    return <img src={url} alt="Elimínate" className="h-7 w-auto" />;
  }
  return (
    <span className={`text-lg font-semibold tracking-tight ${claro ? "text-white" : "text-marino"}`}>
      Elimínate<span className="text-limpio">.</span>
    </span>
  );
}
