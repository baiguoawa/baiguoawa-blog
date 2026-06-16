import { initCurvedLoopMount } from "./curved-loop-mount.jsx";
import { initStoryScrollMount } from "./story-scroll-mount.jsx";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let reduceMotion;
let lines;
let nav;
let articlesTitle;
let canHover;
let mobileHeroCode;
let initialized = false;
let activeAbortController = null;
let homeCleanupCallbacks = [];
const interactiveSelector = "a, button, .button, .nav-links, .footer-links ul";
const draggableSelector = '[draggable="true"], [data-draggable], .draggable, [aria-grabbed]';
const cursorFluidGlassMaterial = {
  scale: 0.05,
  ior: 1.15,
  thickness: 5,
  chromaticAberration: 0.1,
  anisotropy: 0.01,
};
const boardGlyphs = Array.from("欢迎来到白果的博客awa0123456789{}<>/");
const variableProximityTargets = [
  {
    selector: ".honestly-title",
    radius: 140,
    fromFontVariationSettings: "'wght' 660, 'opsz' 9",
    toFontVariationSettings: "'wght' 1000, 'opsz' 40",
  },
  {
    selector: ".honestly-note",
    radius: 110,
    fromFontVariationSettings: "'wght' 620, 'opsz' 9",
    toFontVariationSettings: "'wght' 1000, 'opsz' 40",
  },
];
const heroCodeLines = [
  "const blog = createPage({ owner: '白果awa', mood: 'beige' });",
  "gsap.to('.hero-code-field', { x: 120, y: -36, ease: 'none' });",
  "$ claude code --project baiguo-blog",
  "npm run dev -- --host 127.0.0.1",
  "ScrollTrigger.refresh();",
  "<section id=\"home\" class=\"panel hero\">你好</section>",
  "git status --short",
  "write blog --mode 随缘 --tone calm",
  "font-family: PingFang SC, Lora, serif;",
  "cursor: liquidGlass({ shape: 'concentric' });",
  "const vibe = Math.random() > 0.5 ? 'coding' : '喝水';",
  "deploy? later. polish? now.",
];
const mobileHeroCodeLines = [
  "baiguo.blog()",
  "claude code",
  "npm run dev",
  "gsap.timeline()",
  "scroll reveal",
  "cursor.glass",
  "vibe = '随缘'",
  "PingFang + Lora",
  "git status",
  "write blog()",
  "awa.render()",
  "ScrollTrigger",
];

let heroCodeAnimations = [];
let heroCodeTicker = null;
let heroCodeResizeTimer = 0;
let boardScrollLockState = null;

function addHomeListener(target, type, listener, options = {}) {
  if (!target || !activeAbortController) {
    return;
  }

  target.addEventListener(type, listener, {
    ...options,
    signal: activeAbortController.signal,
  });
}

function registerHomeCleanup(cleanup) {
  homeCleanupCallbacks.push(cleanup);
}

function createBoardTile(char, index) {
  const tile = document.createElement("span");
  const value = document.createElement("span");

  tile.className = /^[A-Za-z0-9]$/.test(char) ? "flip-tile flip-tile-latin" : "flip-tile";
  tile.dataset.finalChar = char;
  tile.dataset.tileIndex = String(index);
  tile.setAttribute("aria-hidden", "true");

  value.className = "flip-char";
  value.textContent = boardGlyphs[(index * 7 + char.codePointAt(0)) % boardGlyphs.length] || char;
  tile.appendChild(value);

  return { tile, value, char };
}

function getBoardScrollLockState() {
  if (boardScrollLockState) {
    return boardScrollLockState;
  }

  const state = {
    active: false,
    maxY: 0,
    releaseAt: 0,
    releaseTimer: 0,
    touchStartY: 0,
  };

  const release = () => {
    state.active = false;
    state.releaseAt = 0;
    window.clearTimeout(state.releaseTimer);
    state.releaseTimer = 0;
  };

  const maybeReleaseExpiredLock = () => {
    if (!state.active || state.releaseAt <= 0 || Date.now() < state.releaseAt) {
      return;
    }

    release();
  };

  const clampDownwardScroll = () => {
    maybeReleaseExpiredLock();

    if (!state.active || window.scrollY <= state.maxY + 1) {
      return;
    }

    window.scrollTo({ top: state.maxY, behavior: "auto" });
  };

  addHomeListener(
    window,
    "wheel",
    (event) => {
      if (event.deltaY <= 0) {
        return;
      }

      maybeReleaseExpiredLock();

      if (!state.active) {
        return;
      }

      event.preventDefault();
      clampDownwardScroll();
    },
    { passive: false },
  );

  addHomeListener(window, "scroll", clampDownwardScroll, { passive: true });

  addHomeListener(
    window,
    "touchstart",
    (event) => {
      state.touchStartY = event.touches[0]?.clientY ?? 0;
    },
    { passive: true },
  );

  addHomeListener(
    window,
    "touchmove",
    (event) => {
      const currentY = event.touches[0]?.clientY ?? state.touchStartY;

      if (state.touchStartY - currentY <= 0) {
        return;
      }

      maybeReleaseExpiredLock();

      if (!state.active) {
        return;
      }

      event.preventDefault();
      clampDownwardScroll();
    },
    { passive: false },
  );

  addHomeListener(window, "keydown", (event) => {
    const isSpaceDown = (event.key === " " || event.code === "Space") && !event.shiftKey;
    const isDownwardKey = event.key === "ArrowDown" || event.key === "PageDown" || event.key === "End" || isSpaceDown;

    if (!isDownwardKey) {
      return;
    }

    maybeReleaseExpiredLock();

    if (!state.active) {
      return;
    }

    event.preventDefault();
    clampDownwardScroll();
  });

  state.lock = (durationMs, lockTargetY = window.scrollY) => {
    release();
    state.active = true;
    state.maxY = Math.max(0, Math.round(lockTargetY));
    state.releaseAt = Date.now() + Math.max(0, durationMs);
    clampDownwardScroll();
    state.releaseTimer = window.setTimeout(release, Math.max(0, durationMs));
  };

  state.release = release;
  boardScrollLockState = state;

  registerHomeCleanup(() => {
    release();
    boardScrollLockState = null;
  });

  return state;
}

