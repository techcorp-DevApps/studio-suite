/* eslint-disable */
const clientStyles = {
  shell: {
    minHeight: "100vh",
    background: "var(--ink-050)",
    color: "var(--bone-050)",
  },
  topbar: {
    height: "var(--topbar-h)",
    borderBottom: "1px solid var(--ink-400)",
    padding: "0 32px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "var(--ink-050)",
    position: "sticky", top: 0, zIndex: 50,
  },
  drawer: {
    position: "fixed",
    top: 0, left: 0, bottom: 0,
    width: "var(--nav-w)",
    background: "linear-gradient(180deg, var(--ink-100), var(--ink-050))",
    borderRight: "1px solid var(--ink-400)",
    zIndex: 100,
    display: "flex", flexDirection: "column",
    transition: "transform var(--dur-med) var(--ease-out)",
  },
  drawerScrim: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(4px)", zIndex: 99,
    animation: "fade-in var(--dur-med) var(--ease-out)",
  },
  navItem: {
    display: "flex", alignItems: "center", gap: 16,
    padding: "14px 24px",
    color: "var(--bone-200)",
    fontFamily: "var(--font-body)",
    fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase",
    cursor: "pointer", transition: "all 200ms var(--ease-out)",
    position: "relative",
  },
  main: {
    padding: "48px 56px 80px",
    maxWidth: 1400,
    margin: "0 auto",
  },
};

const ClientPortal = ({ onSignOut, clientState, setClientState }) => {
  const [drawer, setDrawer] = useState(false);
  const [welcome, setWelcome] = useState(true);
  const [active, setActive] = useState(() => {
    // If shoot delivered, default to gallery; else "home"
    return clientState.phaseIdx >= 6 ? "gallery" : "home";
  });

  const [documents, setDocuments] = useState(() =>
    JSON.parse(localStorage.getItem("is_docs") || "null") || window.DOCUMENTS_INITIAL);
  const [inbox, setInbox] = useState(() =>
    JSON.parse(localStorage.getItem("is_inbox") || "null") || window.INBOX_INITIAL);
  const [selectedPhotos, setSelectedPhotos] = useState(() =>
    new Set(JSON.parse(localStorage.getItem("is_selected") || "[]")));

  // Persist
  useEffect(() => { localStorage.setItem("is_docs", JSON.stringify(documents)); }, [documents]);
  useEffect(() => { localStorage.setItem("is_inbox", JSON.stringify(inbox)); }, [inbox]);
  useEffect(() => { localStorage.setItem("is_selected", JSON.stringify([...selectedPhotos])); }, [selectedPhotos]);

  const visitsRef = useRef(false);
  useEffect(() => {
    if (visitsRef.current) return;
    visitsRef.current = true;
    setClientState(c => ({ ...c, visitCount: (c.visitCount || 0) + 1 }));
  }, []);

  const shootDelivered = clientState.phaseIdx >= 6;

  return (
    <div style={clientStyles.shell}>
      <Topbar
        onMenu={() => setDrawer(true)}
        onSignOut={onSignOut}
        clientName={clientState.shortName}
        notifCount={inbox.filter(i => !i.read && i.requiresSignature).length}
        onInboxClick={() => setActive("inbox")}
      />
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        active={active}
        setActive={(k) => { setActive(k); setDrawer(false); }}
        client={clientState}
        unreadCount={inbox.filter(i => !i.read && i.requiresSignature).length}
        shootDelivered={shootDelivered}
        onSignOut={onSignOut}
      />

      <main style={clientStyles.main}>
        {active === "home"     && <HomeView client={clientState} shootDelivered={shootDelivered}
                                            setActive={setActive}
                                            onOpenWelcome={() => setWelcome(true)} />}
        {active === "gallery"  && <GalleryView photos={window.GALLERY_PROOFS}
                                              selected={selectedPhotos}
                                              setSelected={setSelectedPhotos} />}
        {active === "documents"&& <DocumentsView documents={documents} />}
        {active === "inbox"    && <InboxView inbox={inbox} setInbox={setInbox}
                                            documents={documents} setDocuments={setDocuments} />}
        {active === "pricing"  && <PricingView shootDelivered={shootDelivered}
                                              client={clientState} />}
      </main>

      {welcome && (
        <WelcomeModal
          firstVisit={clientState.visitCount <= 1}
          client={clientState}
          onClose={() => setWelcome(false)}
        />
      )}
    </div>
  );
};

