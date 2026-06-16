import React from "react";
import { createRoot } from "react-dom/client";
import CurvedLoop from "./components/ui/CurvedLoop.jsx";

let mounted = false;
let mountedRoot = null;

export function initCurvedLoopMount() {
  if (mounted || typeof document === "undefined") {
    return () => {};
  }

  const root = document.querySelector("[data-curved-loop-root]");

  if (!root) {
    return () => {};
  }

  mounted = true;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  mountedRoot = createRoot(root);

  mountedRoot.render(
    <CurvedLoop
      marqueeText="白果 awa ✦ 随缘写代码 ✦ blog loading ✦ "
      speed={reduceMotion.matches ? 0 : 1.45}
      curveAmount={260}
      direction="right"
      interactive={!reduceMotion.matches}
      className="footer-loop-text latin"
    />,
  );

  return () => {
    mountedRoot?.unmount();
    mountedRoot = null;
    mounted = false;
  };
}