function lockBoardDownwardScroll(durationMs, lockTargetY = window.scrollY) {
  if (!durationMs || durationMs <= 0) {
    return;
  }

  const targetY = Math.max(0, Math.round(lockTargetY));
  window.scrollTo({ top: targetY, behavior: "auto" });
  getBoardScrollLockState().lock(durationMs, targetY);
}

function releaseBoardDownwardScroll() {
  boardScrollLockState?.release();
}

function renderTextFlippingBoard(board, animate = true) {
  const text = board.dataset.boardText || board.textContent.trim();
  const tokens = text.match(/[A-Za-z0-9]+|\s+|./gu) || [];
  const tiles = [];
  let tileIndex = 0;

  board.textContent = "";
  board.setAttribute("aria-label", text);

  tokens.forEach((token) => {
    if (/^\s+$/u.test(token)) {
      const space = document.createElement("span");
      space.className = "flip-space";
      space.setAttribute("aria-hidden", "true");
      board.appendChild(space);
      return;
    }

    if (/^[A-Za-z0-9]+$/.test(token)) {
      const word = document.createElement("span");
      word.className = "flip-word latin-word";

      Array.from(token).forEach((char) => {
        const tile = createBoardTile(char, tileIndex);
        word.appendChild(tile.tile);
        tiles.push(tile);
        tileIndex += 1;
      });

      board.appendChild(word);
      return;
    }

    const tile = createBoardTile(token, tileIndex);
    board.appendChild(tile.tile);
    tiles.push(tile);
    tileIndex += 1;
  });

  if (!animate) {
    tiles.forEach(({ tile, value, char }) => {
      value.textContent = char;
      gsap.set(tile, { autoAlpha: 1, y: 0 });
      gsap.set(value, { rotateX: 0, y: 0 });
    });
    return;
  }

  const getInitialGlyph = (char, index) => {
    return boardGlyphs[(index * 7 + char.codePointAt(0)) % boardGlyphs.length] || char;
  };

  let boardTimelines = [];

  const resetBoard = () => {
    releaseBoardDownwardScroll();
    boardTimelines.forEach((timeline) => timeline.kill());
    boardTimelines = [];

    tiles.forEach(({ tile, value, char }, index) => {
      value.textContent = getInitialGlyph(char, index);
      gsap.set(tile, { autoAlpha: 0, y: 10 });
      gsap.set(value, { rotateX: 0, y: 0 });
    });
  };

  const play = ({ lockDownwardScroll = false, lockTargetY = window.scrollY, onComplete } = {}) => {
    resetBoard();
    let longestDuration = 0;
    let longestTimeline = null;

    tiles.forEach(({ tile, value, char }, index) => {
      const steps = Array.from({ length: 2 + (index % 3) }, (_, stepIndex) => {
        return boardGlyphs[(index * 11 + stepIndex * 5) % boardGlyphs.length] || char;
      });

      steps.push(char);

      const timeline = gsap.timeline({ delay: 0.14 + index * 0.045 });
      boardTimelines.push(timeline);

      timeline.to(tile, {
        autoAlpha: 1,
        y: 0,
        duration: 0.16,
        ease: "power2.out",
      });

      steps.forEach((step) => {
        timeline
          .to(value, {
            rotateX: -88,
            y: -2,
            duration: 0.055,
            ease: "power2.in",
          })
          .call(() => {
            value.textContent = step;
            gsap.set(value, { rotateX: 86, y: 2 });
          })
          .to(value, {
            rotateX: 0,
            y: 0,
            duration: 0.075,
            ease: "power2.out",
          });
      });

      if (timeline.totalDuration() > longestDuration) {
        longestDuration = timeline.totalDuration();
        longestTimeline = timeline;
      }
    });

    if (lockDownwardScroll) {
      lockBoardDownwardScroll(Math.ceil(longestDuration * 1000) + 40, lockTargetY);
    }

    const finish = () => {
      onComplete?.();

      if (lockDownwardScroll) {
        releaseBoardDownwardScroll();
      }
    };

    longestTimeline?.eventCallback("onComplete", finish);
    return Math.ceil(longestDuration * 1000) + 40;
  };

  if (board.closest(".hero")) {
    play();
    return;
  }

  resetBoard();

  const boardSection = board.closest(".panel") || board;
  let hasStartedSectionPass = false;
  let hasLockedSectionPass = false;
  let isSectionAnimationComplete = false;
  let isSectionAnimationRunning = false;
  let sectionAnimationReleaseAt = 0;

  const finishSectionAnimation = () => {
    isSectionAnimationComplete = true;
    isSectionAnimationRunning = false;
    releaseBoardDownwardScroll();
  };

  const startSectionAnimation = () => {
    if (hasStartedSectionPass) {
      return;
    }

    hasStartedSectionPass = true;
    hasLockedSectionPass = false;
    isSectionAnimationComplete = false;
    isSectionAnimationRunning = true;

    const durationMs = play({ onComplete: finishSectionAnimation });
    sectionAnimationReleaseAt = Date.now() + durationMs;
  };

  const resetSectionPass = () => {
    hasStartedSectionPass = false;
    hasLockedSectionPass = false;
    isSectionAnimationComplete = false;
    isSectionAnimationRunning = false;
    sectionAnimationReleaseAt = 0;
    resetBoard();
  };

  const lockUntilSectionAnimationDone = () => {
    if (!hasStartedSectionPass) {
      startSectionAnimation();
    }

    if (hasLockedSectionPass || isSectionAnimationComplete || !isSectionAnimationRunning) {
      return;
    }

    hasLockedSectionPass = true;
    const lockTargetY = Math.ceil(window.scrollY + boardSection.getBoundingClientRect().top) + 1;
    const remainingMs = Math.max(0, sectionAnimationReleaseAt - Date.now()) + 80;
    lockBoardDownwardScroll(remainingMs, lockTargetY);
  };

  ScrollTrigger.create({
    trigger: boardSection,
    start: "top bottom",
    end: "bottom top",
    onEnter: startSectionAnimation,
    onLeaveBack: resetSectionPass,
  });

  ScrollTrigger.create({
    trigger: boardSection,
    start: "top top",
    end: "bottom top",
    onEnter: lockUntilSectionAnimationDone,
  });

  requestAnimationFrame(() => {
    const sectionRect = boardSection.getBoundingClientRect();

    if (sectionRect.top < window.innerHeight && sectionRect.bottom > 0) {
      startSectionAnimation();
    }
  });
}