// ============================================================
// TOPBAR
// ============================================================
const Topbar = ({ onMenu, onSignOut, clientName, notifCount, onInboxClick }) => (
  <header style={clientStyles.topbar}>
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <button onClick={onMenu} style={{ color: "var(--bone-200)", padding: 8 }}
              aria-label="Menu"
              onMouseEnter={e => e.currentTarget.style.color = "var(--gold-200)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--bone-200)"}>
        <Icon name="menu" size={22} />
      </button>
      <LogoLockup />
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <ThemeToggle />
      <button onClick={onInboxClick} style={{ position: "relative", padding: 8, color: "var(--bone-200)" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--gold-300)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--bone-200)"}>
        <Icon name="bell" size={20} />
        {notifCount > 0 && (
          <span style={{
            position: "absolute", top: 4, right: 4,
            width: 8, height: 8, borderRadius: "50%",
            background: "var(--gold-300)",
            boxShadow: "0 0 0 2px var(--ink-050)",
            animation: "pulse-gold 2s infinite",
          }} />
        )}
      </button>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "8px 16px", border: "1px solid var(--ink-500)",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "var(--ink-300)", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontSize: 12,
          color: "var(--gold-200)", letterSpacing: "0.1em",
        }}>{clientName}</div>
        <button onClick={onSignOut} style={{ color: "var(--bone-300)", padding: 4 }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--gold-200)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--bone-300)"}>
          <Icon name="logout" size={16} />
        </button>
      </div>
    </div>
  </header>
);

