const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  size: 2 + ((i * 13) % 5),
  duration: 9 + ((i * 7) % 10),
  delay: (i * 1.3) % 12,
  drift: `${(i % 2 === 0 ? 1 : -1) * (10 + (i % 5) * 6)}px`,
}));

export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#201c1e]">
      <div
        className="animated-grid absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage:
            "linear-gradient(#ca2027 1px, transparent 1px), linear-gradient(90deg, #ca2027 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="animated-blob-1 absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-[#ca2027] opacity-30 blur-[110px]" />
      <div className="animated-blob-2 absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] rounded-full bg-[#ff4d55] opacity-20 blur-[100px]" />
      <div className="animated-blob-1 absolute -right-24 top-1/3 h-[24rem] w-[24rem] rounded-full bg-[#ca2027] opacity-20 blur-[100px]" />

      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={
            {
              left: p.left,
              width: p.size,
              height: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              "--drift": p.drift,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
