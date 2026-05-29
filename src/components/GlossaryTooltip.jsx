import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GLOSSARY_BY_ID } from "../curriculum/glossary.js";

// Inline trigger for a glossary term. On hover/focus it shows a floating card
// with the plain-language definition and, when available, a Wolfram-rendered
// figure. The card is portaled to <body> so it never gets clipped by the
// lesson's scroll container, and flips above the term near the bottom of the view.
export default function GlossaryTooltip({ id, children }) {
  const entry = GLOSSARY_BY_ID[id];
  const triggerRef = useRef(null);
  const closeTimer = useRef(null);
  const [pos, setPos] = useState(null); // { left, top?, bottom?, placement }

  const open = useCallback(() => {
    clearTimeout(closeTimer.current);
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const W = 340;
    const left = Math.min(Math.max(8, r.left), window.innerWidth - W - 8);
    // Flip above when the term sits in the lower half of the viewport.
    if (r.top > window.innerHeight * 0.55) {
      setPos({ left, bottom: window.innerHeight - r.top + 8, placement: "above" });
    } else {
      setPos({ left, top: r.bottom + 8, placement: "below" });
    }
  }, []);

  const close = useCallback(() => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setPos(null), 120);
  }, []);

  // Unknown id (e.g. glossary edited): render plain text, no decoration.
  if (!entry) return <>{children}</>;

  return (
    <>
      <span
        ref={triggerRef}
        className="np-term"
        tabIndex={0}
        role="button"
        aria-label={`Define ${entry.label}`}
        onMouseEnter={open}
        onMouseLeave={close}
        onFocus={open}
        onBlur={close}
      >
        {children}
      </span>
      {pos &&
        createPortal(
          <div
            className="np-term-pop"
            style={{
              left: pos.left,
              ...(pos.placement === "above" ? { bottom: pos.bottom } : { top: pos.top }),
            }}
            onMouseEnter={() => clearTimeout(closeTimer.current)}
            onMouseLeave={close}
          >
            <div className="np-term-pop-label">{entry.label}</div>
            <div className="np-term-pop-def">{entry.def}</div>
            {entry.plot && (
              <figure className="np-term-pop-fig">
                <img src={entry.plot.src} alt={`${entry.label} — figure`} loading="lazy" />
                {entry.plot.caption && <figcaption>{entry.plot.caption}</figcaption>}
              </figure>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