// ============================================================
// DRAWER NAV (slide-out)
// ============================================================
const Drawer = ({ open, onClose, active, setActive, client, unreadCount, shootDelivered, onSignOut }) => {
  if (!open) return null;

  const items = [
    { key: "home",      label: "Overview",        icon: "sparkle" },
    { key: "gallery",   label: shootDelivered ? "Your Gallery" : "Gallery", icon: "gallery", disabled: !shootDelivered, hint: shootDelivered ? null : "Available after shoot" },
    { key: "inbox",     label: "Inbox",           icon: "inbox",   badge: unreadCount },
    { key: "documents", label: "Documents",       icon: "doc" },
    { key: "pricing",   label: shootDelivered ? "Print Collection" : "Packages", icon: shootDelivered ? "image" : "pricing" },
  ];

  return (
    <>
      <div style={clientStyles.drawerScrim} onClick={onClose} />
      <aside style={{
        ...clientStyles.drawer,
        animation: "slide-in-left var(--dur-med) var(--ease-out)",
      }}>
        <div style={{ padding: "24px 24px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <LogoLockup scale={0.9} />
          <button onClick={onClose} style={{ color: "var(--bone-300)", padding: 4 }}>
            <Icon name="close" size={18} />
          </button>
        </div>

        <div style={{ padding: "0 24px 24px" }}>
          <div className="hairline-gold" style={{ margin: "0 0 24px" }} />
          <div className="label-sm" style={{ marginBottom: 8 }}>Booked Event</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: "0.06em",
                        color: "var(--gold-100)", lineHeight: 1.2 }}>
            {client.eventType}<br/>
            <span style={{ fontFamily: "var(--font-serif)", textTransform: "none",
                          fontStyle: "italic", fontSize: 16, letterSpacing: 0, color: "var(--bone-200)" }}>
              {window.formatDate(client.eventDate, { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--bone-300)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
            {client.venue}
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {items.map(item => (
            <DrawerItem key={item.key} item={item} active={active === item.key}
                        onClick={() => !item.disabled && setActive(item.key)} />
          ))}
        </nav>

        <div style={{ padding: 24, borderTop: "1px solid var(--ink-400)" }}>
          <div className="label-sm" style={{ marginBottom: 10 }}>Your Phase</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 13,
                        letterSpacing: "0.1em", color: "var(--gold-200)", marginBottom: 12 }}>
            {window.getPhase(client.phaseIdx).label}
          </div>
          <PhaseDots currentIdx={client.phaseIdx} compact />
          <button onClick={onSignOut} className="btn btn-ghost btn-sm" style={{ width: "100%", marginTop: 24 }}>
            <Icon name="logout" size={14} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

const DrawerItem = ({ item, active, onClick }) => (
  <div onClick={onClick} style={{
    ...clientStyles.navItem,
    color: active ? "var(--gold-100)" : item.disabled ? "var(--bone-500)" : "var(--bone-200)",
    background: active ? "rgba(201,169,110,0.06)" : "transparent",
    borderLeft: active ? "2px solid var(--gold-300)" : "2px solid transparent",
    cursor: item.disabled ? "not-allowed" : "pointer",
  }}
  onMouseEnter={e => { if (!active && !item.disabled) e.currentTarget.style.color = "var(--gold-100)"; }}
  onMouseLeave={e => { if (!active && !item.disabled) e.currentTarget.style.color = "var(--bone-200)"; }}>
    <Icon name={item.icon} size={18} />
    <span style={{ flex: 1 }}>{item.label}</span>
    {item.badge > 0 && (
      <span style={{
        background: "var(--gold-300)", color: "var(--ink-050)",
        fontSize: 10, padding: "2px 7px", borderRadius: 9999,
        fontWeight: 600, letterSpacing: 0,
      }}>{item.badge}</span>
    )}
    {item.hint && (
      <span style={{ fontSize: 9, color: "var(--bone-500)", letterSpacing: "0.15em" }}>{item.hint}</span>
    )}
  </div>
);

// ============================================================
// WELCOME MODAL — fade-in on first access, phase update after
// ============================================================
const WelcomeModal = ({ firstVisit, client, onClose }) => {
  const phase = window.getPhase(client.phaseIdx);
  return (
    <Modal open={true} onClose={onClose} width={620}>
      <div style={{ textAlign: "center" }}>
        <Hairline />
        <div className="eyebrow" style={{ marginTop: 32 }}>
          {firstVisit ? "Welcome to your private studio" : "Project Update"}
        </div>
        <h2 className="display" style={{ fontSize: 36, margin: "20px 0 8px", lineHeight: 1.1 }}>
          {firstVisit ? "Hello," : "Where you are."}
        </h2>
        <div className="serif-italic gold-text" style={{
          fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400,
          fontSize: 36, lineHeight: 1.1, letterSpacing: "0.01em",
        }}>
          {client.name}.
        </div>
        <div style={{ marginTop: 36, fontFamily: "var(--font-serif)", fontSize: 18,
                      color: "var(--bone-200)", maxWidth: 460, margin: "36px auto 0", lineHeight: 1.5 }}>
          {firstVisit
            ? "This is your private space at Illuminate Studios. Here you'll find your contracts, your gallery, our correspondence, and everything we'll prepare for your day."
            : phase.description}
        </div>

        <div style={{ margin: "44px 0 32px" }}>
          <div className="label-sm" style={{ marginBottom: 16 }}>Current Phase</div>
          <div className="display gold-text" style={{ fontSize: 22, marginBottom: 20, letterSpacing: "0.12em" }}>
            {phase.label}
          </div>
          <PhaseDots currentIdx={client.phaseIdx} />
          <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", fontSize: 10, letterSpacing: "0.18em", color: "var(--bone-400)", textTransform: "uppercase" }}>
            <span>Enquiry</span>
            <span>Archived</span>
          </div>
        </div>

        <Hairline />
        <button className="btn btn-primary" onClick={onClose} style={{ marginTop: 32 }}>
          Enter your portal <Icon name="arrow" size={12} />
        </button>
      </div>
    </Modal>
  );
};

// ============================================================
// HOME VIEW
// ============================================================
const HomeView = ({ client, shootDelivered, setActive, onOpenWelcome }) => {
  const phase = window.getPhase(client.phaseIdx);
  const pkg = window.getPackage(client.package);

  return (
    <div className="fade-in">
      <SectionHeader
        eyebrow="— Your Portal"
        title="Overview"
        subtitle={`A private space for ${client.name.split(" ").slice(0,2).join(" ")}.`}
      />

      {/* Hero card with phase */}
      <div style={{
        background: "linear-gradient(135deg, var(--ink-200), var(--ink-100))",
        border: "1px solid var(--gold-500)",
        padding: 48,
        display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48,
        marginTop: 40, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -60, right: -60, width: 280, height: 280,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,169,110,0.15), transparent 70%)",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="eyebrow">— Current Phase · {client.phaseIdx + 1} of {window.PHASES.length}</div>
          <h3 className="display gold-text" style={{ fontSize: 40, margin: "16px 0 16px", letterSpacing: "0.08em" }}>
            {phase.label}
          </h3>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 19, color: "var(--bone-100)", maxWidth: 480 }}>
            {phase.description}
          </div>
          <div style={{ marginTop: 32 }}>
            <PhaseDots currentIdx={client.phaseIdx} />
          </div>
          <button className="btn btn-outline-gold btn-sm" style={{ marginTop: 32 }} onClick={onOpenWelcome}>
            View progression <Icon name="arrow" size={12} />
          </button>
        </div>
        <div style={{ position: "relative", zIndex: 1, borderLeft: "1px solid var(--ink-500)", paddingLeft: 48 }}>
          <div className="label-sm" style={{ marginBottom: 10 }}>Booked Event</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, letterSpacing: "0.06em" }}>
            {client.eventType}
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 18,
                        color: "var(--bone-200)", marginTop: 4 }}>
            {window.formatDate(client.eventDate)}
          </div>
          <div style={{ fontFamily: "var(--font-serif)", color: "var(--bone-300)", fontSize: 15, marginTop: 4 }}>
            {client.venue}
          </div>

          <div className="hairline" style={{ margin: "32px 0 24px" }} />
          <div className="label-sm" style={{ marginBottom: 10 }}>Collection</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--gold-100)" }}>
            {pkg.tier}
          </div>
          <div style={{ color: "var(--bone-300)", fontFamily: "var(--font-serif)", fontSize: 14, marginTop: 4 }}>
            {pkg.duration}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        <QuickCard
          icon={shootDelivered ? "gallery" : "calendar"}
          title={shootDelivered ? "Your Gallery" : "Pre-Shoot Plan"}
          desc={shootDelivered ? "Browse and select your favourite frames for prints." : "We'll share location and timeline notes here, four weeks ahead."}
          cta={shootDelivered ? "View Gallery" : "View Plan"}
          onClick={() => setActive(shootDelivered ? "gallery" : "documents")}
        />
        <QuickCard
          icon="inbox"
          title="Inbox"
          desc="Agreements and questionnaires from the studio."
          cta="Open Inbox"
          onClick={() => setActive("inbox")}
        />
        <QuickCard
          icon={shootDelivered ? "image" : "pricing"}
          title={shootDelivered ? "Print Collection" : "Investment"}
          desc={shootDelivered ? "Choose fine-art prints from your gallery." : "Your package and add-ons."}
          cta="View"
          onClick={() => setActive("pricing")}
        />
      </div>
    </div>
  );
};

