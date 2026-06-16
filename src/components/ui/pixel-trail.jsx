"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function useElementSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof window.ResizeObserver === "undefined") {
      return undefined;
    }

    const update = () => {
      const rect = node.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    update();
    const observer = new window.ResizeObserver(update);
    observer.observe(node);

    return () => observer.disconnect();
  }, [ref]);

  return size;
}

export function PixelTrail({
  pixelSize = 80,
  fadeDuration = 620,
  delay = 220,
  className,
  pixelClassName,
}) {
  const trailId = useId().replaceAll(":", "");
  const containerRef = useRef(null);
  const { width, height } = useElementSize(containerRef);
  const columns = Math.max(0, Math.ceil(width / pixelSize));
  const rows = Math.max(0, Math.ceil(height / pixelSize));
  const pixels = useMemo(
    () => Array.from({ length: rows * columns }, (_, index) => ({
      column: index % columns,
      row: Math.floor(index / columns),
    })),
    [columns, rows],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || columns === 0 || rows === 0) {
      return undefined;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      return undefined;
    }

    const animatePixel = (event) => {
      const rect = container.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;

      if (localX < 0 || localY < 0 || localX > rect.width || localY > rect.height) {
        return;
      }

      const column = Math.floor(localX / pixelSize);
      const row = Math.floor(localY / pixelSize);
      const pixel = container.querySelector(`[data-pixel-key="${trailId}-${column}-${row}"]`);

      if (!pixel) {
        return;
      }

      pixel.style.animation = "none";
      pixel.style.opacity = "1";
      window.requestAnimationFrame(() => {
        pixel.style.animation = `pixel-trail-fade ${fadeDuration}ms ease ${delay}ms forwards`;
      });
    };

    window.addEventListener("pointermove", animatePixel, { passive: true });
    window.addEventListener("mousemove", animatePixel, { passive: true });

    return () => {
      window.removeEventListener("pointermove", animatePixel);
      window.removeEventListener("mousemove", animatePixel);
    };
  }, [columns, delay, fadeDuration, pixelSize, rows, trailId]);

  return (
    <div ref={containerRef} aria-hidden="true" className={cx("pixel-trail", className)}>
      <div
        className="pixel-trail-grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, ${pixelSize}px)`,
          gridAutoRows: `${pixelSize}px`,
        }}
      >
        {pixels.map(({ column, row }) => (
          <span
            key={`${column}-${row}`}
            data-pixel-key={`${trailId}-${column}-${row}`}
            className={cx("pixel-trail-dot", pixelClassName)}
            style={{ width: pixelSize, height: pixelSize }}
          />
        ))}
      </div>
    </div>
  );
}
