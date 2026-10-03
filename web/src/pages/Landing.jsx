import { ArrowRight } from "lucide-react";

import "@/styles/landing.css";

// Pixel-faithful public landing — IN-SCOPE sections only (task 01.0.1b):
// Topnav -> HeroSection -> PortfolioStrip, then STOP. Faithful to
// design-system/components/landing.jsx; colours bridged onto @is/tokens
// via web/src/styles/landing.css. Experience/Packages/Testimonial/Book/
// Footer/BookingModal are deferred, separately-gated tasks.

const landingStyles = {
  hero: {
    minHeight: "100vh",
    background: "var(--surface-canvas)",
    color: "var(--ink-primary)", // design-system body ink, for inherited text
    position: "relative",
    overflow: "hidden",
  },
  heroInner: {
    position: "relative",
    paddingTop: "120px",
    paddingBottom: "80px",
  },
  topnav: {
    position: "absolute", top: 0, left: 0, right: 0,
    padding: "28px 48px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    zIndex: 10,
  },
  navLinks: {
    display: "flex", gap: 40,
    fontFamily: "var(--font-body)",
    fontSize: 11, letterSpacing: "0.28em",
    textTransform: "uppercase", color: "var(--ink-secondary)",
  },
};

// Category links are inert placeholders (non-navigating) — their real
// destinations arrive in later, separately-gated tasks.
const NAV_LINKS = ["Portfolio", "Experience", "Investment", "Journal"];

const PORTFOLIO_PHOTOS = [
  "1519741497674-611481863552",
  "1465495976277-4387d4b0b4c6",
  "1583939003579-730e3918a45a",
  "1606216794074-735e91aa2c92",
  "1525772764200-be829a350797",
  "1606800052052-a08af7148866",
];

// ============================================================
// TOPNAV (ThemeToggle omitted — no live setter this task)
// ============================================================
const Topnav = () => (
  <div style={landingStyles.topnav}>
    <div className="logo-banner-img" role="img" aria-label="Illuminate Studios" />
    <div style={landingStyles.navLinks}>
      {NAV_LINKS.map((label) => (
        <a
          key={label}
          style={{ cursor: "pointer", transition: "color 200ms" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--brand-gold-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--ink-secondary)"; }}
        >
          {label}
        </a>
      ))}
    </div>
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <button className="btn btn-ghost btn-sm" type="button">Client Portal</button>
      <button className="btn btn-primary btn-sm" type="button">Reserve a Date</button>
    </div>
  </div>
);

// ============================================================
// HERO
// ============================================================
const HeroSection = () => (
  <section style={{
    padding: "80px 48px 120px",
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    gap: 80,
    alignItems: "center",
    maxWidth: 1440, margin: "0 auto",
  }}>
    <div className="fade-in">
      <div className="eyebrow" style={{ marginBottom: 32 }}>
        ◆ Est. Melbourne · 2014
      </div>
      <h1 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(48px, 6vw, 88px)",
        lineHeight: 0.95,
        letterSpacing: "0.04em",
        margin: 0,
        textTransform: "uppercase",
        fontWeight: 400,
      }}>
        Weddings,<br/>
        Editorials,<br/>
        <span className="serif-italic gold-text" style={{
          fontFamily: "var(--font-serif)",
          textTransform: "none",
          fontWeight: 400,
          fontStyle: "italic",
          letterSpacing: "0",
        }}>quietly extraordinary.</span>
      </h1>
      <div style={{ marginTop: 40, maxWidth: 460,
                    fontFamily: "var(--font-serif)", fontSize: 19,
                    lineHeight: 1.5, color: "var(--ink-secondary)" }}>
        A boutique studio for couples and brands who prefer their stories told in light,
        not in noise. Limited dates each season, hand-printed archives, fine-art delivery.
      </div>
      <div style={{ marginTop: 48, display: "flex", gap: 16 }}>
        <button className="btn btn-primary btn-lg" type="button">
          Begin <ArrowRight size={14} strokeWidth={1.25} />
        </button>
        <button className="btn btn-ghost btn-lg" type="button">View Portfolio</button>
      </div>

      <div style={{ marginTop: 80, display: "flex", gap: 48, color: "var(--ink-tertiary)" }}>
        <Metric n="280+" label="Weddings honoured" />
        <Metric n="12yr" label="Behind the lens" />
        <Metric n="40" label="Editorial features" />
      </div>
    </div>

    {/* Visual collage — Unsplash placeholders verbatim (real media is a later task) */}
    <div style={{ position: "relative", height: 640 }}>
      <div style={{
        position: "absolute", top: 0, right: 0, width: "62%", height: "70%",
        backgroundImage: "url(https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80)",
        backgroundSize: "cover", backgroundPosition: "center",
        boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, width: "55%", height: "55%",
        backgroundImage: "url(https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80)",
        backgroundSize: "cover", backgroundPosition: "center",
        boxShadow: "0 40px 80px rgba(0,0,0,0.7)",
        border: "1px solid rgba(201,169,110,0.2)",
      }} />
      <div style={{
        position: "absolute", top: "35%", left: "35%", width: 96, height: 96,
        background: "var(--surface-canvas)", border: "1px solid var(--border-gold)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 6, zIndex: 2,
      }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 11,
                      letterSpacing: "0.2em", color: "var(--brand-gold-hover)" }}>SINCE</div>
        <div className="gold-text" style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: "0.1em" }}>MMXIV</div>
      </div>
    </div>
  </section>
);

