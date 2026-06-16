"use client";

import { useEffect } from "react";

import { initCursorGlass } from "../main.js";

export function GlobalCursor() {
  useEffect(() => initCursorGlass(), []);

  return (
    <>
      <style>{`
        .cursor-glass:not(.is-interactive) {
          --fluid-glass-scale: 0.05;
          --fluid-glass-ior: 1.15;
          --fluid-glass-thickness: 5;
          background: transparent;
          -webkit-backdrop-filter: url("#cursor-liquid-filter") blur(calc(var(--fluid-glass-scale) * 7px));
          backdrop-filter: url("#cursor-liquid-filter") blur(calc(var(--fluid-glass-scale) * 7px));
        }

        .cursor-glass:not(.is-interactive) .cursor-ring {
          border-color: rgba(23, 19, 15, 0.32);
        }

        .cursor-glass:not(.is-interactive) .cursor-ring-inner {
          border-color: rgba(255, 250, 242, 0.58);
        }

        .cursor-glass:not(.is-interactive) .cursor-core {
          background: rgba(23, 19, 15, 0.28);
        }
      `}</style>
      <div className="cursor-glass" aria-hidden="true">
        <span className="cursor-ring cursor-ring-outer" />
        <span className="cursor-ring cursor-ring-inner" />
        <span className="cursor-core" />
        <svg className="cursor-pointer-outline" viewBox="0 0 72 72" focusable="false">
          <path d="M 21 8 C 17 6 13 10 14 15 L 23 58 C 24 64 32 66 36 60 L 42 49 L 55 53 C 62 55 67 46 61 41 L 29 10 C 27 8 24 7 21 8 Z" />
        </svg>
      </div>

      <svg className="cursor-filter" aria-hidden="true" focusable="false">
        <defs>
          <filter id="cursor-liquid-filter" colorInterpolationFilters="sRGB">
            <feImage id="cursor-liquid-map" result="map" />
            <feDisplacementMap
              id="cursor-liquid-displacement"
              in="SourceGraphic"
              in2="map"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
    </>
  );
}
