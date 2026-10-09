/** Soft, slowly drifting colour fields that give the glass surfaces something to refract. */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#f5f6f9]">
      <div className="absolute -top-40 -left-32 h-[520px] w-[520px] animate-float rounded-full bg-[#b9d0ff] opacity-80 blur-[110px]" />
      <div
        className="absolute top-1/3 -right-40 h-[560px] w-[560px] animate-float rounded-full bg-[#f9c9e1] opacity-70 blur-[120px]"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="absolute -bottom-48 left-1/4 h-[520px] w-[520px] animate-float rounded-full bg-[#c4efe4] opacity-80 blur-[120px]"
        style={{ animationDelay: "-12s" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.7),transparent_60%)]" />
    </div>
  );
}
