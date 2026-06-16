"use client";

import { useEffect } from "react";

import { initHomeEnhancements } from "../../main.js";

export function HomeEnhancements() {
  useEffect(() => {
    let cleanup;
    let cancelled = false;
    const frameId = window.requestAnimationFrame(() => {
      if (cancelled) return;
      cleanup = initHomeEnhancements();
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      cleanup?.();
    };
  }, []);

  return null;
}