const QuickCard = ({ icon, title, desc, cta, onClick }) => (
  <div onClick={onClick} className="card"
       style={{ cursor: "pointer", transition: "all 200ms" }}
       onMouseEnter={e => e.currentTarget.style.borderColor = "var(--gold-400)"}
       onMouseLeave={e => e.currentTarget.style.borderColor = "var(--ink-400)"}>
    <div style={{ color: "var(--gold-300)", marginBottom: 20 }}>
      <Icon name={icon} size={26} stroke={1.2} />
    </div>
    <div style={{ fontFamily: "var(--font-display)", fontSize: 16, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
      {title}
    </div>
    <div style={{ color: "var(--bone-300)", fontFamily: "var(--font-serif)", fontSize: 15, marginBottom: 24 }}>
      {desc}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--gold-200)", fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase" }}>
      {cta} <Icon name="arrow" size={12} />
    </div>
  </div>
);

// ============================================================
// SECTION HEADER
// ============================================================
const SectionHeader = ({ eyebrow, title, subtitle, action }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2 className="display" style={{ fontSize: 44, margin: "12px 0 8px", lineHeight: 1, letterSpacing: "0.06em" }}>
          {title}
        </h2>
        {subtitle && (
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontStyle: "italic", color: "var(--bone-300)" }}>
            {subtitle}
          </div>
        )}
      </div>
      {action}
    </div>
    <div className="hairline" style={{ marginTop: 32 }} />
  </div>
);