function initTextFlippingBoards(animate = true) {
  document.querySelectorAll("[data-board-text]").forEach((board) => {
    renderTextFlippingBoard(board, animate);
  });
}

function wrapChars(line) {
  const text = line.dataset.copy || line.textContent.trim();
  line.textContent = "";

  const tokens = text.match(/[A-Za-z0-9]+|./gu) || [];

  tokens.forEach((token) => {
    if (/^[A-Za-z0-9]+$/.test(token)) {
      const word = document.createElement("span");
      word.className = "word latin-word";

      Array.from(token).forEach((char) => {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = char;
        word.appendChild(span);
      });

      line.appendChild(word);
      return;
    }

    const span = document.createElement("span");
    span.className = "char";
    span.textContent = token === " " ? "\u00a0" : token;
    line.appendChild(span);
  });
}

function parseFontVariationSettings(settings) {
  return new Map(
    settings
      .split(",")
      .map((setting) => setting.trim())
      .map((setting) => {
        const [name, value] = setting.split(" ");
        return [name.replace(/['"]/g, ""), Number.parseFloat(value)];
      }),
  );
}

function getFalloff(distance, radius) {
  return clamp(1 - distance / radius, 0, 1);
}

function getVariableFontValue(settings, axis) {
  return parseFontVariationSettings(settings).get(axis) || 400;
}

function wrapVariableProximityText(element) {
  const source = element.dataset.proximityLabel || element.getAttribute("aria-label") || element.textContent.trim();
  const lineElements = element.matches(".honestly-title")
    ? Array.from(element.querySelectorAll(".honestly-line"))
    : [element];
  const letters = [];
  const appendLetter = (container, letter) => {
    const span = document.createElement("span");

    span.className = "variable-proximity-letter";
    span.textContent = letter;
    span.setAttribute("aria-hidden", "true");
    container.appendChild(span);
    letters.push(span);
  };

  element.dataset.proximityLabel = source;
  element.setAttribute("aria-label", source);

  lineElements.forEach((lineElement) => {
    const text = lineElement.textContent;
    const tokens = text.match(/（?[A-Za-z0-9()]+|\s+|./gu) || [];

    lineElement.textContent = "";

    tokens.forEach((token) => {
      if (/^\s+$/u.test(token)) {
        lineElement.appendChild(document.createTextNode(" "));
        return;
      }

      if (/^（?[A-Za-z0-9()]+$/u.test(token)) {
        const word = document.createElement("span");

        word.className = "variable-proximity-word";
        lineElement.appendChild(word);
        Array.from(token).forEach((letter) => appendLetter(word, letter));
        return;
      }

      appendLetter(lineElement, token);
    });
  });

  return letters;
}

function initVariableProximity(animate = true) {
  const instances = variableProximityTargets
    .map(({ selector, radius, fromFontVariationSettings, toFontVariationSettings }) => {
      const element = document.querySelector(selector);

      if (!element) {
        return null;
      }

      const letters = wrapVariableProximityText(element);
      const fromSettings = parseFontVariationSettings(fromFontVariationSettings);
      const toSettings = parseFontVariationSettings(toFontVariationSettings);
      const fromWeight = getVariableFontValue(fromFontVariationSettings, "wght");

      letters.forEach((letter) => {
        letter.style.fontVariationSettings = fromFontVariationSettings;
        letter.style.fontWeight = String(fromWeight);
      });

      return { element, letters, radius, fromFontVariationSettings, fromSettings, toSettings };
    })
    .filter(Boolean);

  if (!animate || !instances.length) {
    return;
  }

  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let previousX = null;
  let previousY = null;
  let frame = 0;

  const syncPointer = (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;

    if (!frame) {
      frame = window.requestAnimationFrame(updateLetters);
    }
  };

  const updateLetters = () => {
    frame = 0;

    if (previousX === pointerX && previousY === pointerY) {
      return;
    }

    previousX = pointerX;
    previousY = pointerY;

    instances.forEach(({ element, letters, radius, fromFontVariationSettings, fromSettings, toSettings }) => {
      const elementRect = element.getBoundingClientRect();
      const relativeX = pointerX - elementRect.left;
      const relativeY = pointerY - elementRect.top;

      letters.forEach((letter) => {
        const rect = letter.getBoundingClientRect();
        const letterX = rect.left + rect.width / 2 - elementRect.left;
        const letterY = rect.top + rect.height / 2 - elementRect.top;
        const distance = Math.sqrt((letterX - relativeX) ** 2 + (letterY - relativeY) ** 2);

        if (distance >= radius) {
          letter.style.fontVariationSettings = fromFontVariationSettings;
          letter.style.fontWeight = String(fromSettings.get("wght") || 400);
          return;
        }

        const falloff = getFalloff(distance, radius);
        const settings = Array.from(fromSettings.entries())
          .map(([axis, fromValue]) => {
            const toValue = toSettings.get(axis) ?? fromValue;
            const value = fromValue + (toValue - fromValue) * falloff;
            return `'${axis}' ${value}`;
          })
          .join(", ");
        const weight = fromSettings.get("wght") + ((toSettings.get("wght") || 1000) - fromSettings.get("wght")) * falloff;

        letter.style.fontVariationSettings = settings;
        letter.style.fontWeight = String(Math.round(weight));
      });
    });
  };

  addHomeListener(window, "pointermove", syncPointer, { passive: true });
}

function setReducedMotion() {
  gsap.set(".char", { autoAlpha: 1, filter: "blur(0px)", y: 0 });
  gsap.set(articlesTitle, { scale: 1, y: 0 });
  initNavController(false);
}

function initNavController(animated = true) {
  const isPastNavRevealPoint = () => {
    const blog = document.querySelector("#blog");
    return blog ? blog.getBoundingClientRect().top <= window.innerHeight * 0.7 : false;
  };

  let navPinnedByScroll = isPastNavRevealPoint();
  let navHoveredTop = false;
  let hideTimer = 0;

  const renderNav = () => {
    const visible = navPinnedByScroll || navHoveredTop;
    const props = {
      autoAlpha: visible ? 1 : 0,
      y: visible ? 0 : -16,
    };

    if (!animated) {
      gsap.set(nav, props);
      return;
    }

    gsap.to(nav, {
      ...props,
      duration: visible ? 0.28 : 0.22,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const setNavPinnedByScroll = (enabled) => {
    if (navPinnedByScroll === enabled) {
      return;
    }

    navPinnedByScroll = enabled;
    renderNav();
  };

  const setNavHoveredTop = (enabled) => {
    window.clearTimeout(hideTimer);

    if (navHoveredTop === enabled) {
      return;
    }

    navHoveredTop = enabled;
    renderNav();
  };

  const queueTopHide = () => {
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => setNavHoveredTop(false), 140);
  };

  const syncNavScrollState = () => {
    setNavPinnedByScroll(isPastNavRevealPoint());
  };

  gsap.set(nav, {
    autoAlpha: navPinnedByScroll ? 1 : 0,
    y: navPinnedByScroll ? 0 : -16,
  });

  if (animated) {
    ScrollTrigger.create({
      trigger: "#blog",
      start: "top 70%",
      onEnter: () => setNavPinnedByScroll(true),
      onLeaveBack: () => setNavPinnedByScroll(false),
      onRefresh: syncNavScrollState,
    });
  }

  addHomeListener(window, "scroll", syncNavScrollState, { passive: true });

  if (canHover.matches) {
    addHomeListener(
      window,
      "pointermove",
      (event) => {
        if (event.clientY <= 24) {
          setNavHoveredTop(true);
          return;
        }

        if (!navHoveredTop || navPinnedByScroll) {
          return;
        }

        if (event.clientY > nav.getBoundingClientRect().bottom + 10) {
          queueTopHide();
        }
      },
      { passive: true },
    );

    addHomeListener(nav, "pointerenter", () => setNavHoveredTop(true));
    addHomeListener(nav, "pointerleave", queueTopHide);
  }

  registerHomeCleanup(() => window.clearTimeout(hideTimer));
}

function initMotion() {
  initNavController();

  lines.forEach((line, index) => {
    const chars = line.querySelectorAll(".char");

    gsap.set(chars, {
      autoAlpha: index === 0 ? 1 : 0,
      filter: index === 0 ? "blur(0px)" : "blur(18px)",
      y: index === 0 ? 0 : 14,
    });

    if (index === 0) {
      gsap.from(chars, {
        autoAlpha: 0,
        filter: "blur(14px)",
        y: 12,
        duration: 0.9,
        ease: "power3.out",
        stagger: { amount: 0.16, from: "start" },
      });
      return;
    }

    gsap.fromTo(
      chars,
      {
        autoAlpha: 0,
        filter: "blur(18px)",
        y: 14,
      },
      {
        autoAlpha: 1,
        filter: "blur(0px)",
        y: 0,
        ease: "none",
        stagger: { amount: Math.min(chars.length * 0.025, 0.34), from: "start" },
        scrollTrigger: {
          trigger: line,
          start: "top 86%",
          end: "top 48%",
          scrub: 0.7,
        },
      },
    );
  });

  gsap.fromTo(
    articlesTitle,
    { scale: 1.48, y: 16 },
    {
      scale: 1,
      y: 0,
      ease: "none",
      scrollTrigger: {
        trigger: "#articles",
        start: "top 86%",
        end: "top 24%",
        scrub: 0.7,
      },
    },
  );
}

function initHeroCodeField(animate = true) {
  const field = document.querySelector(".hero-code-field");

  if (!field) {
    return;
  }

  const render = () => {
    if (heroCodeTicker) {
      gsap.ticker.remove(heroCodeTicker);
      heroCodeTicker = null;
    }

    heroCodeAnimations = [];

    const isMobile = mobileHeroCode.matches;
    const sourceLines = isMobile ? mobileHeroCodeLines : heroCodeLines;
    const streamCount = isMobile ? 44 : 24;

    field.classList.toggle("is-mobile-code", isMobile);
    field.classList.toggle("is-desktop-code", !isMobile);

    const fragments = Array.from({ length: streamCount }, (_, streamIndex) => {
      const stream = document.createElement("div");
      stream.className = isMobile ? "code-stream mobile-code-stream" : "code-stream";
      stream.style.setProperty(
        "--stream-top",
        isMobile ? `${-36 + streamIndex * 2.15}%` : `${-16 + streamIndex * 5.8}%`,
      );
      stream.style.setProperty(
        "--stream-left",
        isMobile ? `${-18 + (streamIndex % 6) * 14}%` : `${-42 - (streamIndex % 4) * 12}%`,
      );
      stream.style.setProperty(
        "--stream-opacity",
        String(isMobile ? 0.18 + (streamIndex % 8) * 0.022 : 0.26 + (streamIndex % 5) * 0.035),
      );
      stream.style.setProperty(
        "--stream-size",
        isMobile ? `${0.82 + (streamIndex % 4) * 0.035}em` : `${0.9 + (streamIndex % 4) * 0.05}em`,
      );

      if (streamIndex % 5 === 2) {
        stream.classList.add("code-stream-accent");
      }

      if (isMobile) {
        Array.from({ length: 12 }).forEach((_, lineIndex) => {
          const token = document.createElement("span");
          token.className = "code-line mobile-code-token";
          token.textContent = sourceLines[(lineIndex + streamIndex * 3) % sourceLines.length];
          stream.appendChild(token);
        });

        return stream;
      }

      const createTrack = () => {
        const track = document.createElement("span");
        track.className = "code-track";

        Array.from({ length: 8 }).forEach((_, lineIndex) => {
          const row = document.createElement("span");
          row.className = "code-line";
          row.textContent = sourceLines[(lineIndex + streamIndex * 3) % sourceLines.length];
          track.appendChild(row);
        });

        return track;
      };

      const trackRepeats = isMobile ? 5 : 4;
      stream.append(...Array.from({ length: trackRepeats }, createTrack));

      return stream;
    });

    field.replaceChildren(...fragments);

    if (!animate) {
      return;
    }

    fragments.forEach((fragment, index) => {
      if (isMobile) {
        const tokens = Array.from(fragment.querySelectorAll(".mobile-code-token"));
        const speed = 24 + (index % 7) * 1.7;
        const gap = 28 + (index % 5) * 7;
        let cursor = -((index * 71) % Math.max(window.innerWidth * 0.7, 260));
        const items = tokens.map((token) => {
          const width = token.getBoundingClientRect().width || 86;
          const item = {
            element: token,
            x: cursor,
            width,
            setX: gsap.quickSetter(token, "x", "px"),
          };

          cursor += width + gap;
          item.setX(item.x);
          return item;
        });

        heroCodeAnimations.push({ type: "tokens", gap, items, speed });
        gsap.set(fragment, {
          x: 0,
          y: (index % 3) * 5,
        });
        return;
      }

      const track = fragment.querySelector(".code-track");
      const cycleWidth = track?.getBoundingClientRect().width || 1600;
      const phase = (index * 173) % cycleWidth;
      const speed = 31 + (index % 8) * 2.2;
      const y = (index % 4) * 9;
      const setX = gsap.quickSetter(fragment, "x", "px");

      gsap.set(fragment, {
        x: -phase,
        y,
      });

      heroCodeAnimations.push({ type: "track", cycleWidth, phase, setX, speed });
    });

    const startTime = gsap.ticker.time;

    heroCodeTicker = (_time, deltaTime) => {
      const elapsed = gsap.ticker.time - startTime;
      const deltaSeconds = Number.isFinite(deltaTime) ? Math.min(deltaTime / 1000, 0.05) : 1 / 60;

      heroCodeAnimations.forEach((animation) => {
        if (animation.type === "tokens") {
          const resetLimit = -Math.max(window.innerWidth * 1.6, 620);
          const targetRight = window.innerWidth + 140;

          animation.items.forEach((item) => {
            item.x -= animation.speed * deltaSeconds;
            item.setX(item.x);
          });

          animation.items.forEach((item) => {
            if (item.x + item.width >= resetLimit) {
              return;
            }

            if (item.element.getBoundingClientRect().right >= -120) {
              return;
            }

            const maxRight = Math.max(
              ...animation.items.map((candidate) => candidate.x + candidate.width),
            );
            item.x = maxRight + animation.gap;
            item.setX(item.x);

            let guard = 0;
            while (item.element.getBoundingClientRect().left < targetRight && guard < 5) {
              item.x += window.innerWidth * 0.85;
              item.setX(item.x);
              guard += 1;
            }
          });
          return;
        }

        animation.setX(-((animation.phase + elapsed * animation.speed) % animation.cycleWidth));
      });
    };

    gsap.ticker.add(heroCodeTicker);
  };

  render();
  addHomeListener(mobileHeroCode, "change", render);
  addHomeListener(
    window,
    "resize",
    () => {
      window.clearTimeout(heroCodeResizeTimer);
      heroCodeResizeTimer = window.setTimeout(render, 180);
    },
    { passive: true },
  );

  registerHomeCleanup(() => {
    if (heroCodeTicker) {
      gsap.ticker.remove(heroCodeTicker);
      heroCodeTicker = null;
    }

    heroCodeAnimations = [];
    window.clearTimeout(heroCodeResizeTimer);
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function smoothStep(min, max, value) {
  const progress = clamp((value - min) / (max - min), 0, 1);
  return progress * progress * (3 - 2 * progress);
}

function createCursorDisplacementMap(cursor) {
  const filter = document.querySelector("#cursor-liquid-filter");
  const image = document.querySelector("#cursor-liquid-map");
  const displacement = document.querySelector("#cursor-liquid-displacement");

  if (!filter || !image || !displacement) {
    return null;
  }

  const size = Math.round(cursor.getBoundingClientRect().width || 72);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  canvas.width = size;
  canvas.height = size;

  filter.setAttribute("filterUnits", "userSpaceOnUse");
  filter.setAttribute("x", "0");
  filter.setAttribute("y", "0");
  filter.setAttribute("width", String(size));
  filter.setAttribute("height", String(size));
  image.setAttribute("width", String(size));
  image.setAttribute("height", String(size));

  const rawX = new Float32Array(size * size);
  const rawY = new Float32Array(size * size);
  const imageData = context.createImageData(size, size);

  // Cursor-scoped approximation of React Bits FluidGlass lens material.
  const update = (tiltX = 0, tiltY = 0) => {
    const dragX = clamp(tiltX, -1, 1);
    const dragY = clamp(tiltY, -1, 1);
    const materialScale = cursorFluidGlassMaterial.scale;
    const iorLift = cursorFluidGlassMaterial.ior - 1;
    const thickness = cursorFluidGlassMaterial.thickness;
    const chroma = cursorFluidGlassMaterial.chromaticAberration;
    const anisotropy = cursorFluidGlassMaterial.anisotropy;
    let maxOffset = 1;

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const index = y * size + x;
        const nx = ((x + 0.5) / size) * 2 - 1;
        const ny = ((y + 0.5) / size) * 2 - 1;
        const stretchX = nx * (1 + Math.abs(dragX) * anisotropy * 8);
        const stretchY = ny * (1 + Math.abs(dragY) * anisotropy * 8);
        const radius = Math.sqrt(stretchX * stretchX + stretchY * stretchY);
        const lens = 1 - smoothStep(0.9, 1.02, radius);
        const dome = Math.sqrt(Math.max(0, 1 - Math.min(radius, 0.995) ** 2));
        const bevel = smoothStep(0.58, 0.98, radius) * lens;
        const centerMagnify = (1 - smoothStep(0, 0.56, radius)) * lens;
        const opticalBend = (1 - dome) * thickness * (1 + iorLift * 5.2);
        const edgeBend = bevel * thickness * (1 + iorLift * 6.5);
        const chromaRipple = Math.sin((radius + dragX * 0.04 - dragY * 0.03) * 14) * bevel * chroma * 7;
        const refraction = (opticalBend * materialScale * 17) + (edgeBend * materialScale * 22) + (centerMagnify * materialScale * 5);

        const dx = nx * (refraction + chromaRipple) + dragX * lens * materialScale * 11;
        const dy = ny * (refraction - chromaRipple * 0.55) + dragY * lens * materialScale * 11;

        rawX[index] = dx;
        rawY[index] = dy;
        maxOffset = Math.max(maxOffset, Math.abs(dx), Math.abs(dy));
      }
    }

    const scale = maxOffset * 2;

    for (let index = 0; index < rawX.length; index += 1) {
      const dataIndex = index * 4;
      imageData.data[dataIndex] = clamp(0.5 + rawX[index] / scale, 0, 1) * 255;
      imageData.data[dataIndex + 1] = clamp(0.5 + rawY[index] / scale, 0, 1) * 255;
      imageData.data[dataIndex + 2] = 128;
      imageData.data[dataIndex + 3] = 255;
    }

    context.putImageData(imageData, 0, 0);

    const dataUrl = canvas.toDataURL();
    image.setAttribute("href", dataUrl);
    image.setAttributeNS("http://www.w3.org/1999/xlink", "href", dataUrl);
    displacement.setAttribute("scale", scale.toFixed(2));
  };

  update();
  return { update };
}

export function initCursorGlass() {
  if (typeof window === "undefined") {
    return () => {};
  }

  const cursorReduceMotion = reduceMotion ?? window.matchMedia("(prefers-reduced-motion: reduce)");
  const cursorCanHover = canHover ?? window.matchMedia("(hover: hover) and (pointer: fine)");

  if (cursorReduceMotion.matches || !cursorCanHover.matches) {
    return () => {};
  }

  const cursor = document.querySelector(".cursor-glass");

  if (!cursor) {
    return () => {};
  }

  const liquidMap = createCursorDisplacementMap(cursor);

  if (!liquidMap) {
    return () => {};
  }

  const cursorAbortController = new window.AbortController();
  const cursorCleanupCallbacks = [];
  const addCursorListener = (target, type, listener, options = {}) => {
    if (!target) {
      return;
    }

    target.addEventListener(type, listener, {
      ...options,
      signal: cursorAbortController.signal,
    });
  };
  const registerCursorCleanup = (cleanup) => {
    cursorCleanupCallbacks.push(cleanup);
  };

  document.body.classList.add("has-custom-cursor");
  gsap.set(cursor, {
    x: window.innerWidth / 2 - 36,
    y: window.innerHeight / 2 - 36,
    autoAlpha: 0,
    scaleX: 0.78,
    scaleY: 0.78,
  });

  const xTo = gsap.quickTo(cursor, "x", { duration: 0.28, ease: "power3.out" });
  const yTo = gsap.quickTo(cursor, "y", { duration: 0.28, ease: "power3.out" });
  const scaleXTo = gsap.quickTo(cursor, "scaleX", { duration: 0.22, ease: "power2.out" });
  const scaleYTo = gsap.quickTo(cursor, "scaleY", { duration: 0.22, ease: "power2.out" });
  let previousX = window.innerWidth / 2;
  let previousY = window.innerHeight / 2;
  let lastPointerX = window.innerWidth / 2;
  let lastPointerY = window.innerHeight / 2;
  let tiltX = 0;
  let tiltY = 0;
  let frame = 0;
  let visible = false;
  let overAction = false;
  let pointerPressed = false;
  let dragging = false;
  let interactiveReleaseTimer = 0;

  const scheduleMapUpdate = () => {
    if (frame) {
      return;
    }

    frame = window.requestAnimationFrame(() => {
      frame = 0;
      liquidMap.update(tiltX, tiltY);
    });
  };

  const scaleCursor = (value) => {
    scaleXTo(value);
    scaleYTo(value);
  };

  const syncCursorScale = () => {
    if (pointerPressed || dragging) {
      scaleCursor(overAction ? 0.78 : 0.72);
      return;
    }

    scaleCursor(overAction ? 0.9 : 1);
  };

  const getCursorOffset = () => {
    if (!overAction) {
      return { x: 36, y: 36 };
    }

    const scale = 0.9;
    return {
      x: 36 * (1 - scale) + 21 * scale,
      y: 36 * (1 - scale) + 8 * scale,
    };
  };

  const moveCursor = () => {
    const offset = getCursorOffset();
    xTo(lastPointerX - offset.x);
    yTo(lastPointerY - offset.y);
  };

  const closestInteractive = (target) => {
    if (!(target instanceof Element)) {
      return null;
    }

    return target.closest(interactiveSelector);
  };

  const closestDraggable = (target) => {
    if (!(target instanceof Element)) {
      return null;
    }

    return target.closest(draggableSelector);
  };

  const syncPointer = (event) => {
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
  };

  const isPointInteractive = (event) => {
    const element = document.elementFromPoint(event.clientX, event.clientY);

    if (closestDraggable(element)) {
      return false;
    }

    return Boolean(closestInteractive(element));
  };

  const setPressed = (enabled) => {
    pointerPressed = enabled;
    cursor.classList.toggle("is-pressed", pointerPressed || dragging);
    syncCursorScale();
  };

  const setDragging = (enabled) => {
    dragging = enabled;
    cursor.classList.toggle("is-dragging", dragging);
    cursor.classList.toggle("is-pressed", pointerPressed || dragging);
    syncCursorScale();
  };

  const setInteractive = (enabled) => {
    window.clearTimeout(interactiveReleaseTimer);

    if (enabled) {
      if (!overAction) {
        overAction = true;
        cursor.classList.add("is-interactive");
      }

      moveCursor();
      syncCursorScale();
      return;
    }

    if (!overAction) {
      return;
    }

    overAction = false;
    cursor.classList.remove("is-interactive");
    moveCursor();
    syncCursorScale();
  };

  const queueInteractiveRelease = () => {
    window.clearTimeout(interactiveReleaseTimer);
    interactiveReleaseTimer = window.setTimeout(() => {
      const element = document.elementFromPoint(lastPointerX, lastPointerY);

      if (!closestInteractive(element)) {
        setInteractive(false);
      }
    }, 120);
  };

  registerCursorCleanup(() => {
    window.clearTimeout(interactiveReleaseTimer);

    if (frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }

    document.body.classList.remove("has-custom-cursor");
    gsap.killTweensOf(cursor);
  });

  addCursorListener(
    window,
    "pointermove",
    (event) => {
      const nextTiltX = clamp((event.clientX - previousX) / 42, -1, 1);
      const nextTiltY = clamp((event.clientY - previousY) / 42, -1, 1);

      syncPointer(event);
      moveCursor();
      tiltX = tiltX * 0.7 + nextTiltX * 0.3;
      tiltY = tiltY * 0.7 + nextTiltY * 0.3;
      previousX = event.clientX;
      previousY = event.clientY;
      scheduleMapUpdate();

      if (!visible) {
        visible = true;
        gsap.to(cursor, { autoAlpha: 1, duration: 0.18, overwrite: "auto" });
      }

      if (isPointInteractive(event)) {
        setInteractive(true);
        return;
      }

      if (overAction) {
        queueInteractiveRelease();
        return;
      }

      syncCursorScale();
    },
    { passive: true },
  );

  addCursorListener(window, "pointerleave", () => {
    visible = false;
    setInteractive(false);
    setPressed(false);
    setDragging(false);
    scaleCursor(0.78);
    gsap.to(cursor, { autoAlpha: 0, duration: 0.2, overwrite: "auto" });
  });

  addCursorListener(
    window,
    "pointerdown",
    (event) => {
      syncPointer(event);
      moveCursor();
      setDragging(Boolean(closestDraggable(event.target)));
      setPressed(true);
    },
    { passive: true },
  );

  addCursorListener(
    window,
    "pointerup",
    () => {
      setPressed(false);
      setDragging(false);
    },
    { passive: true },
  );

  addCursorListener(
    window,
    "pointercancel",
    () => {
      setPressed(false);
      setDragging(false);
    },
    { passive: true },
  );

  addCursorListener(document, "dragstart", () => setDragging(true));
  addCursorListener(document, "dragend", () => setDragging(false));

  addCursorListener(
    document,
    "pointerover",
    (event) => {
      syncPointer(event);

      if (closestInteractive(event.target)) {
        setInteractive(true);
      }
    },
    { passive: true },
  );

  addCursorListener(
    document,
    "pointerout",
    (event) => {
      syncPointer(event);

      const fromInteractive = closestInteractive(event.target);
      const toInteractive = closestInteractive(event.relatedTarget);

      if (fromInteractive && !toInteractive) {
        queueInteractiveRelease();
      }
    },
    { passive: true },
  );

  return () => {
    cursorAbortController.abort();
    cursorCleanupCallbacks.forEach((cleanup) => cleanup?.());
  };
}

function initMagneticButtons() {
  const buttons = document.querySelectorAll(".magnetic-button");

  if (reduceMotion.matches || !canHover.matches || !buttons.length) {
    return;
  }

  buttons.forEach((button) => {
    const xTo = gsap.quickTo(button, "x", { duration: 0.34, ease: "power3.out" });
    const yTo = gsap.quickTo(button, "y", { duration: 0.34, ease: "power3.out" });
    const strength = 0.26;
    const maxDistance = 14;

    addHomeListener(
      button,
      "pointermove",
      (event) => {
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = clamp((event.clientX - centerX) * strength, -maxDistance, maxDistance);
        const y = clamp((event.clientY - centerY) * strength, -maxDistance, maxDistance);

        xTo(x);
        yTo(y);
      },
      { passive: true },
    );

    addHomeListener(button, "pointerleave", () => {
      xTo(0);
      yTo(0);
    });
  });
}

function initFooterFluid() {
  if (reduceMotion.matches || !canHover.matches) {
    return;
  }

  const footer = document.querySelector(".footer-links");
  const fluid = document.querySelector(".footer-fluid");
  const blobs = document.querySelectorAll(".fluid-blob");

  if (!footer || !fluid || !blobs.length) {
    return;
  }

  const xTo = gsap.quickTo(fluid, "x", { duration: 0.85, ease: "power3.out" });
  const scaleXTo = gsap.quickTo(fluid, "scaleX", { duration: 0.85, ease: "power3.out" });
  const scaleYTo = gsap.quickTo(fluid, "scaleY", { duration: 0.85, ease: "power3.out" });

  gsap.set(blobs, { transformOrigin: "50% 80%" });
  gsap.to(blobs, {
    y: (index) => [-10, 8, -6][index] || 0,
    scaleY: (index) => [1.08, 0.92, 1.04][index] || 1,
    duration: 3.8,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
    stagger: 0.45,
  });

  addHomeListener(
    footer,
    "pointermove",
    (event) => {
      const rect = footer.getBoundingClientRect();
      const progress = (event.clientX - rect.left) / rect.width - 0.5;
      const depth = 1 - Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);

      xTo(progress * 96);
      scaleXTo(1 + Math.abs(progress) * 0.22);
      scaleYTo(0.92 + depth * 0.2);
    },
    { passive: true },
  );

  addHomeListener(footer, "pointerleave", () => {
    xTo(0);
    scaleXTo(1);
    scaleYTo(1);
  });
}

export function initHomeEnhancements() {
  if (initialized || typeof window === "undefined") {
    return () => {};
  }

  initialized = true;
  activeAbortController = new window.AbortController();
  homeCleanupCallbacks = [];
  reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  nav = document.querySelector(".site-nav");
  articlesTitle = document.querySelector(".articles .section-heading h2");
  canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  mobileHeroCode = window.matchMedia("(max-width: 680px)");

  registerHomeCleanup(initStoryScrollMount());
  registerHomeCleanup(initCurvedLoopMount());
  lines = document.querySelectorAll(".reveal-line");
  initTextFlippingBoards(!reduceMotion.matches);
  lines.forEach(wrapChars);
  initHeroCodeField(!reduceMotion.matches);
  initVariableProximity(!reduceMotion.matches);

  if (reduceMotion.matches) {
    setReducedMotion();
  } else {
    initMotion();
    initMagneticButtons();
    initFooterFluid();
  }

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  addHomeListener(reduceMotion, "change", () => window.location.reload());

  return () => {
    activeAbortController?.abort();
    activeAbortController = null;

    if (heroCodeTicker) {
      gsap.ticker.remove(heroCodeTicker);
      heroCodeTicker = null;
    }

    heroCodeAnimations = [];
    window.clearTimeout(heroCodeResizeTimer);
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    homeCleanupCallbacks.forEach((cleanup) => cleanup?.());
    homeCleanupCallbacks = [];
    initialized = false;
  };
}
