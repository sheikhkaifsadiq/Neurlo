"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Play, X } from "lucide-react";

const DEMO_VIDEO_URL =
  "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0";

export function HeroCtaButtons() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Link
          href="/auth/signup"
          className="btn-primary h-14 px-8 text-sm group justify-center"
        >
          ACTIVATE NEURLO
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-secondary h-14 px-8 text-sm border-border-bright justify-center"
        >
          <Play className="w-4 h-4 mr-2 fill-current" />
          WATCH DEMO
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-bg rounded-2xl overflow-hidden border border-border-bright shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-bg/80 border border-border flex items-center justify-center text-text hover:bg-surface-2 transition-colors"
              aria-label="Close demo"
            >
              <X className="w-4 h-4" />
            </button>
            <iframe
              src={DEMO_VIDEO_URL}
              title="Neurlo product demo"
              className="w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
