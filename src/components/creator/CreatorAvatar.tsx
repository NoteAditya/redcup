"use client";

import { useState } from "react";

/** Instagram profile picture through /api/creators/[id]/avatar, falling back to an initial. */
export function CreatorAvatar({
  creatorId,
  name,
  hasInstagram,
  size = 48,
}: {
  creatorId: string;
  name: string;
  hasInstagram: boolean;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const initial = (name || "?").trim().slice(0, 1).toUpperCase();
  const box: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    flex: "none",
    overflow: "hidden",
    display: "grid",
    placeItems: "center",
    background: "var(--paper-2, #eee)",
    border: "1px solid var(--line)",
    color: "var(--ink)",
    fontWeight: 600,
    fontSize: size * 0.42,
  };
  if (!hasInstagram || failed) {
    return (
      <span style={box} aria-hidden>
        {initial}
      </span>
    );
  }
  return (
    <span style={box}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/creators/${creatorId}/avatar`}
        alt={`${name}'s Instagram profile picture`}
        width={size}
        height={size}
        loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={() => setFailed(true)}
      />
    </span>
  );
}
