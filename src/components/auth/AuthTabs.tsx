"use client";

import { useId, useState } from "react";

/** Two clear tabs on the sign-in page: Creator and Brand. */
export function AuthTabs({
  creator,
  brand,
  initial = "creator",
}: {
  creator: React.ReactNode;
  brand: React.ReactNode;
  initial?: "creator" | "brand";
}) {
  const [tab, setTab] = useState<"creator" | "brand">(initial);
  const id = useId();
  const tabs = [
    { key: "creator" as const, label: "Creator" },
    { key: "brand" as const, label: "Brand" },
  ];
  return (
    <div>
      <div className="auth-tabs" role="tablist" aria-label="Who is signing in">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`${id}-${t.key}-tab`}
            aria-selected={tab === t.key}
            aria-controls={`${id}-${t.key}-panel`}
            className={tab === t.key ? "is-on" : undefined}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${id}-creator-panel`} aria-labelledby={`${id}-creator-tab`} hidden={tab !== "creator"}>
        {creator}
      </div>
      <div role="tabpanel" id={`${id}-brand-panel`} aria-labelledby={`${id}-brand-tab`} hidden={tab !== "brand"}>
        {brand}
      </div>
    </div>
  );
}
