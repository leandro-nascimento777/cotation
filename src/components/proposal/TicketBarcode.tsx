export const TicketBarcode = ({ code = "123 456 789 10 11 12" }: { code?: string }) => {
  // Padrão de barras Code 128 / EAN vetorial robusto, largo e nítido
  const barPattern = [
    3, 2, 2, 4, 1, 3, 4, 2, 2, 3, 5, 2, 3, 2, 2, 4, 3, 2, 2, 5, 2, 3, 2, 4,
    2, 3, 5, 2, 3, 2, 4, 2, 2, 3, 4, 2, 3, 5, 2, 3, 2, 4, 3, 2, 3, 5, 2, 3,
    2, 4, 2, 3, 5, 3, 2, 2, 4, 2, 3, 2, 5, 2, 2, 3,
  ];

  let currentX = 0;
  const bars: { x: number; width: number }[] = [];
  barPattern.forEach((w, idx) => {
    const isBar = idx % 2 === 0;
    if (isBar) {
      bars.push({ x: currentX, width: w });
    }
    currentX += w;
  });

  const totalWidth = currentX;

  return (
    <div className="shrink-0 flex items-center justify-center pl-1 pr-4 sm:pr-8 md:pr-10 py-2">
      <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
        <svg
          viewBox={`0 0 ${totalWidth} 220`}
          preserveAspectRatio="none"
          className="shrink-0 block w-10 h-36 sm:w-12 sm:h-40 md:w-14 md:h-44 lg:h-48"
        >
          {bars.map((b, i) => (
            <rect
              key={i}
              x={b.x}
              y={0}
              width={b.width}
              height={220}
              fill="#000000"
            />
          ))}
        </svg>
        <span
          className="font-ticket text-[11px] sm:text-[13px] md:text-[14px] font-bold tracking-[0.32em] text-[#6E44FF] select-none [writing-mode:vertical-rl] rotate-180"
          style={{ letterSpacing: "0.32em" }}
        >
          {code}
        </span>
      </div>
    </div>
  );
};
