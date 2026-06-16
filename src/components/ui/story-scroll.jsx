"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function applyEdgeSquish(target, direction, intensity) {
  gsap.killTweensOf(target, "scaleX,scaleY,yPercent");
  gsap.set(target, {
    scaleX: 1 + intensity * 0.034,
    scaleY: 1 - intensity * 0.052,
    yPercent: direction > 0 ? intensity * 1.4 : -intensity * 0.9,
  });
}

function releaseEdgeSquish(target) {
  gsap.killTweensOf(target, "scaleX,scaleY,yPercent");
  gsap.to(target, {
    scaleX: 1,
    scaleY: 1,
    yPercent: 0,
    duration: 0.42,
    ease: "elastic.out(1.04, 0.56)",
    overwrite: "auto",
  });
}

export function FlowSection({ id, className, style = {}, children, "aria-label": ariaLabel }) {
  return (
    <section
      id={id}
      data-flow-section
      aria-label={ariaLabel}
      className={cx("relative min-h-screen w-full overflow-hidden", className)}
    >
      <div
        data-flow-inner
        className={cx(
          "flow-art-container relative flex min-h-screen w-full flex-col justify-between gap-6 px-[4vw] pt-[clamp(2rem,8vw,4vw)] pb-[4vw]",
          "will-change-transform",
        )}
        style={{ transformOrigin: "bottom left", ...style }}
      >
        <div className="flow-art-content">{children}</div>
      </div>
    </section>
  );
}

const childCount = (children) => React.Children.count(children);

export default function FlowArt({
  children,
  className,
  "aria-label": ariaLabel = "Story scroll",
}) {
  const containerRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useGSAP(
    () => {
      if (!containerRef.current || reducedMotion) return undefined;

      const sections = Array.from(containerRef.current.querySelectorAll("[data-flow-section]"));
      if (sections.length === 0) return undefined;

      const triggers = [];
      const delayedReleases = [];

      sections.forEach((section, index) => {
        gsap.set(section, { zIndex: index + 1 });

        const inner = section.querySelector(".flow-art-container");
        if (!inner) return;
        const content = inner.querySelector(".flow-art-content") || inner;

        gsap.set(content, { transformOrigin: "center center" });

        if (index > 0) {
          const releaseCall = gsap.delayedCall(0.04, () => releaseEdgeSquish(content)).pause();

          delayedReleases.push(releaseCall);

          gsap.set(inner, {
            "--story-page-alpha": 0.64,
            "--story-page-radius": "44px",
            rotation: 30,
            transformOrigin: "bottom left",
          });
          const tween = gsap.to(inner, {
            "--story-page-alpha": 1,
            "--story-page-radius": "0px",
            rotation: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "top 25%",
              scrub: true,
              onUpdate: (self) => {
                const velocity = self.getVelocity();
                const edgeProgress = gsap.utils.clamp(0, 1, (self.progress - 0.82) / 0.18);
                const velocityImpact = gsap.utils.clamp(0, 1, Math.abs(velocity) / 3400);
                const intensity = edgeProgress * velocityImpact;

                if (intensity > 0.001) {
                  applyEdgeSquish(content, Math.sign(velocity) || 1, intensity);
                  releaseCall.restart(true);
                  return;
                }

                releaseCall.restart(true);
              },
              onLeave: () => releaseEdgeSquish(content),
              onLeaveBack: () => releaseEdgeSquish(content),
              onRefresh: () => releaseEdgeSquish(content),
            },
          });

          if (tween.scrollTrigger) {
            triggers.push(tween.scrollTrigger);
          }
        }

        if (index < sections.length - 1) {
          triggers.push(
            ScrollTrigger.create({
              trigger: section,
              start: "bottom bottom",
              end: "bottom top",
              pin: true,
              pinSpacing: false,
              anticipatePin: 1,
            }),
          );
        }
      });

      ScrollTrigger.refresh();

      return () => {
        delayedReleases.forEach((call) => call.kill());
        triggers.forEach((trigger) => trigger.kill());
      };
    },
    { scope: containerRef, dependencies: [childCount(children), reducedMotion] },
  );

  return (
    <main ref={containerRef} aria-label={ariaLabel} className={cx("w-full overflow-x-hidden", className)}>
      {children}
    </main>
  );
}