const Metric = ({ n, label }) => (
  <div>
    <div className="gold-text" style={{ fontFamily: "var(--font-display)", fontSize: 28, letterSpacing: "0.05em" }}>{n}</div>
    <div className="label-sm" style={{ marginTop: 4 }}>{label}</div>
  </div>
);

// ============================================================
// PORTFOLIO STRIP
// ============================================================
const PortfolioStrip = () => (
  <section style={{ padding: "100px 0", borderTop: "1px solid var(--border-default)", borderBottom: "1px solid var(--border-default)" }}>
    <div style={{ padding: "0 48px", marginBottom: 40 }}>
      <div className="hairline" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 32 }}>
        <div>
          <div className="eyebrow">— Recent Work</div>
          <h2 className="display" style={{ fontSize: 40, margin: "12px 0 0" }}>Selected Frames</h2>
        </div>
        <button className="btn btn-ghost btn-sm" type="button">All Portfolio <ArrowRight size={12} strokeWidth={1.25} /></button>
      </div>
    </div>
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(6, 1fr)",
      gap: 2,
    }}>
      {PORTFOLIO_PHOTOS.map((p, i) => (
        <div key={p} style={{
          aspectRatio: i % 3 === 1 ? "3/5" : "4/5",
          backgroundImage: `url(https://images.unsplash.com/photo-${p}?w=600&q=80)`,
          backgroundSize: "cover", backgroundPosition: "center",
          cursor: "pointer", transition: "all 600ms var(--ease-out)",
          filter: "grayscale(0.15)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.filter = "grayscale(0)"; e.currentTarget.style.transform = "scale(1.02)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = "grayscale(0.15)"; e.currentTarget.style.transform = "scale(1)"; }} />
      ))}
    </div>
  </section>
);

// ============================================================
// LANDING — public, no-auth marketing entry point
// ============================================================
export default function Landing() {
  return (
    <div style={landingStyles.hero}>
      {/* Atmospheric backdrop */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          radial-gradient(50% 40% at 70% 30%, rgba(201,169,110,0.10), transparent 60%),
          radial-gradient(40% 30% at 20% 80%, rgba(201,169,110,0.05), transparent 60%)`,
      }} />

      <Topnav />

      <div style={landingStyles.heroInner}>
        <HeroSection />
        <PortfolioStrip />
      </div>
    </div>
  );
}
