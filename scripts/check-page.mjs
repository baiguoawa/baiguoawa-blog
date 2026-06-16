import { existsSync, readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const css = readFileSync("src/styles.css", "utf8");
const js = readFileSync("src/main.js", "utf8");
const storyJs = readFileSync("src/story-scroll-mount.jsx", "utf8");
const storyComponent = readFileSync("src/components/ui/story-scroll.jsx", "utf8");
const waveComponent = readFileSync("src/components/ui/wave-background.jsx", "utf8");
const pixelTrailComponent = readFileSync("src/components/ui/pixel-trail.jsx", "utf8");
const nextHomePath = "src/features/home/HomePage.jsx";

if (!existsSync(nextHomePath)) {
  throw new Error("Missing migrated Next homepage component");
}

const nextHome = readFileSync(nextHomePath, "utf8");

const requiredStaticCopy = [
  "你好",
  "这里是白果awa的博客",
  "接下来是关于我的信息.....👇",
  "vibe coding 大师",
  "暂时还没有文章。",
];

const requiredStoryCopy = [
  "我是一名高二生",
  "精通codex",
  "claude code等 coding agent",
  "虽然一定程度上还是小白（burh",
  "目标是致力于创办自己的工作室",
];

for (const text of requiredStaticCopy) {
  if (!html.includes(text)) {
    throw new Error(`Missing required copy: ${text}`);
  }

  if (!nextHome.includes(text)) {
    throw new Error(`Migrated Next homepage missing required copy: ${text}`);
  }
}

for (const text of requiredStoryCopy) {
  if (!storyJs.includes(text)) {
    throw new Error(`Story scroll missing required copy: ${text}`);
  }
}

if (html.includes("section-kicker latin") || nextHome.includes("section-kicker latin") || storyJs.includes("section-kicker latin")) {
  throw new Error("Homepage story and section subtitles should be removed");
}

for (const token of ["data-story-scroll-root", "data-curved-loop-root", "three-d-marquee", "暂时还没有文章。"]) {
  if (!nextHome.includes(token)) {
    throw new Error(`Migrated Next homepage missing token: ${token}`);
  }
}

const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
const hashLinks = [...html.matchAll(/href="#([^"]*)"/g)].map((match) => match[1]);

for (const target of hashLinks) {
  if (!target) {
    throw new Error("Placeholder href=\"#\" is not allowed");
  }

  if (!ids.has(target)) {
    throw new Error(`Anchor target not found: #${target}`);
  }
}

const forbiddenCss = ["box-shadow", "text-shadow", "drop-shadow"];

for (const token of forbiddenCss) {
  if (css.includes(token)) {
    throw new Error(`Forbidden visual effect found in CSS: ${token}`);
  }
}

if (!css.includes("linear-gradient")) {
  throw new Error("Wave background needs gradient transitions between page sections");
}

const glassBlocks = [...css.matchAll(/\.cursor-glass(?:[^{}]|\{[^{}]*\})*\{[^{}]*\}/g)]
  .map((match) => match[0])
  .join("\n");

if (!glassBlocks.includes("backdrop-filter")) {
  throw new Error("Cursor glass effect must stay scoped to .cursor-glass");
}

if (!glassBlocks.includes('url("#cursor-liquid-filter")')) {
  throw new Error("Cursor glass must use the liquid-glass displacement filter");
}

const cssWithoutCursorGlass = css.replace(
  /\.cursor-glass(?:[^{}]|\{[^{}]*\})*\{[^{}]*\}/g,
  "",
);

if (cssWithoutCursorGlass.includes("backdrop-filter")) {
  throw new Error("backdrop-filter is only allowed in .cursor-glass");
}

if (!html.includes('<div class="cursor-glass" aria-hidden="true">')) {
  throw new Error("Missing cursor glass layer");
}

if (!html.includes("cursor-ring-inner")) {
  throw new Error("Cursor glass must use concentric ring markup");
}

if (!html.includes('class="text-flipping-board"') || !html.includes("data-board-text")) {
  throw new Error("Missing text flipping board hero");
}

if (!html.includes("magnetic-button")) {
  throw new Error("Buttons must opt into the magnetic button effect");
}

if (!css.includes("font-size: clamp(64px, 16vw, 208px)")) {
  throw new Error("Text flipping board should keep the statement scale");
}

if (!css.includes("font-size: clamp(54px, 19vw, 96px)")) {
  throw new Error("Text flipping board should keep the mobile statement scale");
}

if (html.includes("cursor-pointer-shape")) {
  throw new Error("Cursor hover shape should be the glass body, not an overlaid SVG icon");
}

if (!html.includes("cursor-pointer-outline")) {
  throw new Error("Interactive cursor needs a thin pointer outline");
}

if (!html.includes('id="cursor-liquid-filter"') || !html.includes('id="cursor-liquid-displacement"')) {
  throw new Error("Missing cursor liquid-glass SVG filter");
}

if (!html.includes('<div class="hero-code-field" aria-hidden="true"></div>')) {
  throw new Error("Missing hero code background field");
}

const footerStart = html.indexOf('<footer id="links" class="footer-links">');
const footerEnd = html.indexOf("</footer>", footerStart);
const articlesStart = html.indexOf('<section id="articles" class="content-section articles">');
const articlesEnd = html.indexOf("</section>", articlesStart);
const storyStart = html.indexOf('<section class="story-scroll-section"');
const storyEnd = articlesStart;
const staticHonestlyStart = html.indexOf('<section class="panel statement honestly-section"');

if (footerStart === -1 || footerEnd === -1) {
  throw new Error("Footer links section not found");
}

if (articlesStart === -1 || articlesEnd === -1) {
  throw new Error("Articles section not found");
}

if (storyStart === -1 || storyEnd === -1 || storyEnd <= storyStart) {
  throw new Error("Story scroll section not found");
}

if (!html.includes("data-story-scroll-root")) {
  throw new Error("Missing story scroll React mount root");
}

if (staticHonestlyStart !== -1 || nextHome.includes('className="panel statement honestly-section"')) {
  throw new Error("HONESTLY should be rendered inside the story scroll FlowSection, not as a static section");
}

const storyHtml = html.slice(storyStart, storyEnd);

if (html.includes("呵呵,其实就是随缘写代码") || storyJs.includes("呵呵,其实就是随缘写代码")) {
  throw new Error("Old HONESTLY copy should be replaced");
}

if (
  !storyJs.includes("vibe-story-section-honestly") ||
  !storyJs.includes("honestly-copy") ||
  !storyJs.includes("honestly-title") ||
  !storyJs.includes("honestly-note") ||
  !storyJs.includes("variable-proximity") ||
  !storyJs.includes("HONESTLY") ||
  !storyJs.includes("精通codex") ||
  !storyJs.includes("claude code等 coding agent") ||
  !storyJs.includes("虽然一定程度上还是小白（burh")
) {
  throw new Error("HONESTLY needs to render as a story scroll page with variable proximity copy");
}

if (
  !html.includes("Roboto+Flex:opsz,wght@8..144,100..1000") ||
  !css.includes(".variable-proximity-letter") ||
  !js.includes("function initVariableProximity") ||
  !js.includes("fontVariationSettings") ||
  !js.includes("pointermove")
) {
  throw new Error("HONESTLY section must use the ReactBits-style variable proximity text effect");
}

if (
  html.includes("data-lens-reveal") ||
  html.includes("lens-reveal") ||
  css.includes("lens-reveal") ||
  css.includes("is-lens-reveal") ||
  js.includes("lensReveal") ||
  js.includes("LensReveal") ||
  js.includes("is-lens-reveal")
) {
  throw new Error("Temporary HONESTLY lens reveal effect should be removed");
}

if (html.includes("svg-mask-effect") || html.includes("@aceternity") || html.includes("shadcn")) {
  throw new Error("Do not introduce Aceternity or shadcn SVG mask demo code");
}

if (
  !nextHome.includes("WaveBackground") ||
  !nextHome.includes('className="home-wave-background"') ||
  !html.includes("home-wave-background") ||
  !css.includes(".wave-background") ||
  !css.includes(".home-wave-background") ||
  !css.includes(".wave-background-line") ||
  !waveComponent.includes("createNoise2D") ||
  !waveComponent.includes("requestAnimationFrame") ||
  !waveComponent.includes("wave-background-line")
) {
  throw new Error("Homepage should include the 21st Wave Background-style animated wave layer");
}

if (
  !css.includes(".story-about-fallback::before") ||
  !css.includes(".story-scroll-section::before") ||
  !css.includes(".story-scroll-fallback::before") ||
  !css.includes(".content-section.articles::before") ||
  !css.includes(".footer-links::before") ||
  !css.includes("background: none") ||
  !css.includes("content: none")
) {
  throw new Error("About, vibe coding, articles, and footer pages should not use the section gradient overlays");
}

if (css.includes(".honestly-section::before") || css.includes(".honestly-section::after")) {
  throw new Error("Static HONESTLY section gradient styles should be removed");
}

if (!storyHtml.includes("vibe coding 大师")) {
  throw new Error("Story scroll fallback must keep the vibe coding copy");
}

if (
  !storyJs.includes("VibeStoryScroll") ||
  !storyJs.includes("FlowArt") ||
  !storyJs.includes("FlowSection") ||
  !storyJs.includes('id="about"') ||
  !storyJs.includes("vibe-story-section-about") ||
  !storyJs.includes('document.querySelector("[data-story-scroll-root]")') ||
  !storyJs.includes("initStoryScrollMount")
) {
  throw new Error("Story scroll mount should render FlowArt into the vibe section");
}

const oldStoryCopy = ["我是....", "接下来是自我介绍环节....👇", "一名高中生"];
const storySources = `${html}\n${nextHome}\n${storyJs}`;

for (const copy of oldStoryCopy) {
  if (storySources.includes(copy)) {
    throw new Error(`Old story copy should be removed: ${copy}`);
  }
}

const storyPageOrder = [
  "接下来是关于我的信息.....👇",
  "我是一名高二生",
  "vibe coding 大师",
  "HONESTLY",
  "目标是致力于创办自己的工作室",
];
const storyPageTokens = [
  'aria-label="关于我的信息"',
  'aria-label="我是一名高二生"',
  'aria-label="vibe coding 大师"',
  'aria-label="HONESTLY 精通codex claude code等 coding agent"',
  'aria-label="目标是致力于创办自己的工作室"',
];
const storyPagePositions = storyPageTokens.map((copy) => storyJs.indexOf(copy));

if (
  storyPageOrder.some((copy) => !storyJs.includes(copy)) ||
  storyPagePositions.some((position) => position === -1) ||
  storyJs.includes("感谢理解！")
) {
  throw new Error("Story scroll should include the intro, student, vibe coding, HONESTLY, and studio pages only");
}

if (!storyPagePositions.every((position, index) => index === 0 || position > storyPagePositions[index - 1])) {
  throw new Error("Story scroll pages should render in the expected intro, student, vibe coding, HONESTLY, studio order");
}

if (
  storyJs.includes("story-index") ||
  css.includes(".story-index") ||
  storyJs.includes("01 / STUDENT") ||
  storyJs.includes("02 / VIBE CODING") ||
  storyJs.includes("03 / STUDIO") ||
  storyJs.includes("04 / THANKS") ||
  storyJs.includes("01 / VIBE CODING") ||
  storyJs.includes("/ STUDENT") ||
  storyJs.includes("/ VIBE CODING") ||
  storyJs.includes("/ STUDIO") ||
  storyJs.includes("/ THANKS") ||
  !storyJs.includes("story-title-student") ||
  !storyJs.includes("story-title-vibe") ||
  storyJs.includes("story-title-thanks") ||
  storyJs.includes("story-stack story-stack-wide") ||
  (storyJs.match(/vibe-story-section-srgb/g) || []).length !== 2 ||
  !storyJs.includes("vibe-story-section-dark vibe-story-section-srgb") ||
  !storyJs.includes("vibe-story-section-honestly vibe-story-section-dark vibe-story-section-srgb") ||
  !storyJs.includes("vibe-story-section-light") ||
  !storyJs.includes("vibe-story-section-dark") ||
  !storyJs.includes("vibe-story-section-honestly") ||
  !css.includes(".story-title-student") ||
  !css.includes(".story-title-vibe") ||
  css.includes(".story-title-thanks") ||
  css.includes(".story-stack-wide") ||
  !css.includes(".story-title-long")
) {
  throw new Error("Story scroll pages should remove orange index subtitles and keep title styling");
}

if (
  !storyJs.includes('import { PixelTrail } from "./components/ui/pixel-trail.jsx"') ||
  (storyJs.match(/<PixelTrail className="story-pixel-trail" pixelClassName="story-pixel-dot" \/>/g) || []).length !== 5 ||
  !pixelTrailComponent.includes("export function PixelTrail") ||
  !pixelTrailComponent.includes("ResizeObserver") ||
  !pixelTrailComponent.includes("pointermove") ||
  !pixelTrailComponent.includes("pixel-trail-fade") ||
  pixelTrailComponent.includes("framer-motion") ||
  pixelTrailComponent.includes("uuid")
) {
  throw new Error("Story scroll pages should use the local PixelTrail effect without extra animation dependencies");
}

if (
  storyJs.includes("想法先落地") ||
  storyJs.includes("边跑边改") ||
  storyJs.includes("能用先上") ||
  storyJs.includes("story-divider") ||
  storyJs.includes("story-copy") ||
  storyJs.includes("buildPage") ||
  storyJs.includes("scroll.into") ||
  storyJs.includes("ship.whenReady")
) {
  throw new Error("Story scroll should only render the original vibe section without code-like filler");
}

if (
  !storyComponent.includes("useGSAP") ||
  !storyComponent.includes("ScrollTrigger.create") ||
  !storyComponent.includes("applyEdgeSquish") ||
  !storyComponent.includes("releaseEdgeSquish") ||
  !storyComponent.includes("releaseCall") ||
  !storyComponent.includes("scrub: true") ||
  !storyComponent.includes("anticipatePin: 1") ||
  storyComponent.includes("pinPreviousSelector") ||
  storyComponent.includes("sections.length === 1") ||
  !storyComponent.includes("pinSpacing: false") ||
  !storyComponent.includes('start: "top bottom"') ||
  !storyComponent.includes('end: "top 25%"') ||
  !storyComponent.includes("rotation: 30") ||
  !storyComponent.includes('"--story-page-alpha": 0.64') ||
  !storyComponent.includes('"--story-page-alpha": 1') ||
  !storyComponent.includes('"--story-page-radius": "44px"') ||
  !storyComponent.includes('"--story-page-radius": "0px"')
) {
  throw new Error("Story scroll component should rotate the following page, fade its paper solid, and square its rounded edge by the end");
}

if (
  !css.includes(".story-scroll-section") ||
  !css.includes(".story-scroll-fallback") ||
  !css.includes(".vibe-story-section") ||
  !css.includes(".vibe-story-section-about") ||
  !css.includes(".vibe-story-section-light") ||
  !css.includes(".vibe-story-section-dark") ||
  !css.includes(".vibe-story-section-srgb") ||
  !css.includes(".vibe-story-section-honestly") ||
  !css.includes(".vibe-story-scroll") ||
  !css.includes(".flow-art-content") ||
  !css.includes(".vibe-story-scroll [data-flow-section]") ||
  !css.includes(".vibe-story-scroll [data-flow-inner]") ||
  !css.includes(".pixel-trail") ||
  !css.includes(".pixel-trail-dot") ||
  !css.includes("@keyframes pixel-trail-fade") ||
  !css.includes("--pixel-trail-color") ||
  !css.includes("--pixel-trail-color: rgb(182 95 40 / 0.42)") ||
  css.includes("--pixel-trail-color: rgb(23 19 15") ||
  !css.includes(".story-stack") ||
  !css.includes(".story-intro-title") ||
  !css.includes("min-height: 100dvh") ||
  !css.includes("font-size: clamp(108px, 19.7vw, 320px)") ||
  !css.includes("font-size: clamp(96px, 13.8vw, 204px)") ||
  !css.includes("font-size: clamp(96px, 14.35vw, 212px)") ||
  !css.includes("font-size: clamp(70px, 11.08vw, 174px)") ||
  !css.includes("font-size: clamp(120px, 19.16vw, 283px)") ||
  !css.includes("font-size: clamp(96px, 14.96vw, 221px)") ||
  !css.includes("--story-page-alpha: 1") ||
  !css.includes("--story-dark-rgb: 66 61 56") ||
  !css.includes("--story-page-bg-rgb: 228 210 184") ||
  !css.includes("--story-page-radius: 0px") ||
  !css.includes("border-radius: var(--story-page-radius, 0px)") ||
  !css.includes("background: rgb(var(--story-page-bg-rgb) / var(--story-page-alpha, 1))") ||
  !css.includes("color: var(--story-page-accent, var(--orange))") ||
  !css.includes("--story-page-fg: var(--paper)") ||
  !css.includes("color: var(--story-page-fg)")
) {
  throw new Error("Story scroll section needs CSS for the vibe panel");
}

if (css.includes(".story-divider")) {
  throw new Error("Story scroll section should not render divider lines");
}

const footerHtml = html.slice(footerStart, footerEnd);
const articlesHtml = html.slice(articlesStart, articlesEnd);

if (!footerHtml.includes('<div class="footer-fluid" aria-hidden="true">')) {
  throw new Error("Missing footer fluid layer inside #links");
}

if (footerHtml.includes("cli-easter-egg") || footerHtml.includes("claude-code / baiguo-blog")) {
  throw new Error("Claude Code CLI easter egg should be removed from #links");
}

if (footerHtml.includes("three-d-marquee") || footerHtml.includes("marquee-plane")) {
  throw new Error("3D marquee should live under #articles, not inside #links");
}

if (!articlesHtml.includes("three-d-marquee") || !articlesHtml.includes("marquee-plane")) {
  throw new Error("Missing 3D marquee under #articles");
}

if (
  !js.includes('trigger: line') ||
  !js.includes('start: "top 86%"') ||
  !js.includes('end: "top 48%"') ||
  !js.includes("scrub: 0.7")
) {
  throw new Error("Reveal text should stay bound to scroll progress and reverse while scrolling upward");
}

if (!js.includes("initNavController") || !js.includes("navHoveredTop") || !js.includes("event.clientY <= 24") || !js.includes("onLeaveBack")) {
  throw new Error("Navigation should reveal from the top edge on the home screen and still follow scroll state");
}

if (!js.includes("initHeroCodeField") || js.includes("initCliEasterEgg")) {
  throw new Error("Hero code should remain and CLI initializer should be removed");
}

if (!js.includes("initTextFlippingBoards") || !js.includes("createBoardTile")) {
  throw new Error("Missing text flipping board initializer");
}

if (
  !js.includes("const startSectionAnimation = () => {") ||
  !js.includes('start: "top bottom"') ||
  !js.includes('end: "bottom top"') ||
  !js.includes("onEnter: startSectionAnimation") ||
  !js.includes("onLeaveBack: resetSectionPass") ||
  !js.includes("requestAnimationFrame(() => {") ||
  !js.includes("sectionRect.top < window.innerHeight && sectionRect.bottom > 0") ||
  js.includes("once: true")
) {
  throw new Error("Text flipping board should start when any part of the blog section enters view");
}

if (
  !js.includes('const boardSection = board.closest(".panel") || board;') ||
  !js.includes("let hasStartedSectionPass = false;") ||
  !js.includes("let hasLockedSectionPass = false;") ||
  !js.includes("let isSectionAnimationComplete = false;") ||
  !js.includes("let isSectionAnimationRunning = false;") ||
  !js.includes("let sectionAnimationReleaseAt = 0;") ||
  !js.includes("trigger: boardSection") ||
  !js.includes('start: "top top"') ||
  !js.includes('end: "bottom top"') ||
  !js.includes("onEnter: lockUntilSectionAnimationDone") ||
  !js.includes("hasStartedSectionPass = true;") ||
  !js.includes("hasLockedSectionPass = false;") ||
  !js.includes("const lockTargetY = Math.ceil(window.scrollY + boardSection.getBoundingClientRect().top) + 1;") ||
  !js.includes("const remainingMs = Math.max(0, sectionAnimationReleaseAt - Date.now()) + 80;") ||
  !js.includes("lockBoardDownwardScroll(remainingMs, lockTargetY);")
) {
  throw new Error("Text flipping board should only hold downward scrolling at the full blog section when animation is still running");
}

if (
  !js.includes("function getBoardScrollLockState()") ||
  !js.includes('addHomeListener(window, "scroll", clampDownwardScroll, { passive: true })') ||
  !js.includes('"wheel"') ||
  !js.includes('"touchmove"') ||
  !js.includes('event.deltaY <= 0') ||
  !js.includes('state.touchStartY - currentY <= 0') ||
  !js.includes('event.key === "ArrowDown"') ||
  !js.includes("lockBoardDownwardScroll") ||
  !js.includes("function releaseBoardDownwardScroll()") ||
  !js.includes("releaseBoardDownwardScroll();") ||
  !js.includes("releaseAt: 0") ||
  !js.includes("const maybeReleaseExpiredLock = () => {") ||
  !js.includes("Date.now() < state.releaseAt") ||
  !js.includes("state.releaseAt = Date.now() + Math.max(0, durationMs);") ||
  !js.includes("state.lock = (durationMs, lockTargetY = window.scrollY) => {") ||
  !js.includes('window.scrollTo({ top: targetY, behavior: "auto" });') ||
  !js.includes('longestTimeline?.eventCallback("onComplete", finish);')
) {
  throw new Error("Text flipping board should hold only downward scrolling until the flip animation finishes");
}

if (!js.includes("initMagneticButtons") || !js.includes("xTo(0)") || !js.includes("yTo(0)")) {
  throw new Error("Missing magnetic button interaction");
}

if (!js.includes('document.querySelectorAll(".magnetic-button")')) {
  throw new Error("Magnetic effect should target every magnetic button");
}

if (!js.includes("const streamCount = isMobile ? 44 : 24")) {
  throw new Error("Hero code background should densely cover the full first screen");
}

if (!js.includes("mobileHeroCode") || !js.includes("mobileHeroCodeLines") || !js.includes("field.classList.toggle(\"is-mobile-code\"")) {
  throw new Error("Hero code background needs a separate mobile renderer");
}

if (!js.includes("mobile-code-token") || !js.includes('type: "tokens"') || !js.includes("item.x = maxRight + animation.gap")) {
  throw new Error("Mobile hero code should recycle off-screen tokens from the right without visible modulo jumps");
}

if (!js.includes("getBoundingClientRect().right >= -120") || !js.includes("window.innerWidth + 140")) {
  throw new Error("Mobile hero code should only recycle tokens after they are visually off-screen");
}

if (!js.includes("code-track") || !js.includes("cycleWidth") || !js.includes("gsap.ticker.add")) {
  throw new Error("Hero code background should use ticker-based seamless infinite looping");
}

if (!js.includes("const speed = 31 + (index % 8) * 2.2")) {
  throw new Error("Desktop hero code speed should stay slower and controlled");
}

if (!css.includes(".code-track")) {
  throw new Error("Hero code background must style duplicated marquee tracks");
}

if (!css.includes(".hero-code-field.is-mobile-code") || !css.includes(".mobile-code-stream") || !css.includes(".mobile-code-token")) {
  throw new Error("Mobile hero code background must have its own CSS");
}

if (!css.includes(".footer-links ul") || !css.includes("width: fit-content") || !css.includes("margin-top: clamp(32px, 5vw, 58px)") || !css.includes("padding: 0")) {
  throw new Error("Footer link list hit area should stay tight around the buttons");
}

if (!css.includes(".three-d-marquee") || !css.includes("rotateX(58deg)") || !css.includes("marquee-drift-up")) {
  throw new Error("Articles section should include the styled 3D marquee");
}

if (!css.includes("--cursor-circle-path") || !css.includes("--cursor-pointer-path")) {
  throw new Error("Cursor must define compatible paths for a smooth morph");
}

if (
  !js.includes("cursorFluidGlassMaterial") ||
  !js.includes("scale: 0.05") ||
  !js.includes("ior: 1.15") ||
  !js.includes("thickness: 5") ||
  !css.includes("--fluid-glass-scale: 0.05") ||
  !css.includes("--fluid-glass-ior: 1.15")
) {
  throw new Error("Cursor should use the React Bits FluidGlass lens parameters");
}

if (
  !css.includes(".honestly-copy") ||
  !css.includes(".honestly-title") ||
  !css.includes(".honestly-note") ||
  !css.includes("width: min(100%, 80vw, 1040px)") ||
  !css.includes("font-size: clamp(50px, 5.95vw, 72px)") ||
  !css.includes(".honestly-line") ||
  !css.includes("font-size: 1.735em") ||
  !css.includes("font-size: clamp(17px, 1.9vw, 28px)")
) {
  throw new Error("Missing static HONESTLY copy styles");
}

if (!css.includes("clip-path: var(--cursor-pointer-path)")) {
  throw new Error("Interactive cursor must morph the glass body into the pointer shape");
}

if (!js.includes("const getCursorOffset = () =>") || !js.includes("x: 36 * (1 - scale) + 21 * scale")) {
  throw new Error("Interactive cursor tip should align to the pointer coordinate");
}

if (!js.includes("scaleCursor(overAction ? 0.9 : 1)") && !js.includes("scaleCursor(0.9)")) {
  throw new Error("Interactive cursor should be smaller than the normal circle");
}

if (!js.includes("document.elementFromPoint") || !js.includes("queueInteractiveRelease") || !js.includes("closestInteractive")) {
  throw new Error("Interactive cursor should stay smooth across button gaps");
}

if (css.includes(".code-stream:nth-child(n + 13)")) {
  throw new Error("Mobile hero code background should not hide half the code field");
}

console.log("Page checks passed");
