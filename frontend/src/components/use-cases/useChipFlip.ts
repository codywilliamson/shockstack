// minimal FLIP helper: record current rects, then on next frame animate from old -> new
export interface FlipHandle {
  record(key: string, el: HTMLElement): void;
  play(key: string, el: HTMLElement, duration?: number): void;
}

export function createFlip(): FlipHandle {
  const rects = new Map<string, DOMRect>();

  function prefersReducedMotion() {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  return {
    record(key, el) {
      rects.set(key, el.getBoundingClientRect());
    },
    play(key, el, duration = 550) {
      const prev = rects.get(key);
      rects.delete(key);
      if (!prev || prefersReducedMotion()) return;
      const next = el.getBoundingClientRect();
      const dx = prev.left - next.left;
      const dy = prev.top - next.top;
      const sx = prev.width / Math.max(next.width, 1);
      const sy = prev.height / Math.max(next.height, 1);
      if (
        Math.abs(dx) < 1 &&
        Math.abs(dy) < 1 &&
        Math.abs(sx - 1) < 0.02 &&
        Math.abs(sy - 1) < 0.02
      ) {
        return;
      }
      const anim = el.animate(
        [
          {
            transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
            opacity: 0.6,
          },
          { transform: "translate(0, 0) scale(1, 1)", opacity: 1 },
        ],
        {
          duration,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "both",
        },
      );
      anim.addEventListener("finish", () => anim.cancel());
    },
  };
}
