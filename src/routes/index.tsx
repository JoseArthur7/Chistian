import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import packAsset from "../assets/pack.jpeg.asset.json";
import cardBackAsset from "../assets/card-back.jpeg.asset.json";
import card1Asset from "../assets/card-1.png.asset.json";
import card2Asset from "../assets/card-2.jpeg.asset.json";
import card3Asset from "../assets/card-3.jpeg.asset.json";
import card4Asset from "../assets/card-4.png.asset.json";
import card5Asset from "../assets/card-5.png.asset.json";
import card6Asset from "../assets/card-6.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trabalho Avaliativo de Biologia" },
      { name: "description", content: "Trabalho Avaliativo de Biologia — Grupo: José, Paulo Henrique, Rangel." },
      { property: "og:title", content: "Trabalho Avaliativo de Biologia" },
      { property: "og:description", content: "Grupo: José, Paulo Henrique, Rangel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PackOpening,
});

const CARD_DATA = [
  { front: card1Asset.url, link: "https://canva.link/7c3lr7l9ivsr96r" },
  { front: card2Asset.url, link: "https://canva.link/07n44zbgqiubirk" },
  { front: card3Asset.url, link: "https://canva.link/5aepgtuegbn3fzk" },
  { front: card4Asset.url, link: "https://canva.link/vlt7ig4llrm0dll" },
  { front: card5Asset.url, link: "https://canva.link/ygbj08k899209yq" },
  { front: card6Asset.url, link: "https://canva.link/whbnv868kmylfoo" },
];

const CARD_POSITIONS = [
  { x: 180, y: 205, r: -12 },
  { x: 470, y: 350, r: -5 },
  { x: 745, y: 185, r: 4 },
  { x: 1175, y: 185, r: -4 },
  { x: 1450, y: 350, r: 5 },
  { x: 1740, y: 205, r: 12 },
];

type CardPosition = { x: number; y: number; r: number };