// ============================================================
// GALLERY — with selection moving into folder
// ============================================================
const GalleryView = ({ photos, selected, setSelected }) => {
  const [folder, setFolder] = useState("all"); // "all" or "selected"
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const toast = useToast();

  const visible = folder === "selected"
    ? photos.filter(p => selected.has(p.id))
    : photos.filter(p => !selected.has(p.id));

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast("Moved back to All Proofs");
      } else {
        next.add(id);
        toast("Moved to Selections folder");
      }
      return next;
    });
  };

  return (
    <div className="fade-in">
      <SectionHeader
        eyebrow="— Your Private Gallery · 248 Frames"
        title="The Whitfield Collection"
        subtitle="Tap a frame to select it for your print collection. Selected images are saved to a separate folder."
        action={
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-ghost btn-sm">
              <Icon name="download" size={14} /> Download all
            </button>
            <button className="btn btn-outline-gold btn-sm">
              <Icon name="check" size={14} /> Finalise ({selected.size})
            </button>
          </div>
        }
      />

      {/* Folder tabs */}
      <div style={{ display: "flex", gap: 4, margin: "32px 0 24px", borderBottom: "1px solid var(--ink-400)" }}>
        <FolderTab
          icon="folder" label="All Proofs"
          count={photos.length - selected.size}
          active={folder === "all"}
          onClick={() => setFolder("all")}
        />
        <FolderTab
          icon="heart" label="My Selections"
          count={selected.size}
          active={folder === "selected"}
          onClick={() => setFolder("selected")}
          accent
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={folder === "selected" ? "heart" : "folder"}
          title={folder === "selected" ? "No selections yet" : "All frames have been selected"}
          desc={folder === "selected"
            ? "Tap any frame in All Proofs to add it to your selections folder."
            : "Every frame is currently in your Selections folder. Switch tabs to view."}
        />
      ) : (
        <div style={{
          columnCount: 4,
          columnGap: 8,
        }}>
          {visible.map((p, i) => (
            <PhotoCard
              key={p.id} photo={p}
              isSelected={selected.has(p.id)}
              onToggle={() => toggle(p.id)}
              onOpen={() => setLightboxIdx(i)}
            />
          ))}
        </div>
      )}

      {lightboxIdx !== null && (
        <Lightbox
          photos={visible}
          idx={lightboxIdx}
          setIdx={setLightboxIdx}
          isSelected={(p) => selected.has(p.id)}
          onToggle={toggle}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </div>
  );
};

const FolderTab = ({ icon, label, count, active, onClick, accent }) => (
  <button onClick={onClick} style={{
    padding: "14px 24px",
    color: active ? "var(--gold-100)" : "var(--bone-300)",
    borderBottom: `1px solid ${active ? "var(--gold-300)" : "transparent"}`,
    fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 500,
    display: "flex", alignItems: "center", gap: 10, marginBottom: -1,
    transition: "color 200ms",
  }}>
    <Icon name={icon} size={14} />
    {label}
    <span style={{
      background: active ? (accent ? "var(--gold-300)" : "var(--ink-400)") : "var(--ink-300)",
      color: active && accent ? "var(--ink-050)" : "var(--bone-200)",
      fontSize: 10, padding: "2px 8px", borderRadius: 9999,
      letterSpacing: 0, fontWeight: 600,
    }}>{count}</span>
  </button>
);

