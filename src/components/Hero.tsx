"use client";

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-6"
      style={{ paddingTop: "clamp(80px, 12vh, 130px)", paddingBottom: "clamp(36px, 6vh, 64px)" }}
    >
      <h1
        className="font-mclaren leading-none mb-4"
        style={{
          fontSize: "clamp(38px, 5.5vw, 76px)",
          color: "var(--color-brown)",
        }}
      >
        Project US
      </h1>
      <p
        className="font-walter max-w-3xl leading-relaxed"
        style={{
          fontSize: "clamp(14px, 1.8vw, 22px)",
          color: "var(--color-gray)",
        }}
      >
        What if there was a team of skilled people that worked and focused only on what truly matters: the people, the connection, us.
      </p>
    </section>
  );
}
