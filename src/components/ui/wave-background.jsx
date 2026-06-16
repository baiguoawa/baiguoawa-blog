"use client";

import { useEffect, useRef } from "react";
import { createNoise2D } from "simplex-noise";

export function WaveBackground({
  className = "",
  strokeColor = "rgba(182, 95, 40, 0.16)",
  backgroundColor = "transparent",
  pointerSize = 0,
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const mouseRef = useRef({
    x: -10,
    y: 0,
    lx: 0,
    ly: 0,
    sx: 0,
    sy: 0,
    v: 0,
    vs: 0,
    a: 0,
    set: false,
  });
  const pathsRef = useRef([]);
  const linesRef = useRef([]);
  const noiseRef = useRef(null);
  const rafRef = useRef(null);
  const boundingRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;

    if (!container || !svg) {
      return undefined;
    }

    noiseRef.current = createNoise2D();

    const setSize = () => {
      boundingRef.current = container.getBoundingClientRect();
      const { width, height } = boundingRef.current;

      svg.style.width = `${width}px`;
      svg.style.height = `${height}px`;
    };

    const setLines = () => {
      if (!boundingRef.current) {
        return;
      }

      const { width, height } = boundingRef.current;
      const xGap = width < 680 ? 14 : 10;
      const yGap = width < 680 ? 14 : 10;
      const oWidth = width + 220;
      const oHeight = height + 60;
      const totalLines = Math.ceil(oWidth / xGap);
      const totalPoints = Math.ceil(oHeight / yGap);
      const xStart = (width - xGap * totalLines) / 2;
      const yStart = (height - yGap * totalPoints) / 2;

      pathsRef.current.forEach((path) => path.remove());
      pathsRef.current = [];
      linesRef.current = [];

      for (let i = 0; i < totalLines; i += 1) {
        const points = [];

        for (let j = 0; j < totalPoints; j += 1) {
          points.push({
            x: xStart + xGap * i,
            y: yStart + yGap * j,
            wave: { x: 0, y: 0 },
            cursor: { x: 0, y: 0, vx: 0, vy: 0 },
          });
        }

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        path.classList.add("wave-background-line");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", strokeColor);
        path.setAttribute("stroke-width", "1");
        path.setAttribute("vector-effect", "non-scaling-stroke");
        svg.appendChild(path);
        pathsRef.current.push(path);
        linesRef.current.push(points);
      }
    };

    const onResize = () => {
      setSize();
      setLines();
    };

    const updateMousePosition = (x, y) => {
      if (!boundingRef.current) {
        return;
      }

      const mouse = mouseRef.current;

      mouse.x = x - boundingRef.current.left;
      mouse.y = y - boundingRef.current.top;

      if (!mouse.set) {
        mouse.sx = mouse.x;
        mouse.sy = mouse.y;
        mouse.lx = mouse.x;
        mouse.ly = mouse.y;
        mouse.set = true;
      }

      container.style.setProperty("--x", `${mouse.sx}px`);
      container.style.setProperty("--y", `${mouse.sy}px`);
    };

    const onMouseMove = (event) => updateMousePosition(event.clientX, event.clientY);

    const onTouchMove = (event) => {
      const touch = event.touches[0];

      if (touch) {
        updateMousePosition(touch.clientX, touch.clientY);
      }
    };

    const moved = (point, withCursorForce = true) => ({
      x: point.x + point.wave.x + (withCursorForce ? point.cursor.x : 0),
      y: point.y + point.wave.y + (withCursorForce ? point.cursor.y : 0),
    });

    const movePoints = (time) => {
      const noise = noiseRef.current;

      if (!noise) {
        return;
      }

      const mouse = mouseRef.current;

      linesRef.current.forEach((points) => {
        points.forEach((point) => {
          const move =
            noise((point.x + time * 0.008) * 0.003, (point.y + time * 0.003) * 0.002) * 8;

          point.wave.x = Math.cos(move) * 12;
          point.wave.y = Math.sin(move) * 6;

          const dx = point.x - mouse.sx;
          const dy = point.y - mouse.sy;
          const distance = Math.hypot(dx, dy);
          const limit = Math.max(175, mouse.vs);

          if (distance < limit) {
            const strength = 1 - distance / limit;
            const force = Math.cos(distance * 0.001) * strength;

            point.cursor.vx += Math.cos(mouse.a) * force * limit * mouse.vs * 0.00035;
            point.cursor.vy += Math.sin(mouse.a) * force * limit * mouse.vs * 0.00035;
          }

          point.cursor.vx += (0 - point.cursor.x) * 0.01;
          point.cursor.vy += (0 - point.cursor.y) * 0.01;
          point.cursor.vx *= 0.95;
          point.cursor.vy *= 0.95;
          point.cursor.x = Math.min(50, Math.max(-50, point.cursor.x + point.cursor.vx));
          point.cursor.y = Math.min(50, Math.max(-50, point.cursor.y + point.cursor.vy));
        });
      });
    };

    const drawLines = () => {
      linesRef.current.forEach((points, lineIndex) => {
        const path = pathsRef.current[lineIndex];

        if (!path || points.length < 2) {
          return;
        }

        const firstPoint = moved(points[0], false);
        let pathData = `M ${firstPoint.x} ${firstPoint.y}`;

        for (let i = 1; i < points.length; i += 1) {
          const current = moved(points[i]);
          pathData += `L ${current.x} ${current.y}`;
        }

        path.setAttribute("d", pathData);
      });
    };

    const tick = (time) => {
      const mouse = mouseRef.current;

      mouse.sx += (mouse.x - mouse.sx) * 0.1;
      mouse.sy += (mouse.y - mouse.sy) * 0.1;

      const dx = mouse.x - mouse.lx;
      const dy = mouse.y - mouse.ly;
      const distance = Math.hypot(dx, dy);

      mouse.v = distance;
      mouse.vs += (distance - mouse.vs) * 0.1;
      mouse.vs = Math.min(100, mouse.vs);
      mouse.lx = mouse.x;
      mouse.ly = mouse.y;
      mouse.a = Math.atan2(dy, dx);

      container.style.setProperty("--x", `${mouse.sx}px`);
      container.style.setProperty("--y", `${mouse.sy}px`);

      movePoints(time);
      drawLines();

      rafRef.current = requestAnimationFrame(tick);
    };

    setSize();
    setLines();
    rafRef.current = requestAnimationFrame(tick);

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    container.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("touchmove", onTouchMove);
    };
  }, [backgroundColor, strokeColor]);

  return (
    <div
      ref={containerRef}
      className={`wave-background ${className}`}
      style={{ backgroundColor }}
      aria-hidden="true"
    >
      <svg ref={svgRef} className="wave-background-svg" xmlns="http://www.w3.org/2000/svg" />
      {pointerSize > 0 ? (
        <span
          className="wave-background-pointer"
          style={{
            width: `${pointerSize}rem`,
            height: `${pointerSize}rem`,
            background: strokeColor,
          }}
        />
      ) : null}
    </div>
  );
}
