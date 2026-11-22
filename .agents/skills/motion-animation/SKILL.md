---
name: motion-animation
description: "Guidance and patterns for implementing web animations, spring physics, gesture feedback, and scroll-driven interactions using Motion (motion.dev) and modern CSS. Use when designing, adding, or refining UI animations, interactive micro-interactions, page transitions, or celebratory effects."
---

# Motion & Animation Skill

Specialized skill for creating smooth, performant, and delightful web animations using **Motion** (formerly Framer Motion / Motion One) alongside CSS animations and the Web Animations API (WAAPI).

---

## When to Apply

Use this skill when:
- Adding **micro-interactions** (button press bounce, hover states, card lifts).
- Creating **scroll-driven** animations (parallax, progress bars, staggered reveal on scroll).
- Building **gamification feedback** (XP count-up, streak badge popping, level-up celebrations, toast alerts).
- Implementing **state transitions** (accordion expansion, modal opening/closing, tab switching).
- Auditing UI for **animation performance** (60/120 FPS, composited properties: `transform` & `opacity` only).

---

## Core Principles & Rules

### 1. Accessibility First (`prefers-reduced-motion`)
Always honor user accessibility preferences. Users with vestibular disorders must not be subjected to intense motion:
```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Instant transition or gentle opacity only
  animate(element, { opacity: [0, 1] }, { duration: 0.1 });
} else {
  // Full spring/bouncy animation
  animate(element, { opacity: [0, 1], scale: [0.9, 1] }, { type: 'spring', stiffness: 300, damping: 20 });
}
```

In CSS:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 2. High-Performance Properties Only
Never animate layout-triggering properties (`width`, `height`, `top`, `left`, `margin`, `padding`).  
**Only animate composited properties:**
- `transform` (`scale`, `x`, `y`, `rotate`)
- `opacity`
- `filter` (use sparingly)

### 3. Quick & Responsive Timing
- Micro-interactions: **150ms – 250ms**
- Transitions & Dialogs: **200ms – 350ms**
- Large section reveals: **300ms – 500ms**
- Physics: Prefer **spring** over linear or harsh ease-in-out for playful, tactile UI.

---

## Using Motion in Vanilla JS (Without Build Step)

### Quick Import via CDN (ESM)
```html
<script type="module">
  import { animate, inView, scroll, spring } from "https://cdn.jsdelivr.net/npm/motion@latest/+esm";

  // 1. Basic Spring Animation
  animate("#mascot", { scale: [0.8, 1.1, 1], rotate: [0, -5, 5, 0] }, { 
    duration: 0.6,
    easing: spring({ stiffness: 350, damping: 15 })
  });

  // 2. Scroll Reveal (Staggered Children)
  inView(".stagger-group", ({ target }) => {
    animate(
      target.querySelectorAll(".stagger-item"),
      { opacity: [0, 1], y: [24, 0] },
      { delay: (i) => i * 0.08, duration: 0.4, easing: "ease-out" }
    );
  });

  // 3. Scroll Progress Indicator
  scroll(animate("#reading-progress", { scaleX: [0, 1] }), {
    target: document.body,
    offset: ["start start", "end end"]
  });
</script>
```

---

## Tactile UI Recipes (Gen-Z & Chunky Style)

### A. Chunky Button Press (Border-B-4)
```javascript
// Tactile press feeling matching border-b-4 design
const applyChunkyPress = (buttonEl) => {
  buttonEl.addEventListener("pointerdown", () => {
    animate(buttonEl, { y: 2, scale: 0.98 }, { duration: 0.08 });
  });
  buttonEl.addEventListener("pointerup", () => {
    animate(buttonEl, { y: 0, scale: 1 }, { type: "spring", stiffness: 400, damping: 15 });
  });
};
```

### B. Badge / XP Pop Effect
```javascript
export const popBadge = (badgeEl) => {
  animate(
    badgeEl,
    { scale: [1, 1.25, 0.95, 1], rotate: [0, -4, 4, 0] },
    { duration: 0.45, easing: spring({ stiffness: 400, damping: 12 }) }
  );
};
```

### C. Confetti / Success Trigger
Combine Web Audio chime (`X.sound.success()`) with spring bounce to create immediate dopamine and reward loops.

---

## Verification & QA Checklist
- [ ] No layout shift (CLS < 0.1).
- [ ] 60+ FPS on mobile (tested with mobile viewport throttling).
- [ ] `prefers-reduced-motion` cleanly suppresses motion.
- [ ] No memory leaks (cleanup event listeners and observers on unmount).