function PackOpening() {
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [phase, setPhase] = useState<"sealed" | "opening" | "cards">("sealed");
  const [packX, setPackX] = useState(0);
  const [tear, setTear] = useState(0);
  const [focused, setFocused] = useState<number | null>(null);
  const [draggingCard, setDraggingCard] = useState<number | null>(null);
  const [positions, setPositions] = useState<CardPosition[]>(CARD_POSITIONS);
  const dragRef = useRef({ active: false, startX: 0, originX: 0, lastX: 0, lastTime: 0, velocity: 0 });
  const tearRef = useRef({ active: false, startX: 0 });
  const cardDragRef = useRef({ id: -1, startX: 0, startY: 0, originX: 0, originY: 0, moved: false, lastX: 0, lastY: 0, lastTime: 0, velocityX: 0, velocityY: 0 });
  const focusedAtPointerDownRef = useRef<number | null>(null);

  useEffect(() => {
    const resize = () => setScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const reset = () => {
    setPhase("sealed");
    setPackX(0);
    setTear(0);
    setFocused(null);
    setDraggingCard(null);
    setPositions(CARD_POSITIONS);
  };

  const startPackDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== "sealed") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { active: true, startX: event.clientX, originX: packX, lastX: event.clientX, lastTime: performance.now(), velocity: 0 };
  };

  const movePack = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const now = performance.now();
    const next = Math.max(-330, Math.min(330, drag.originX + (event.clientX - drag.startX) / scale));
    drag.velocity = (event.clientX - drag.lastX) / Math.max(1, now - drag.lastTime);
    drag.lastX = event.clientX;
    drag.lastTime = now;
    setPackX(next);
  };

  const endPackDrag = () => {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;
    const target = Math.max(-330, Math.min(330, packX + drag.velocity * 95));
    setPackX(target);
    window.setTimeout(() => setPackX(0), 380);
  };

  const startTear = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    tearRef.current = { active: true, startX: event.clientX };
  };

  const moveTear = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!tearRef.current.active) return;
    const distance = Math.abs(event.clientX - tearRef.current.startX) / scale;
    setTear(Math.min(1, distance / 300));
  };

  const finishTear = () => {
    if (!tearRef.current.active) return;
    tearRef.current.active = false;
    if (tear > 0.68) {
      setTear(1);
      setPhase("opening");
      window.setTimeout(() => setPhase("cards"), 880);
    } else {
      setTear(0);
    }
  };

  const startCardDrag = (id: number, event: ReactPointerEvent<HTMLDivElement>) => {
    focusedAtPointerDownRef.current = focused;
    if (focused !== null) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const current = positions[id] ?? CARD_POSITIONS[id] ?? { x: 960, y: 540, r: 0 };
    setDraggingCard(id);
    cardDragRef.current = { id, startX: event.clientX, startY: event.clientY, originX: current.x, originY: current.y, moved: false, lastX: event.clientX, lastY: event.clientY, lastTime: performance.now(), velocityX: 0, velocityY: 0 };
  };

  const moveCard = (id: number, event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = cardDragRef.current;
    if (drag.id !== id || focused !== null) return;
    const dx = (event.clientX - drag.startX) / scale;
    const dy = (event.clientY - drag.startY) / scale;
    const now = performance.now();
    drag.velocityX = (event.clientX - drag.lastX) / Math.max(1, now - drag.lastTime);
    drag.velocityY = (event.clientY - drag.lastY) / Math.max(1, now - drag.lastTime);
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastTime = now;
    if (Math.hypot(dx, dy) > 8) drag.moved = true;
    setPositions((current) => current.map((position, index) => index === id ? {
      x: Math.max(130, Math.min(1790, drag.originX + dx)),
      y: Math.max(160, Math.min(880, drag.originY + dy)),
      r: Math.max(-16, Math.min(16, dx / 18)),
    } : position));
  };

  const endCardDrag = (id: number) => {
    const drag = cardDragRef.current;
    if (drag.id !== id) return;
    drag.id = -1;
    setDraggingCard(null);
    if (!drag.moved) {
      setFocused(id);
      return;
    }
    setPositions((current) => current.map((position, index) => index === id ? {
      x: Math.max(130, Math.min(1790, position.x + drag.velocityX * 75)),
      y: Math.max(160, Math.min(880, position.y + drag.velocityY * 75)),
      r: Math.max(-18, Math.min(18, position.r + drag.velocityX * 2.5)),
    } : position));
  };

  return (
    <main ref={shellRef} className="stage-shell">
      <section className="stage" style={{ transform: `scale(${scale})` }} aria-label="Interactive booster pack opening">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <div className="topbar">
          <div className="brand-mark">
            <div className="brand-text">
              <strong>Trabalho Avaliativo de Biologia</strong>
              <span>Grupo: José, Paulo Henrique, Rangel</span>
            </div>
          </div>
          <button className="icon-button" onClick={reset} aria-label="Reset pack" title="Reset pack"><RotateCcw size={24} /></button>
        </div>

        {phase !== "cards" && (
          <div className={`pack-area ${phase === "opening" ? "is-opening" : ""}`} style={{ transform: `translateX(${packX}px)` }}>
            <div className="pack-shadow" />
            <div
              className="pack"
              onPointerDown={startPackDrag}
              onPointerMove={movePack}
              onPointerUp={endPackDrag}
              onPointerCancel={endPackDrag}
            >
              <img src={packAsset.url} alt="Booster pack" draggable={false} />
              <div className="pack-shine" />
              <div
                className="tear-zone"
                onPointerDown={startTear}
                onPointerMove={moveTear}
                onPointerUp={finishTear}
                onPointerCancel={finishTear}
              >
                <div className="tear-line" style={{ width: `${Math.max(7, tear * 100)}%` }} />
                <div className="tear-cue"><span>SWIPE TO OPEN</span><i>→</i></div>
              </div>
              <div className="pack-top" style={{ transform: `translate(${tear * 55}px, ${phase === "opening" ? -120 : 0}px) rotate(${tear * 9}deg)`, opacity: phase === "opening" ? 0 : 1 }}>
                <img src={packAsset.url} alt="" draggable={false} />
              </div>
            </div>
          </div>
        )}

        {phase === "cards" && (
          <div className="card-field">
            {CARD_DATA.map((card, id) => {
              const position = positions[id] ?? CARD_POSITIONS[id] ?? { x: 960, y: 540, r: 0 };
              const isFocused = focused === id;
              return (
                <div
                  key={card.link}
                  className={`card-wrap card-${id + 1} ${isFocused ? "is-focused" : ""} ${draggingCard === id ? "is-dragging" : ""}`}
                  style={{ left: position.x, top: position.y, transform: isFocused ? "translate(-50%, -50%) rotate(0deg) scale(1.75)" : `translate(-50%, -50%) rotate(${position.r}deg)` }}
                  onPointerDown={(event) => startCardDrag(id, event)}
                  onPointerMove={(event) => moveCard(id, event)}
                  onPointerUp={() => endCardDrag(id)}
                  onPointerCancel={() => endCardDrag(id)}
                  onClick={() => {
                    const wasFocusedAtStart = focusedAtPointerDownRef.current === id;
                    focusedAtPointerDownRef.current = null;
                    if (isFocused && wasFocusedAtStart) window.open(card.link, "_blank", "noopener,noreferrer");
                  }}
                >
                  <div className={`card-inner ${isFocused ? "is-flipped" : ""}`}>
                    <div className="card-face card-back"><img src={cardBackAsset.url} alt={`Card ${id + 1}, face down`} draggable={false} /></div>
                    <div className="card-face card-front"><img src={card.front} alt={`Card ${id + 1}`} draggable={false} /><div className="card-glint" /></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {focused !== null && (
          <div className="focus-overlay" onClick={() => setFocused(null)}>
            <button className="close-button" onClick={() => setFocused(null)} aria-label="Close card"><X size={36} /></button>
            <div className="link-hint"><ExternalLink size={18} /><span>Open card</span></div>
          </div>
        )}
      </section>
    </main>
  );
}