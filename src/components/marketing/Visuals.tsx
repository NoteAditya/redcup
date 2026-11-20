"use client";

import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import Link from "next/link";

/** Small "Example" tag for sample screens (no fake live data). */
export function ExampleTag() {
  return <span className="example-tag">Example</span>;
}

/** Fade and move up 16px when a section enters the screen (once, ~500ms). */
export function SectionReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Counts up once when scrolled into view; reduced motion shows the final value. */
function useCountUp(target: number, inView: boolean) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? target : 0);
  useEffect(() => {
    if (!inView || reduce) {
      if (reduce) setValue(target);
      return;
    }
    const controls = animate(0, target, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, target]);
  return value;
}

const nf = new Intl.NumberFormat("en-IN");

/** 4-step row: a line draws from step 1 to step 4 as it scrolls in, icons light up red. */
export function StepsRow({ steps }: { steps: { icon: React.ReactNode; title: string }[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const on = inView || !!reduce;
  return (
    <ol ref={ref} className={`steps-row${on ? " is-on" : ""}`}>
      <span className="steps-row-line" aria-hidden="true">
        <span className="steps-row-line-fill" />
      </span>
      {steps.map((s, i) => (
        <li key={s.title} className="steps-row-item" style={{ transitionDelay: reduce ? "0ms" : `${200 + i * 250}ms` }}>
          <span className="steps-row-icon" aria-hidden="true">
            {s.icon}
          </span>
          <span className="steps-row-num">Step {i + 1}</span>
          <span className="steps-row-title">{s.title}</span>
        </li>
      ))}
    </ol>
  );
}

/** Phone frame showing one example creator reel with verified views ticking up and payout filling. */
export function ExampleReelPhone() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const views = useCountUp(28450, inView);
  const earned = useCountUp(1838, inView);
  return (
    <div ref={ref} className="phone" role="img" aria-label="Example reel: Paid Partnership, 28,450 verified views, creator earns ₹1,838">
      <div className="phone-notch" aria-hidden="true" />
      <div className="phone-screen">
        <div className="phone-row">
          <strong>Example reel</strong>
          <ExampleTag />
        </div>
        <div className="phone-reel" aria-hidden="true" />
        <div className="phone-row">
          <span className="phone-muted">Paid Partnership ✓</span>
        </div>
        <div className="phone-stat">
          <span className="phone-muted">Verified views</span>
          <strong className="num">{nf.format(views)}</strong>
        </div>
        <div className="phone-stat">
          <span className="phone-muted">Creator earns</span>
          <strong className="num">₹{nf.format(earned)}</strong>
        </div>
        <div className="phone-bar" aria-hidden="true">
          <span style={{ width: `${(earned / 1838) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

/** Phone mockup of a creator profile: neutral placeholder blocks, tagged Example (no sample people). */
export function ProfilePhone() {
  return (
    <div className="phone" role="img" aria-label="Example RedCup creator profile layout">
      <div className="phone-notch" aria-hidden="true" />
      <div className="phone-screen">
        <div className="phone-row">
          <strong>RedCup profile</strong>
          <ExampleTag />
        </div>
        <div className="phone-profile-head" aria-hidden="true">
          <span className="phone-avatar" />
          <span className="phone-lines">
            <span />
            <span />
          </span>
        </div>
        <div className="phone-row">
          <span className="phone-muted">Verified stats</span>
        </div>
        <div className="phone-tiles" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="phone-row">
          <span className="phone-muted">Best reels</span>
        </div>
        <div className="phone-reels" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

/** For Creators hero: phone with the creator journey; badges pop in one by one. */
export function CreatorJourneyPhone() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  const on = inView || !!reduce;
  const badges = ["Eligible", "Reel approved", "₹2,700 paid by UPI"];
  return (
    <div ref={ref} className={`journey${on ? " is-on" : ""}`}>
      <div className="phone" role="img" aria-label="Example creator app: eligibility tag and payout">
        <div className="phone-notch" aria-hidden="true" />
        <div className="phone-screen">
          <div className="phone-row">
            <strong>Campaigns for you</strong>
            <ExampleTag />
          </div>
          <div className="phone-campaign" aria-hidden="true">
            <span className="phone-lines">
              <span />
              <span />
            </span>
            <span className="status-chip is-ok">Eligible</span>
          </div>
          <div className="phone-campaign" aria-hidden="true">
            <span className="phone-lines">
              <span />
              <span />
            </span>
            <span className="status-chip">Almost</span>
          </div>
          <div className="phone-stat">
            <span className="phone-muted">Payout</span>
            <strong className="num">₹2,700</strong>
          </div>
        </div>
      </div>
      {badges.map((b, i) => (
        <span
          key={b}
          className={`journey-badge jb-${i + 1}`}
          style={{ transitionDelay: reduce ? "0ms" : `${300 + i * 450}ms` }}
        >
          <Check size={16} strokeWidth={2.25} aria-hidden="true" /> {b}
        </span>
      ))}
    </div>
  );
}

/** Numbered vertical timeline with icons (For Brands / For Creators steps). */
export function StepTimeline({ steps }: { steps: { icon: React.ReactNode; title: string; desc: string }[] }) {
  return (
    <ol className="timeline">
      {steps.map((s, i) => (
        <li key={s.title} className="timeline-item">
          <span className="timeline-marker" aria-hidden="true">
            {s.icon}
          </span>
          <div>
            <span className="timeline-num">Step {i + 1}</span>
            <h3 className="timeline-title">{s.title}</h3>
            <p className="timeline-desc">{s.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Mobile-only sticky bottom button. */
export function StickyCta({ href, label }: { href: string; label: string }) {
  return (
    <div className="sticky-cta">
      <Link href={href} className="btn btn-primary">
        {label}
      </Link>
    </div>
  );
}
