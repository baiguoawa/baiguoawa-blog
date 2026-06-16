import { useEffect, useId, useMemo, useRef, useState } from "react";

export default function CurvedLoop({
  marqueeText = "",
  speed = 2,
  className,
  curveAmount = 400,
  direction = "left",
  interactive = true,
}) {
  const text = useMemo(() => {
    const hasTrailing = /\s|\u00A0$/.test(marqueeText);
    return `${hasTrailing ? marqueeText.replace(/\s+$/, "") : marqueeText}\u00A0`;
  }, [marqueeText]);

  const measureRef = useRef(null);
  const textPathRef = useRef(null);
  const pathRef = useRef(null);
  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const dirRef = useRef(direction);
  const velRef = useRef(0);
  const [spacing, setSpacing] = useState(0);
  const [offset, setOffset] = useState(0);
  const uid = useId().replace(/:/g, "");
  const pathId = `curve-${uid}`;
  const pathD = `M-100,40 Q500,${40 + curveAmount} 1540,40`;
  const totalText = spacing ? Array(Math.ceil(1800 / spacing) + 2).fill(text).join("") : text;
  const ready = spacing > 0;

  useEffect(() => {
    let active = true;
    const measure = () => {
      if (active && measureRef.current) {
        setSpacing(measureRef.current.getComputedTextLength());
      }
    };

    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      active = false;
      window.removeEventListener("resize", measure);
    };
  }, [text, className]);

  useEffect(() => {
    if (!spacing || !textPathRef.current) {
      return;
    }

    const initial = -spacing;
    textPathRef.current.setAttribute("startOffset", `${initial}px`);
    setOffset(initial);
  }, [spacing]);

  useEffect(() => {
    if (!spacing || !ready || speed === 0) {
      return undefined;
    }

    let frame = 0;
    const step = () => {
      if (!dragRef.current && textPathRef.current) {
        const delta = dirRef.current === "right" ? speed : -speed;
        const currentOffset = parseFloat(textPathRef.current.getAttribute("startOffset") || "0");
        let newOffset = currentOffset + delta;

        if (newOffset <= -spacing) {
          newOffset += spacing;
        }

        if (newOffset > 0) {
          newOffset -= spacing;
        }

        textPathRef.current.setAttribute("startOffset", `${newOffset}px`);
        setOffset(newOffset);
      }

      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [spacing, speed, ready]);

  const onPointerDown = (event) => {
    if (!interactive) {
      return;
    }

    dragRef.current = true;
    lastXRef.current = event.clientX;
    velRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!interactive || !dragRef.current || !textPathRef.current) {
      return;
    }

    const dx = event.clientX - lastXRef.current;
    lastXRef.current = event.clientX;
    velRef.current = dx;

    const currentOffset = parseFloat(textPathRef.current.getAttribute("startOffset") || "0");
    let newOffset = currentOffset + dx;

    if (newOffset <= -spacing) {
      newOffset += spacing;
    }

    if (newOffset > 0) {
      newOffset -= spacing;
    }

    textPathRef.current.setAttribute("startOffset", `${newOffset}px`);
    setOffset(newOffset);
  };

  const endDrag = () => {
    if (!interactive) {
      return;
    }

    dragRef.current = false;
    dirRef.current = velRef.current > 0 ? "right" : "left";
  };

  const cursorStyle = interactive ? (dragRef.current ? "grabbing" : "grab") : "auto";

  return (
    <div
      className="curved-loop-jacket"
      style={{ visibility: ready ? "visible" : "hidden", cursor: cursorStyle }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onPointerCancel={endDrag}
    >
      <svg className="curved-loop-svg" viewBox="0 0 1440 120" role="img" aria-label={marqueeText}>
        <text ref={measureRef} xmlSpace="preserve" className={className} style={{ visibility: "hidden", opacity: 0, pointerEvents: "none" }}>
          {text}
        </text>
        <defs>
          <path ref={pathRef} id={pathId} d={pathD} fill="none" stroke="transparent" />
        </defs>
        {ready && (
          <text fontWeight="bold" xmlSpace="preserve" className={className}>
            <textPath ref={textPathRef} href={`#${pathId}`} startOffset={`${offset}px`} xmlSpace="preserve">
              {totalText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
}
