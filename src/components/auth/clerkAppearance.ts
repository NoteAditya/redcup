/** Modest RedCup theming for any Clerk prebuilt surfaces. */
export const redcupClerkAppearance = {
  variables: {
    colorPrimary: "#c82924",
    colorBackground: "#ffffff",
    colorInputBackground: "#faf6f2",
    colorInputText: "#140d0e",
    colorText: "#140d0e",
    colorTextSecondary: "#6e5c5e",
    colorDanger: "#c82924",
    borderRadius: "4px",
    fontFamily: 'var(--font-body), "Plus Jakarta Sans", system-ui, sans-serif',
    fontFamilyButtons: 'var(--font-body), "Plus Jakarta Sans", system-ui, sans-serif',
  },
  elements: {
    card: {
      boxShadow: "none",
      border: "1px solid #d9cfc8",
      background: "#ffffff",
    },
    formButtonPrimary: {
      backgroundColor: "#c82924",
      fontSize: "0.9375rem",
      fontWeight: "600",
      textTransform: "none" as const,
      boxShadow: "none",
    },
    socialButtonsBlockButton: {
      border: "1px solid #d9cfc8",
      background: "#ffffff",
      color: "#140d0e",
      fontWeight: "600",
    },
    headerTitle: {
      fontFamily: 'var(--font-display), "Space Grotesk", system-ui, sans-serif',
      fontWeight: "600",
    },
    footer: { display: "none" },
  },
};
