export function Atmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1]" aria-hidden="true">
      <div className="atmosphere-vignette absolute inset-0" />
      <div className="atmosphere-fog absolute inset-0" />
      <div className="atmosphere-noise absolute inset-0" />
      <div className="atmosphere-scanlines absolute inset-0" />
    </div>
  );
}
