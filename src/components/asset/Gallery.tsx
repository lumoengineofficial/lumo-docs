"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const current = images[active] ?? images[0];

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="group relative block aspect-[16/10] w-full overflow-hidden rounded-2xl border border-line bg-panel2"
        aria-label={`Open ${alt} preview`}
      >
        <Image
          src={current}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 700px"
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <span className="absolute bottom-3 right-3 rounded-md border border-white/10 bg-black/60 px-2 py-1 text-[11px] text-white/80 opacity-0 backdrop-blur transition group-hover:opacity-100">
          Click to enlarge
        </span>
      </button>

      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "relative aspect-[16/10] overflow-hidden rounded-lg border transition",
                index === active
                  ? "border-accent ring-2 ring-accent/30"
                  : "border-line opacity-70 hover:opacity-100",
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image src={image} alt="" fill sizes="150px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {lightbox ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-black/50 text-white transition hover:bg-white/10"
            aria-label="Close preview"
            onClick={() => setLightbox(false)}
          >
            ✕
          </button>
          <div
            className="relative aspect-[16/10] max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={current} alt={alt} fill sizes="100vw" className="object-contain" />
          </div>
          {images.length > 1 ? (
            <div className="absolute bottom-5 flex gap-2" onClick={(e) => e.stopPropagation()}>
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActive(index)}
                  className={cn(
                    "h-2 rounded-full transition",
                    index === active ? "w-6 bg-accent" : "w-2 bg-white/30 hover:bg-white/60",
                  )}
                  aria-label={`Preview ${index + 1}`}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
