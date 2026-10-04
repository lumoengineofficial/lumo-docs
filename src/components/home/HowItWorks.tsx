import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = [
  {
    step: "01",
    title: "Download the asset",
    body: "Grab any free pack from the store — or publish your own and let the community download it.",
    icon: (
      <path
        d="M12 4v10m0 0 4-4m-4 4-4-4M5 17v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    step: "02",
    title: "Drop it into Assets/",
    body: "Unzip the pack into your project's Assets/ folder. The engine picks up the folder automatically — no import wizard.",
    icon: (
      <path
        d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4L11 8.5h8.5A1.5 1.5 0 0 1 21 10v7.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-10Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    ),
  },
  {
    step: "03",
    title: "Import in the editor",
    body: "Open the Lumo editor, hit Import and the asset appears in your scene — materials, animations and audio mapped for you.",
    icon: (
      <path
        d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13ZM9 12l2.5 2.5L15.5 10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="How it works"
        title="Three steps from store to scene"
        description="No package manager, no registry lock-in. Lumo assets are plain folders with predictable layouts."
        align="center"
      />

      <div className="grid gap-5 md:grid-cols-3">
        {steps.map((item) => (
          <div
            key={item.step}
            className="group relative overflow-hidden rounded-2xl border border-line bg-panel p-6 transition hover:border-accent/50"
          >
            <div className="absolute right-4 top-4 font-mono text-5xl font-bold text-title/[0.04] transition group-hover:text-accent/10">
              {item.step}
            </div>
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-accent/30 bg-accent-soft text-accent-light transition group-hover:bg-accent group-hover:text-title">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                {item.icon}
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-title">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
