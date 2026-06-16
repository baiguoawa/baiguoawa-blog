import React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";

import { PixelTrail } from "./components/ui/pixel-trail.jsx";
import FlowArt, { FlowSection } from "./components/ui/story-scroll.jsx";

const INTRO_TITLE = "接下来是关于我的信息.....👇";
const STUDENT_TITLE = "我是一名高二生";
const VIBE_TITLE = "vibe coding 大师";
const STUDIO_TITLE = "目标是致力于创办自己的工作室";

function VibeStoryScroll() {
  return (
    <FlowArt aria-label="about and vibe coding story scroll" className="vibe-story-scroll">
      <FlowSection id="about" aria-label="关于我的信息" className="vibe-story-section vibe-story-section-about vibe-story-section-light">
        <PixelTrail className="story-pixel-trail" pixelClassName="story-pixel-dot" />
        <h2 className="reveal-line story-intro-title" data-copy={INTRO_TITLE}>
          {INTRO_TITLE}
        </h2>
      </FlowSection>

      <FlowSection aria-label="我是一名高二生" className="vibe-story-section vibe-story-section-main vibe-story-section-dark vibe-story-section-srgb">
        <PixelTrail className="story-pixel-trail" pixelClassName="story-pixel-dot" />
        <div className="story-stack">
          <div className="story-title-wrap">
            <h2 className="story-title story-title-student mixed">{STUDENT_TITLE}</h2>
          </div>
        </div>
      </FlowSection>

      <FlowSection aria-label="vibe coding 大师" className="vibe-story-section vibe-story-section-main vibe-story-section-light">
        <PixelTrail className="story-pixel-trail" pixelClassName="story-pixel-dot" />
        <div className="story-stack">
          <div className="story-title-wrap">
            <h2 className="story-title story-title-vibe mixed">{VIBE_TITLE}</h2>
          </div>
        </div>
      </FlowSection>

      <FlowSection
        aria-label="HONESTLY 精通codex claude code等 coding agent"
        className="vibe-story-section vibe-story-section-honestly vibe-story-section-dark vibe-story-section-srgb"
      >
        <PixelTrail className="story-pixel-trail" pixelClassName="story-pixel-dot" />
        <div className="honestly-copy">
          <h2
            className="honestly-title mixed variable-proximity"
            aria-label="精通codex claude code等 coding agent"
          >
            <span className="honestly-line honestly-line-primary">精通codex</span>
            <span className="honestly-line honestly-line-secondary">claude code等 coding agent</span>
          </h2>
          <p className="honestly-note variable-proximity">虽然一定程度上还是小白（burh</p>
        </div>
      </FlowSection>

      <FlowSection aria-label="目标是致力于创办自己的工作室" className="vibe-story-section vibe-story-section-main vibe-story-section-light">
        <PixelTrail className="story-pixel-trail" pixelClassName="story-pixel-dot" />
        <div className="story-stack">
          <div className="story-title-wrap">
            <h2 className="story-title story-title-long mixed">{STUDIO_TITLE}</h2>
          </div>
        </div>
      </FlowSection>
    </FlowArt>
  );
}

let mounted = false;
let mountedRoot = null;

export function initStoryScrollMount() {
  if (mounted || typeof document === "undefined") {
    return () => {};
  }

  const root = document.querySelector("[data-story-scroll-root]");

  if (!root) {
    return () => {};
  }

  mounted = true;
  mountedRoot = createRoot(root);
  flushSync(() => {
    mountedRoot.render(<VibeStoryScroll />);
  });

  return () => {
    mountedRoot?.unmount();
    mountedRoot = null;
    mounted = false;
  };
}