const PhotoCard = ({ photo, isSelected, onToggle, onOpen }) => (
  <div style={{
    breakInside: "avoid",
    marginBottom: 8,
    position: "relative",
    cursor: "pointer",
    overflow: "hidden",
  }}
  onClick={onOpen}>
    <img src={photo.src} alt={photo.label}
         style={{
           width: "100%", height: "auto", display: "block",
           transition: "all 400ms var(--ease-out)",
           filter: isSelected ? "none" : "grayscale(0.15)",
           opacity: isSelected ? 1 : 0.92,
         }} />
    {/* Overlay */}
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.7) 100%)",
      opacity: 0, transition: "opacity 200ms",
      pointerEvents: "none",
    }}
    className="photo-overlay" />
    {/* Heart toggle */}
    <button
      onClick={e => { e.stopPropagation(); onToggle(); }}
      style={{
        position: "absolute", top: 12, right: 12,
        width: 36, height: 36, borderRadius: "50%",
        background: isSelected ? "var(--gold-300)" : "rgba(10,10,10,0.6)",
        border: `1px solid ${isSelected ? "var(--gold-300)" : "rgba(255,255,255,0.2)"}`,
        color: isSelected ? "var(--ink-050)" : "var(--bone-100)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 200ms",
      }}>
      <Icon name="heart" size={16} stroke={isSelected ? 2 : 1.5} />
    </button>
    {isSelected && (
      <div style={{
        position: "absolute", bottom: 12, left: 12,
        background: "rgba(10,10,10,0.85)", backdropFilter: "blur(8px)",
        color: "var(--gold-200)",
        padding: "4px 10px", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
        border: "1px solid var(--gold-500)",
      }}>Selected</div>
    )}
  </div>
);

