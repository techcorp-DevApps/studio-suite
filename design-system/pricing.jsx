/* eslint-disable */
// ============================================================
// PRICING VIEW — Flips between package pricing (pre-shoot)
// and a beautiful gallery wall (post-shoot delivered)
// ============================================================
const PricingView = ({ shootDelivered, client }) => {
  if (shootDelivered) return <GalleryWall client={client} />;
  return <PackagesScreen client={client} />;
};

// -------- Pre-shoot: packages --------
const PackagesScreen = ({ client }) => (
  <div className="fade-in">
    <SectionHeader
      eyebrow="— Investment · Your Collection"
      title="Packages & Add-Ons"
      subtitle="Your selected collection is highlighted. Additions can be requested up to four weeks before the day."
    />
    <div style={{ marginTop: 48 }}>
      <div className="label-sm" style={{ marginBottom: 20 }}>Collections</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {window.PACKAGES.map(p => (
          <PackagePortalCard key={p.id} pkg={p} selected={client.package === p.id} />
        ))}
      </div>
      <div className="label-sm" style={{ margin: "56px 0 20px" }}>Available Add-Ons</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, background: "var(--ink-400)" }}>
        {window.ADD_ONS.map(a => (
          <div key={a.id} style={{
            background: "var(--ink-100)", padding: "20px 24px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            transition: "background 200ms",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--ink-200)"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--ink-100)"}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {a.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--bone-400)", marginTop: 2, fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
                per {a.unit}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div className="numeric" style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--gold-100)" }}>
                {window.amount(a.price)}
              </div>
              <button className="btn btn-ghost btn-sm">
                <Icon name="plus" size={12} /> Request
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PackagePortalCard = ({ pkg, selected }) => (
  <div style={{
    background: selected ? "linear-gradient(180deg, var(--ink-200), var(--ink-100))" : "var(--ink-100)",
    border: `1px solid ${selected ? "var(--gold-400)" : "var(--ink-500)"}`,
    padding: "32px 28px",
    position: "relative",
  }}>
    {selected && (
      <div style={{
        position: "absolute", top: -1, right: 16,
        background: "var(--gold-300)", color: "var(--ink-050)",
        padding: "4px 12px", fontSize: 9, letterSpacing: "0.3em", fontWeight: 600,
        textTransform: "uppercase",
      }}>Your Collection</div>
    )}
    <div className="eyebrow" style={{ color: selected ? "var(--gold-200)" : "var(--bone-300)" }}>
      {pkg.id === "essentials" ? "I" : pkg.id === "signature" ? "II" : "III"}
    </div>
    <div className={selected ? "gold-text" : ""} style={{
      fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: "0.1em",
      textTransform: "uppercase", margin: "12px 0 4px",
    }}>{pkg.tier}</div>
    <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--bone-300)", fontSize: 14, marginBottom: 20 }}>
      {pkg.duration}
    </div>
    <div className="numeric" style={{ fontFamily: "var(--font-display)", fontSize: 32 }}>
      {window.amount(pkg.price)}
    </div>
    <div className="hairline" style={{ margin: "20px 0 16px" }} />
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      {pkg.includes.slice(0, 4).map((inc, i) => (
        <li key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--bone-200)", fontFamily: "var(--font-serif)", fontSize: 15 }}>
          <span style={{ color: "var(--gold-300)" }}><Icon name="check" size={12} /></span>
          {inc}
        </li>
      ))}
      {pkg.includes.length > 4 && (
        <li style={{ fontSize: 12, color: "var(--bone-400)", marginTop: 4, fontStyle: "italic", fontFamily: "var(--font-serif)" }}>
          + {pkg.includes.length - 4} more
        </li>
      )}
    </ul>
  </div>
);

// -------- Post-shoot: gallery wall --------
const GalleryWall = ({ client }) => {
  // Carefully composed wall: mix of sizes/orientations
  const wall = [
    { p: window.GALLERY_PROOFS[0],  size: "lg-v" },
    { p: window.GALLERY_PROOFS[1],  size: "sm-sq" },
    { p: window.GALLERY_PROOFS[3],  size: "wide" },
    { p: window.GALLERY_PROOFS[2],  size: "md-v" },
    { p: window.GALLERY_PROOFS[6],  size: "lg-v" },
    { p: window.GALLERY_PROOFS[5],  size: "wide" },
    { p: window.GALLERY_PROOFS[8],  size: "md-v" },
    { p: window.GALLERY_PROOFS[12], size: "wide" },
    { p: window.GALLERY_PROOFS[14], size: "wide" },
    { p: window.GALLERY_PROOFS[10], size: "md-v" },
  ];

  return (
    <div className="fade-in-slow">
      <SectionHeader
        eyebrow="— Print Collection · Featured Frames"
        title="Your Gallery Wall"
        subtitle="A curated wall of frames from your day, sized for fine-art print. Each is available in archival giclée up to 60×90cm."
        action={
          <button className="btn btn-outline-gold btn-sm">
            <Icon name="image" size={14} /> Order Prints
          </button>
        }
      />

      {/* The wall — CSS grid with explicit spans */}
      <div style={{
        marginTop: 56,
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gridAutoRows: "120px",
        gap: 12,
      }}>
        {wall.map(({ p, size }, i) => {
          const sizes = {
            "lg-v":  { col: "span 2", row: "span 4" },
            "md-v":  { col: "span 2", row: "span 3" },
            "sm-sq": { col: "span 2", row: "span 2" },
            "wide":  { col: "span 2", row: "span 2" },
          };
          const s = sizes[size];
          return (
            <div key={i} style={{
              gridColumn: s.col, gridRow: s.row,
              background: `url(${p.src}) center/cover`,
              position: "relative",
              cursor: "pointer", overflow: "hidden",
              border: "1px solid var(--ink-400)",
              transition: "transform 600ms var(--ease-out)",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.01)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.85) 100%)",
                opacity: 0, transition: "opacity 300ms",
                display: "flex", alignItems: "flex-end", padding: 20,
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}>
                <div>
                  <div style={{ color: "var(--gold-200)", fontFamily: "var(--font-display)", fontSize: 11, letterSpacing: "0.2em" }}>
                    {p.label}
                  </div>
                  <div style={{ color: "var(--bone-200)", fontSize: 11, marginTop: 4 }}>Available as fine-art print</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Print sizing legend */}
      <div style={{
        marginTop: 64, padding: 40,
        background: "var(--ink-100)", border: "1px solid var(--ink-500)",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 32 }}>
          <PrintSize label="Petite"      dims="20×30 cm"  price="145"  desc="Single frame · Mat & glass"/>
          <PrintSize label="Standard"    dims="30×45 cm"  price="285" desc="Studio classic" highlight/>
          <PrintSize label="Grand"       dims="45×60 cm"  price="510" desc="Statement piece"/>
          <PrintSize label="Heirloom"    dims="60×90 cm"  price="840" desc="Archival giclée on cotton rag"/>
        </div>
      </div>
    </div>
  );
};

const PrintSize = ({ label, dims, price, desc, highlight }) => (
  <div style={{
    padding: "8px 0",
    borderLeft: highlight ? "1px solid var(--gold-400)" : "1px solid var(--ink-500)",
    paddingLeft: 20,
  }}>
    <div className="eyebrow" style={{ color: highlight ? "var(--gold-200)" : "var(--bone-300)", marginBottom: 8 }}>
      {label}
    </div>
    <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: "0.08em", marginBottom: 4 }}>
      {dims}
    </div>
    <div className="numeric" style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--gold-100)", marginBottom: 8 }}>
      from {price}
    </div>
    <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--bone-300)", fontSize: 13 }}>
      {desc}
    </div>
  </div>
);

Object.assign(window, { PricingView });
