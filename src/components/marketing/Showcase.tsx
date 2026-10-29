"use client";

import { useState } from "react";

const ITEMS = [
  {
    id: "fund",
    label: "Fund",
    fact: "Lock creator budget and fee before applications open.",
    src: "/media/film-cans-downstairs-in-the-electric-cinema.jpg",
    alt: "Stacked film cans in a cinema basement",
  },
  {
    id: "apply",
    label: "Apply",
    fact: "Creators see Eligible before they spend a minute writing.",
    src: "/media/a-female-technician-repairing-a-broken-film.jpg",
    alt: "Technician repairing film",
  },
  {
    id: "award",
    label: "Award",
    fact: "Shortlist by Fit Score. Award slots — or auto-award.",
    src: "/media/film-cans-downstairs-in-the-electric-cinema-2.jpg",
    alt: "Rows of film cans",
  },
  {
    id: "verify",
    label: "Verify",
    fact: "One draft. Live reel with paid label. Pay on verified views.",
    src: "/media/bridge-fog.jpg",
    alt: "Bridge in fog",
  },
];

export function Showcase() {
  const [active, setActive] = useState(0);
  const item = ITEMS[active];
  return (
    <section className="showcase" aria-label="How a bounty moves">
      <div className="showcase-list" role="tablist" aria-orientation="vertical">
        {ITEMS.map((it, i) => (
          <button
            key={it.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={i === active ? "is-active" : undefined}
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
          >
            {it.label}
          </button>
        ))}
      </div>
      <div className="showcase-stage">
        <div className="showcase-disc" aria-hidden />
        <div className="showcase-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.src} alt={item.alt} />
        </div>
        <p className="showcase-fact">{item.fact}</p>
      </div>
    </section>
  );
}
