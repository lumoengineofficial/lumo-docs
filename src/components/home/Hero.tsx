import Image from "next/image";
import { SITE } from "@/lib/constants";
import { ButtonLink } from "@/components/ui/Button";

const previewCards = [
  { title: "Forest Ranger", meta: "3D Model · 12.4k", seed: "lumo-ranger" },
  { title: "Neon UI Kit", meta: "Sprites · 8.1k", seed: "lumo-ui" },
  { title: "Footstep Pack", meta: "Audio · 6.7k", seed: "lumo-audio" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="absolute inset-0 surface-grid opacity-60" />
      <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-accent/25 blur-[140px]" />
      <div className="absolute -right-32 top-24 h-[420px] w-[420px] rounded-full bg-[#8b5ef5]/20 blur-[130px]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:px-8 lg:py-28">
        <div className="animate-fadeUp">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent-soft px-3 py-1 text-xs font-medium text-accent-light">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Lumo Engine v1.0.0 is out
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Assets for
            <br />
            <span className="text-gradient">Lumo Engine</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            The official marketplace for the open-source 3D game engine. Grab production-ready
            models, textures, sprites, audio and editor plugins — then drop them straight into
            your project&apos;s <code className="rounded bg-panel2 px-1.5 py-0.5 text-accent-light">Assets/</code>{" "}
            folder.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href={SITE.engineZip} size="lg" className="sm:w-auto">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 17.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download Engine
            </ButtonLink>
            <ButtonLink href={SITE.releases} variant="secondary" size="lg">
              All releases
              <span aria-hidden="true">↗</span>
            </ButtonLink>
          </div>

          <dl className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-muted">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Windows x64 · v1.0.0
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              MIT licensed core
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8b5ef5]" />
              glTF · FBX · PNG · WAV
            </div>
          </dl>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-accent/20 to-transparent blur-3xl" />
          <div className="relative rounded-2xl border border-line bg-panel/80 p-4 shadow-card backdrop-blur">
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-2 font-mono">lumo://asset-store</span>
              </div>
              <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                Connected
              </span>
            </div>

            <div className="grid gap-3">
              {previewCards.map((card, i) => (
                <div
                  key={card.title}
                  className="flex items-center gap-3 rounded-xl border border-line bg-ink/70 p-3 transition hover:border-accent/40"
                  style={{ transform: `translateX(${i * 8}px)` }}
                >
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={`https://picsum.photos/seed/${card.seed}/320/220`}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{card.title}</p>
                    <p className="truncate text-xs text-muted">{card.meta}</p>
                  </div>
                  <span className="ml-auto rounded-md border border-accent/40 bg-accent-soft px-2 py-1 text-[10px] font-medium text-accent-light">
                    Imported
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-xl border border-dashed border-line px-4 py-3 text-center text-xs text-muted">
              Drop a .zip into <span className="text-accent-light">/Assets</span> to install
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