const Lightbox = ({ photos, idx, setIdx, isSelected, onToggle, onClose }) => {
  const p = photos[idx];
  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx(i => Math.min(i + 1, photos.length - 1));
      if (e.key === "ArrowLeft")  setIdx(i => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photos.length]);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(5,5,5,0.95)",
      backdropFilter: "blur(20px)",
      zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fade-in var(--dur-med) var(--ease-out)",
    }}>
      <button onClick={onClose} style={{ position: "absolute", top: 32, right: 32, color: "var(--bone-200)", padding: 8 }}>
        <Icon name="close" size={24} />
      </button>
      <button onClick={() => setIdx(i => Math.max(i - 1, 0))} disabled={idx === 0}
              style={{ position: "absolute", left: 32, color: "var(--bone-200)", padding: 8, opacity: idx === 0 ? 0.3 : 1 }}>
        <Icon name="chevronL" size={32} />
      </button>
      <button onClick={() => setIdx(i => Math.min(i + 1, photos.length - 1))} disabled={idx === photos.length - 1}
              style={{ position: "absolute", right: 32, color: "var(--bone-200)", padding: 8, opacity: idx === photos.length - 1 ? 0.3 : 1 }}>
        <Icon name="chevronR" size={32} />
      </button>
      <div style={{ maxWidth: "85vw", maxHeight: "85vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <img src={p.src.replace("w=1200", "w=1800")} style={{ maxWidth: "100%", maxHeight: "75vh", boxShadow: "0 40px 100px rgba(0,0,0,0.8)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div className="label-sm">{p.label} · {idx + 1} of {photos.length}</div>
          <button className={isSelected(p) ? "btn btn-primary btn-sm" : "btn btn-outline-gold btn-sm"}
                  onClick={() => onToggle(p.id)}>
            <Icon name="heart" size={12} /> {isSelected(p) ? "In Selections" : "Add to Selections"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// INBOX
// ============================================================
const InboxView = ({ inbox, setInbox, documents, setDocuments }) => {
  const [openId, setOpenId] = useState(null);
  const open = inbox.find(i => i.id === openId);
  const toast = useToast();

  const onSign = (item) => {
    // Move from inbox → documents
    const newDoc = {
      id: "d" + Date.now(),
      title: item.title,
      type: "Release",
      status: "signed",
      signedAt: new Date().toISOString().slice(0, 10),
      size: "294 KB",
      pages: item.pages
    };
    setDocuments(d => [newDoc, ...d]);
    setInbox(i => i.filter(x => x.id !== item.id));
    setOpenId(null);
    toast(`"${item.title}" signed and moved to Documents`);
  };

  const markRead = (id) => {
    setInbox(items => items.map(i => i.id === id ? { ...i, read: true } : i));
  };

  return (
    <div className="fade-in">
      <SectionHeader
        eyebrow="— Inbox"
        title="Correspondence"
        subtitle="Documents and agreements from the studio. Once signed, they're filed in Documents."
      />

      <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "440px 1fr", gap: 32 }}>
        {/* List */}
        <div style={{ borderRight: "1px solid var(--ink-400)", paddingRight: 32 }}>
          <div className="label-sm" style={{ marginBottom: 16 }}>
            {inbox.length} message{inbox.length !== 1 ? "s" : ""}
          </div>
          {inbox.length === 0 ? (
            <EmptyState icon="inbox" title="Inbox empty" desc="Nothing waiting for you." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {inbox.map(item => (
                <InboxRow key={item.id}
                          item={item}
                          active={openId === item.id}
                          onClick={() => { setOpenId(item.id); markRead(item.id); }} />
              ))}
            </div>
          )}
        </div>

        {/* Reader */}
        <div>
          {open ? (
            <InboxReader item={open} onSign={() => onSign(open)} />
          ) : (
            <div style={{ padding: 60, textAlign: "center", color: "var(--bone-400)",
                          fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 18 }}>
              Select a message to view.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InboxRow = ({ item, active, onClick }) => (
  <button onClick={onClick} style={{
    textAlign: "left", padding: "20px 18px",
    background: active ? "var(--ink-200)" : "transparent",
    borderLeft: active ? "2px solid var(--gold-300)" : "2px solid transparent",
    display: "flex", gap: 12, alignItems: "flex-start",
    transition: "background 200ms",
  }}
  onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--ink-100)"; }}
  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
    <div style={{
      width: 8, height: 8, borderRadius: "50%",
      background: item.read ? "transparent" : "var(--gold-300)",
      marginTop: 8, flexShrink: 0,
    }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontFamily: "var(--font-display)", fontSize: 13,
        letterSpacing: "0.06em", color: item.read ? "var(--bone-200)" : "var(--gold-100)",
        textTransform: "uppercase", marginBottom: 4,
      }}>
        {item.title}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "var(--bone-400)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {item.from}
        </span>
        <span style={{ fontSize: 11, color: "var(--bone-400)" }}>
          {window.formatDate(item.sentAt, { day: "numeric", month: "short" })}
        </span>
      </div>
      <div style={{ fontSize: 13, color: "var(--bone-300)", fontFamily: "var(--font-serif)",
                    overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {item.preview}
      </div>
      {item.requiresSignature && (
        <span className="badge badge-gold" style={{ marginTop: 10 }}>
          <Icon name="edit" size={10} /> Signature required
        </span>
      )}
    </div>
  </button>
);

const InboxReader = ({ item, onSign }) => {
  const [signing, setSigning] = useState(false);
  const [signature, setSignature] = useState("");

  return (
    <div className="card-elev" style={{ padding: 40 }}>
      <div className="label-sm" style={{ marginBottom: 10 }}>
        Sent by {item.from} · {window.formatDate(item.sentAt)}
      </div>
      <h3 className="display" style={{ fontSize: 26, margin: "8px 0 24px", lineHeight: 1.2 }}>
        {item.title}
      </h3>
      {item.requiresSignature && (
        <span className="badge badge-gold">
          <Icon name="edit" size={10} /> Signature required · {item.pages} pages
        </span>
      )}

      <div className="hairline" style={{ margin: "32px 0" }} />

      {/* Mock document preview */}
      <div style={{
        background: "#f4ebd9", color: "#1a1a1a", padding: "48px 56px",
        fontFamily: "var(--font-serif)", lineHeight: 1.6,
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        position: "relative",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-display)", letterSpacing: "0.3em",
                        fontSize: 14, color: "#8a6f3e", textTransform: "uppercase" }}>
            Illuminate Studios
          </div>
          <div style={{ width: 40, height: 1, background: "#8a6f3e", margin: "12px auto" }} />
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: "0.15em",
                       textTransform: "uppercase", margin: 0, fontWeight: 400 }}>
            {item.title}
          </h4>
        </div>
        <p style={{ fontSize: 14 }}>{item.preview}</p>
        <p style={{ fontSize: 14 }}>
          This release is entirely <em>optional</em>. By signing below, you grant Illuminate Studios
          a non-exclusive licence to feature select images from your collection in our portfolio,
          website, and editorial submissions. No images will be sold or licensed to third parties
          without your express permission.
        </p>
        <p style={{ fontSize: 14 }}>
          You may revoke this consent at any time by written notice. Print delivery, gallery hosting,
          and all primary services are unaffected by this decision.
        </p>

        {signing && (
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px dashed #8a6f3e" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a6f3e", marginBottom: 12 }}>
              Sign your name below
            </div>
            <input value={signature} onChange={e => setSignature(e.target.value)}
                   placeholder="Type your full name"
                   style={{ width: "100%", border: 0, borderBottom: "1px solid #8a6f3e",
                            background: "transparent", padding: "8px 0",
                            fontFamily: "Cormorant Garamond, serif", fontStyle: "italic",
                            fontSize: 28, color: "#1a1a1a" }} />
          </div>
        )}
      </div>

      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 12 }}>
        {!signing ? (
          <>
            <button className="btn btn-ghost">
              <Icon name="download" size={14} /> Download
            </button>
            {item.requiresSignature && (
              <button className="btn btn-primary" onClick={() => setSigning(true)}>
                <Icon name="edit" size={14} /> Begin Signing
              </button>
            )}
          </>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={() => { setSigning(false); setSignature(""); }}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={signature.length < 3} onClick={onSign}>
              <Icon name="check" size={14} /> Confirm &amp; Sign
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================
// DOCUMENTS
// ============================================================
const DocumentsView = ({ documents }) => (
  <div className="fade-in">
    <SectionHeader
      eyebrow="— Documents"
      title="Your Files"
      subtitle="Contracts, releases, and schedules. All signed and archived."
    />

    <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 1, background: "var(--ink-400)" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 160px 140px 140px 100px",
        padding: "16px 24px", background: "var(--ink-100)",
        fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
        color: "var(--bone-300)", fontWeight: 500,
      }}>
        <div>Document</div>
        <div>Type</div>
        <div>Signed</div>
        <div>Size</div>
        <div></div>
      </div>
      {documents.map(d => <DocRow key={d.id} doc={d} />)}
    </div>
  </div>
);

const DocRow = ({ doc }) => (
  <div style={{
    display: "grid", gridTemplateColumns: "1fr 160px 140px 140px 100px",
    padding: "20px 24px", background: "var(--ink-100)",
    alignItems: "center", transition: "background 200ms",
  }}
  onMouseEnter={e => e.currentTarget.style.background = "var(--ink-200)"}
  onMouseLeave={e => e.currentTarget.style.background = "var(--ink-100)"}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ color: "var(--gold-300)" }}>
        <Icon name="doc" size={20} />
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>
          {doc.title}
        </div>
        <div style={{ fontSize: 12, color: "var(--bone-400)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
          {doc.pages} pages
        </div>
      </div>
    </div>
    <div>
      <span className="badge badge-muted">{doc.type}</span>
    </div>
    <div style={{ color: "var(--bone-200)", fontSize: 14 }}>
      {window.formatDate(doc.signedAt, { day: "numeric", month: "short", year: "numeric" })}
    </div>
    <div style={{ color: "var(--bone-300)", fontSize: 13, fontFamily: "var(--font-mono)" }}>
      {doc.size}
    </div>
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
      <button style={{ color: "var(--bone-300)", padding: 6 }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--gold-200)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--bone-300)"}>
        <Icon name="eye" size={16} />
      </button>
      <button style={{ color: "var(--bone-300)", padding: 6 }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--gold-200)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--bone-300)"}>
        <Icon name="download" size={16} />
      </button>
    </div>
  </div>
);

// ============================================================
// EMPTY STATE
// ============================================================
const EmptyState = ({ icon, title, desc }) => (
  <div style={{ padding: 80, textAlign: "center", border: "1px dashed var(--ink-500)" }}>
    <div style={{ color: "var(--bone-500)", marginBottom: 20 }}>
      <Icon name={icon} size={40} stroke={1} />
    </div>
    <div className="display" style={{ fontSize: 18, color: "var(--bone-200)", marginBottom: 8 }}>{title}</div>
    <div style={{ color: "var(--bone-400)", fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 16 }}>{desc}</div>
  </div>
);

Object.assign(window, { ClientPortal });
