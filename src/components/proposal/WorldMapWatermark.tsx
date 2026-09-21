export const WorldMapWatermark = () => (
  <div
    className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-45 select-none"
    aria-hidden="true"
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/world-map.svg"
      alt=""
      className="h-[88%] w-[94%] object-contain"
    />
  </div>
);

