/* eslint-disable */
const adminStyles = {
  shell: {
    minHeight: "100vh",
    background: "var(--ink-050)",
    display: "grid",
    gridTemplateColumns: "260px 1fr",
  },
  sidebar: {
    borderRight: "1px solid var(--ink-400)",
    background: "var(--ink-100)",
    padding: "24px 0",
    position: "sticky", top: 0, height: "100vh",
    display: "flex", flexDirection: "column",
  },
  main: { padding: "40px 56px 80px", overflow: "auto" },
  navItem: {
    display: "flex", alignItems: "center", gap: 14,
    padding: "12px 24px",
    color: "var(--bone-200)",
    fontFamily: "var(--font-body)",
    fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase",
    cursor: "pointer", transition: "all 200ms",
  },
};

const AdminPortal = ({ onSignOut }) => {
  const [active, setActive] = useState("dashboard");

  const [bookings, setBookings] = useState(() =>
    JSON.parse(localStorage.getItem("is_bookings") || "null") || window.BOOKINGS_INITIAL);
  const [inquiries, setInquiries] = useState(() =>
    JSON.parse(localStorage.getItem("is_inquiries") || "null") || window.INQUIRIES_INITIAL);
  const [contacts, setContacts] = useState(() =>
    JSON.parse(localStorage.getItem("is_contacts") || "null") || window.CONTACTS_INITIAL);

  useEffect(() => { localStorage.setItem("is_bookings",  JSON.stringify(bookings));  }, [bookings]);
  useEffect(() => { localStorage.setItem("is_inquiries", JSON.stringify(inquiries)); }, [inquiries]);
  useEffect(() => { localStorage.setItem("is_contacts",  JSON.stringify(contacts));  }, [contacts]);

  return (
    <div style={adminStyles.shell}>
      <AdminSidebar active={active} setActive={setActive} onSignOut={onSignOut}
                    newInquiries={inquiries.filter(i => i.status === "new").length} />
      <main style={adminStyles.main}>
        {active === "dashboard" && <AdminDashboard bookings={bookings} inquiries={inquiries} contacts={contacts} setActive={setActive} />}
        {active === "bookings"  && <AdminBookings bookings={bookings} setBookings={setBookings} />}
        {active === "inquiries" && <AdminInquiries inquiries={inquiries} setInquiries={setInquiries} setBookings={setBookings} />}
        {active === "tracker"   && <AdminTracker bookings={bookings} setBookings={setBookings} />}
        {active === "contacts"  && <AdminContacts contacts={contacts} setContacts={setContacts} bookings={bookings} />}
        {active === "content"   && <AdminContent />}
      </main>
    </div>
  );
};

// ============================================================
// SIDEBAR
// ============================================================
const AdminSidebar = ({ active, setActive, onSignOut, newInquiries }) => (
  <aside style={adminStyles.sidebar}>
    <div style={{ padding: "0 24px 24px" }}>
      <LogoLockup scale={0.85} />
      <div style={{ marginTop: 8, fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase",
                    color: "var(--gold-300)", fontFamily: "var(--font-body)" }}>
        Studio Admin
      </div>
    </div>
    <div className="hairline-gold" style={{ margin: "0 24px 16px" }} />
    <nav style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AdminNavItem icon="sparkle" label="Dashboard" active={active === "dashboard"} onClick={() => setActive("dashboard")} />
      <AdminNavItem icon="calendar" label="Bookings" active={active === "bookings"} onClick={() => setActive("bookings")} />
      <AdminNavItem icon="inbox" label="Inquiries" active={active === "inquiries"} onClick={() => setActive("inquiries")} badge={newInquiries} />
      <AdminNavItem icon="camera" label="Shoot Tracker" active={active === "tracker"} onClick={() => setActive("tracker")} />
      <AdminNavItem icon="users" label="Contacts" active={active === "contacts"} onClick={() => setActive("contacts")} />
      <AdminNavItem icon="settings" label="Site Content" active={active === "content"} onClick={() => setActive("content")} />
    </nav>
    <div style={{ padding: 24, borderTop: "1px solid var(--ink-400)" }}>
      <div style={{ marginBottom: 14 }}>
        <ThemeToggle />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "var(--ink-300)", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", color: "var(--gold-200)",
          fontSize: 12, letterSpacing: "0.1em",
        }}>VC</div>
        <div>
          <div style={{ fontSize: 13, fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}>Victoria Caine</div>
          <div style={{ fontSize: 10, color: "var(--bone-400)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Studio Director</div>
        </div>
      </div>
      <button onClick={onSignOut} className="btn btn-ghost btn-sm" style={{ width: "100%" }}>
        <Icon name="logout" size={14} /> Sign out
      </button>
    </div>
  </aside>
);

const AdminNavItem = ({ icon, label, active, onClick, badge }) => (
  <div onClick={onClick} style={{
    ...adminStyles.navItem,
    color: active ? "var(--gold-100)" : "var(--bone-200)",
    background: active ? "rgba(201,169,110,0.06)" : "transparent",
    borderLeft: active ? "2px solid var(--gold-300)" : "2px solid transparent",
  }}
  onMouseEnter={e => { if (!active) e.currentTarget.style.color = "var(--gold-100)"; }}
  onMouseLeave={e => { if (!active) e.currentTarget.style.color = "var(--bone-200)"; }}>
    <Icon name={icon} size={16} />
    <span style={{ flex: 1 }}>{label}</span>
    {badge > 0 && (
      <span style={{
        background: "var(--gold-300)", color: "var(--ink-050)",
        fontSize: 10, padding: "2px 7px", borderRadius: 9999,
        fontWeight: 600, letterSpacing: 0,
      }}>{badge}</span>
    )}
  </div>
);

// ============================================================
// DASHBOARD
// ============================================================
const AdminDashboard = ({ bookings, inquiries, contacts, setActive }) => {
  const revenue = bookings.filter(b => b.status === "confirmed").reduce((s, b) => s + b.value, 0);
  const upcoming = bookings.filter(b => new Date(b.date) > new Date(2026, 4, 14)).sort((a, b) => a.date.localeCompare(b.date));
  const inProgress = bookings.filter(b => b.phase >= 2 && b.phase < 7);

  return (
    <div className="fade-in">
      <SectionHeader
        eyebrow={`Welcome back · ${new Date(2026, 4, 14).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}`}
        title="Studio Dashboard"
        subtitle="A view of the season."
      />
      <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
        <KpiCard label="Active Bookings" value={bookings.filter(b => b.status === "confirmed").length} hint="this season"/>
        <KpiCard label="New Inquiries" value={inquiries.filter(i => i.status === "new").length} hint="awaiting response" accent/>
        <KpiCard label="Season Revenue" value={`${(revenue / 1000).toFixed(1)}k`} hint="AUD · confirmed" />
        <KpiCard label="Contacts" value={contacts.length} hint="in the book" />
      </div>

      <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 32 }}>
        {/* Upcoming */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div className="label-sm">Upcoming Shoots</div>
            <button onClick={() => setActive("bookings")} style={{ fontSize: 11, color: "var(--gold-200)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              View all
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--ink-400)" }}>
            {upcoming.slice(0, 5).map(b => <UpcomingRow key={b.id} booking={b} />)}
          </div>
        </div>

        {/* Activity */}
        <div>
          <div className="label-sm" style={{ marginBottom: 20 }}>Recent Activity</div>
          <div style={{ background: "var(--ink-100)", border: "1px solid var(--ink-400)", padding: 24 }}>
            <Activity time="2h" text="Eleanor Whitfield viewed her gallery" />
            <Activity time="6h" text="Sofia Marchetti signed Wedding Agreement" />
            <Activity time="1d" text="New inquiry from Astrid Lindqvist (Sep 12)" gold />
            <Activity time="2d" text="Adaeze Okonkwo paid Essentials retainer (960)" />
            <Activity time="3d" text="Beatrice Holloway · gallery delivered (218 images)" />
            <Activity time="5d" text="Theo & Marcus Aldridge moved to Confirmed" last />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 48 }}>
        <div className="label-sm" style={{ marginBottom: 20 }}>In Progress · {inProgress.length} active projects</div>
        <ProgressLane bookings={inProgress} />
      </div>
    </div>
  );
};

const KpiCard = ({ label, value, hint, accent }) => (
  <div className="card" style={{
    background: accent ? "linear-gradient(180deg, var(--ink-200), var(--ink-100))" : "var(--ink-100)",
    border: `1px solid ${accent ? "var(--gold-400)" : "var(--ink-400)"}`,
    padding: 28,
  }}>
    <div className="label-sm" style={{ color: accent ? "var(--gold-200)" : "var(--bone-300)" }}>{label}</div>
    <div className={accent ? "gold-text" : ""} style={{
      fontFamily: "var(--font-display)", fontSize: 44, letterSpacing: "0.04em",
      margin: "16px 0 4px", lineHeight: 1,
    }}>{value}</div>
    <div style={{ fontSize: 12, color: "var(--bone-400)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>{hint}</div>
  </div>
);

const UpcomingRow = ({ booking }) => {
  const days = Math.ceil((new Date(booking.date) - new Date(2026, 4, 14)) / 86400000);
  return (
    <div style={{
      background: "var(--ink-100)", padding: "16px 20px",
      display: "grid", gridTemplateColumns: "60px 1fr 140px 100px", alignItems: "center", gap: 16,
    }}>
      <div style={{ textAlign: "center", padding: "8px 0", border: "1px solid var(--ink-500)" }}>
        <div className="numeric gold-text" style={{ fontFamily: "var(--font-display)", fontSize: 20, lineHeight: 1 }}>
          {new Date(booking.date).getDate()}
        </div>
        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "var(--bone-300)", textTransform: "uppercase", marginTop: 2 }}>
          {new Date(booking.date).toLocaleDateString("en-AU", { month: "short" })}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {booking.clientName}
        </div>
        <div style={{ fontSize: 12, color: "var(--bone-300)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
          {booking.eventType} · {booking.venue}
        </div>
      </div>
      <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--bone-300)" }}>
        {days <= 0 ? "Today" : `In ${days} days`}
      </div>
      <span className={booking.status === "confirmed" ? "badge badge-success" : "badge badge-info"}>
        {booking.status}
      </span>
    </div>
  );
};

const Activity = ({ time, text, gold, last }) => (
  <div style={{
    display: "flex", gap: 16, padding: "12px 0",
    borderBottom: last ? "none" : "1px solid var(--ink-400)",
  }}>
    <div style={{ width: 36, fontSize: 10, color: gold ? "var(--gold-300)" : "var(--bone-400)", letterSpacing: "0.15em", textTransform: "uppercase", flexShrink: 0, paddingTop: 2 }}>
      {time} ago
    </div>
    <div style={{ flex: 1, fontSize: 13, color: gold ? "var(--gold-100)" : "var(--bone-200)", fontFamily: "var(--font-serif)", fontSize: 15 }}>
      {text}
    </div>
  </div>
);

const ProgressLane = ({ bookings }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${window.PHASES.length - 2}, 1fr)`, gap: 1, background: "var(--ink-400)" }}>
    {window.PHASES.slice(1, -1).map((phase, idx) => {
      const realIdx = idx + 1;
      const at = bookings.filter(b => b.phase === realIdx);
      return (
        <div key={phase.key} style={{ background: "var(--ink-100)", padding: 16, minHeight: 160 }}>
          <div className="eyebrow" style={{ fontSize: 9, letterSpacing: "0.2em", marginBottom: 12 }}>
            {phase.label}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--gold-200)", marginBottom: 16, lineHeight: 1 }}>
            {at.length}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {at.slice(0, 3).map(b => (
              <div key={b.id} style={{ fontSize: 11, color: "var(--bone-200)", padding: "4px 8px",
                                       background: "var(--ink-200)", border: "1px solid var(--ink-400)",
                                       fontFamily: "var(--font-serif)", fontSize: 12 }}>
                {b.clientName.split(" · ")[0]}
              </div>
            ))}
            {at.length > 3 && <div style={{ fontSize: 10, color: "var(--bone-400)" }}>+ {at.length - 3} more</div>}
          </div>
        </div>
      );
    })}
  </div>
);

// ============================================================
// BOOKINGS
// ============================================================
const AdminBookings = ({ bookings, setBookings }) => {
  const [filter, setFilter] = useState("all");
  const filtered = bookings.filter(b => filter === "all" ? true : b.status === filter);

  return (
    <div className="fade-in">
      <SectionHeader
        eyebrow="— Schedule"
        title="Bookings"
        subtitle="Every confirmed and pending shoot in the system."
        action={<button className="btn btn-primary btn-sm"><Icon name="plus" size={12} /> New Booking</button>}
      />
      <div style={{ display: "flex", gap: 4, margin: "32px 0 24px", borderBottom: "1px solid var(--ink-400)" }}>
        <FilterTab label="All" count={bookings.length} active={filter === "all"} onClick={() => setFilter("all")} />
        <FilterTab label="Confirmed" count={bookings.filter(b => b.status === "confirmed").length} active={filter === "confirmed"} onClick={() => setFilter("confirmed")} />
        <FilterTab label="Pending"   count={bookings.filter(b => b.status === "pending").length} active={filter === "pending"} onClick={() => setFilter("pending")} />
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 0.8fr 0.6fr",
        padding: "16px 24px", background: "var(--ink-100)",
        fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
        color: "var(--bone-300)", fontWeight: 500, border: "1px solid var(--ink-400)", borderBottom: "none",
      }}>
        <div>Client</div><div>Event</div><div>Date</div><div>Venue</div><div>Value</div><div>Status</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--ink-400)",
                    border: "1px solid var(--ink-400)", borderTop: "none" }}>
        {filtered.map(b => (
          <div key={b.id} style={{
            display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 0.8fr 0.6fr",
            padding: "18px 24px", background: "var(--ink-100)", alignItems: "center",
            transition: "background 200ms", cursor: "pointer",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--ink-200)"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--ink-100)"}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {b.clientName}
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--bone-200)" }}>{b.eventType}</div>
            <div className="numeric" style={{ color: "var(--bone-200)" }}>{window.formatDate(b.date, { day: "2-digit", month: "short", year: "2-digit" })}</div>
            <div style={{ color: "var(--bone-300)", fontSize: 13, fontFamily: "var(--font-serif)" }}>{b.venue}</div>
            <div className="numeric gold-text" style={{ fontFamily: "var(--font-display)", fontSize: 14 }}>{window.amount(b.value)}</div>
            <div><span className={b.status === "confirmed" ? "badge badge-success" : "badge badge-info"}>{b.status}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FilterTab = ({ label, count, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: "12px 20px",
    color: active ? "var(--gold-100)" : "var(--bone-300)",
    borderBottom: `1px solid ${active ? "var(--gold-300)" : "transparent"}`,
    fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 500,
    display: "flex", alignItems: "center", gap: 10, marginBottom: -1,
  }}>
    {label}
    <span style={{
      background: active ? "var(--ink-400)" : "var(--ink-300)",
      fontSize: 10, padding: "2px 8px", letterSpacing: 0, fontWeight: 600,
    }}>{count}</span>
  </button>
);

// ============================================================
// INQUIRIES — accept → moves to bookings
// ============================================================
const AdminInquiries = ({ inquiries, setInquiries, setBookings }) => {
  const [openId, setOpenId] = useState(inquiries[0]?.id);
  const open = inquiries.find(i => i.id === openId);
  const toast = useToast();

  const accept = (q) => {
    setBookings(b => [...b, {
      id: "b" + Date.now(),
      clientName: q.name.split(" ").slice(-1)[0] + " · " + q.name,
      eventType: q.type, date: q.date, venue: "TBC",
      phase: 1, package: "signature", status: "pending",
      value: 4600,
    }]);
    setInquiries(i => i.filter(x => x.id !== q.id));
    toast(`Booking created for ${q.name}`);
  };

  const decline = (q) => {
    setInquiries(i => i.map(x => x.id === q.id ? { ...x, status: "declined" } : x));
    toast(`Inquiry from ${q.name} declined`);
  };

  return (
    <div className="fade-in">
      <SectionHeader
        eyebrow={`— ${inquiries.filter(i => i.status === "new").length} new`}
        title="Inquiries"
        subtitle="Booking requests from the landing page. Accept to create a new booking and send the agreement."
      />
      <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "400px 1fr", gap: 32 }}>
        <div>
          {inquiries.map(q => (
            <button key={q.id} onClick={() => setOpenId(q.id)} style={{
              width: "100%", textAlign: "left", padding: "18px 16px",
              background: openId === q.id ? "var(--ink-200)" : "var(--ink-100)",
              borderLeft: openId === q.id ? "2px solid var(--gold-300)" : "2px solid transparent",
              marginBottom: 1, display: "flex", gap: 12, alignItems: "flex-start",
              border: "1px solid var(--ink-400)",
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: q.status === "new" ? "var(--gold-300)" : "var(--bone-500)",
                marginTop: 8, flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
                  {q.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--bone-300)", fontFamily: "var(--font-serif)", fontStyle: "italic", marginBottom: 6 }}>
                  {q.type} · {window.formatDate(q.date, { day: "numeric", month: "short", year: "2-digit" })}
                </div>
                <div style={{ fontSize: 12, color: "var(--bone-400)", overflow: "hidden", textOverflow: "ellipsis",
                              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", fontFamily: "var(--font-serif)", fontSize: 14 }}>
                  {q.message}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div>
          {open && (
            <div className="card-elev" style={{ padding: 36 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                  <div className="label-sm" style={{ marginBottom: 8 }}>Received {window.formatDate(open.receivedAt)}</div>
                  <h3 className="display" style={{ fontSize: 24, margin: 0, lineHeight: 1.2, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {open.name}
                  </h3>
                  <div style={{ marginTop: 8, fontSize: 14, color: "var(--bone-300)", fontFamily: "var(--font-serif)" }}>
                    {open.email}
                  </div>
                </div>
                <span className={open.status === "new" ? "badge badge-gold" : open.status === "declined" ? "badge badge-muted" : "badge badge-info"}>
                  {open.status}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
                <Detail label="Date" value={window.formatDate(open.date)} />
                <Detail label="Event" value={open.type} />
                <Detail label="Email" value={open.email} />
              </div>
              <div className="hairline" />
              <div style={{ margin: "24px 0", fontFamily: "var(--font-serif)", fontSize: 17, lineHeight: 1.55, color: "var(--bone-100)" }}>
                {open.message}
              </div>
              <div className="hairline" />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
                {open.status === "new" && (
                  <>
                    <button className="btn btn-ghost" onClick={() => decline(open)}>Decline</button>
                    <button className="btn btn-outline-gold">Reply</button>
                    <button className="btn btn-primary" onClick={() => accept(open)}>
                      <Icon name="check" size={14} /> Accept & Create Booking
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <div className="label-sm" style={{ marginBottom: 6 }}>{label}</div>
    <div style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: "0.05em", color: "var(--gold-100)" }}>{value}</div>
  </div>
);

// ============================================================
// SHOOT TRACKER — drag-or-click phase progression
// ============================================================
const AdminTracker = ({ bookings, setBookings }) => {
  const [focusId, setFocusId] = useState(bookings[0]?.id);
  const focus = bookings.find(b => b.id === focusId);
  const toast = useToast();

  const advance = (id, newPhase) => {
    setBookings(bs => bs.map(b => b.id === id ? { ...b, phase: newPhase } : b));
    const client = bookings.find(b => b.id === id);
    toast(`${client.clientName.split(" · ")[1] || client.clientName} → ${window.PHASES[newPhase].label}`);
  };

  return (
    <div className="fade-in">
      <SectionHeader
        eyebrow="— Client Pipeline"
        title="Shoot Tracker"
        subtitle="Update each client's phase. Changes are reflected in their portal welcome modal on next visit."
      />

      <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 380px", gap: 32 }}>
        {/* List + phases */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {bookings.map(b => (
            <TrackerCard key={b.id} booking={b} active={focusId === b.id}
                         onClick={() => setFocusId(b.id)}
                         onAdvance={(p) => advance(b.id, p)} />
          ))}
        </div>

        {/* Detail panel */}
        <aside>
          {focus && (
            <div className="card-elev" style={{ padding: 28, position: "sticky", top: 24 }}>
              <div className="label-sm" style={{ marginBottom: 8 }}>{focus.eventType}</div>
              <h3 className="display" style={{ fontSize: 20, lineHeight: 1.2, margin: 0, letterSpacing: "0.06em" }}>
                {focus.clientName}
              </h3>
              <div style={{ marginTop: 8, fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--bone-300)" }}>
                {window.formatDate(focus.date)} · {focus.venue}
              </div>

              <div className="hairline" style={{ margin: "24px 0" }} />

              <div className="label-sm" style={{ marginBottom: 12 }}>Phase History</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {window.PHASES.map((p, idx) => (
                  <button key={p.key} onClick={() => advance(focus.id, idx)} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                    background: idx === focus.phase ? "rgba(201,169,110,0.08)" : "var(--ink-200)",
                    borderLeft: idx === focus.phase ? "2px solid var(--gold-300)" : "2px solid transparent",
                    textAlign: "left", transition: "background 200ms",
                  }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: "50%",
                      border: `1px solid ${idx <= focus.phase ? "var(--gold-300)" : "var(--ink-500)"}`,
                      background: idx < focus.phase ? "var(--gold-300)" : idx === focus.phase ? "var(--gold-300)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {idx < focus.phase && <Icon name="check" size={9} stroke={3} />}
                    </div>
                    <div style={{
                      fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase",
                      color: idx <= focus.phase ? "var(--gold-100)" : "var(--bone-300)",
                      fontFamily: "var(--font-display)",
                    }}>
                      {p.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

const TrackerCard = ({ booking, active, onClick, onAdvance }) => (
  <div onClick={onClick} style={{
    background: "var(--ink-100)",
    border: `1px solid ${active ? "var(--gold-400)" : "var(--ink-400)"}`,
    padding: 24, cursor: "pointer", transition: "border-color 200ms",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {booking.clientName}
        </div>
        <div style={{ fontSize: 12, color: "var(--bone-300)", fontFamily: "var(--font-serif)", fontStyle: "italic", marginTop: 2 }}>
          {booking.eventType} · {window.formatDate(booking.date)}
        </div>
      </div>
      <div className="numeric gold-text" style={{ fontFamily: "var(--font-display)", fontSize: 14 }}>
        {window.PHASES[booking.phase].label}
      </div>
    </div>
    <PhaseTrack phase={booking.phase} onSet={onAdvance} />
  </div>
);

const PhaseTrack = ({ phase, onSet }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${window.PHASES.length}, 1fr)`, gap: 4 }}>
    {window.PHASES.map((p, idx) => (
      <button key={p.key} onClick={e => { e.stopPropagation(); onSet(idx); }} style={{
        height: 36, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
        background: idx <= phase ? "rgba(201,169,110,0.1)" : "var(--ink-200)",
        border: `1px solid ${idx === phase ? "var(--gold-300)" : idx < phase ? "var(--gold-500)" : "var(--ink-500)"}`,
        cursor: "pointer", transition: "all 200ms",
        position: "relative",
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: idx <= phase ? "var(--gold-300)" : "var(--ink-500)",
        }} />
        <div style={{
          fontSize: 8, letterSpacing: "0.15em", textTransform: "uppercase",
          color: idx <= phase ? "var(--gold-200)" : "var(--bone-400)",
          fontFamily: "var(--font-body)", fontWeight: 500,
          whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden",
          maxWidth: "100%",
        }}>
          {p.label.split(" ")[0]}
        </div>
      </button>
    ))}
  </div>
);

// ============================================================
// CONTACTS
// ============================================================
const AdminContacts = ({ contacts, setContacts, bookings }) => {
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState("");
  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAssign = (id) => {
    setContacts(cs => cs.map(c => c.id === id ? { ...c, assigned: !c.assigned } : c));
  };

  return (
    <div className="fade-in">
      <SectionHeader
        eyebrow="— Contact Book"
        title="Contacts"
        subtitle="Past, present and prospective clients. Assigned contacts have a live portal account."
        action={<button className="btn btn-primary btn-sm"><Icon name="plus" size={12} /> Add Contact</button>}
      />
      <div style={{ marginTop: 32, marginBottom: 24, position: "relative", maxWidth: 480 }}>
        <input className="input" placeholder="Search contacts…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--bone-400)" }}>
          <Icon name="search" size={16} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {filtered.map(c => {
          const booking = bookings.find(b => b.id === c.bookingId);
          return (
            <div key={c.id} className="card"
                 style={{ cursor: "pointer", transition: "border-color 200ms" }}
                 onMouseEnter={e => e.currentTarget.style.borderColor = "var(--gold-500)"}
                 onMouseLeave={e => e.currentTarget.style.borderColor = "var(--ink-400)"}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "var(--ink-300)", border: "1px solid var(--ink-500)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-display)", fontSize: 14, color: "var(--gold-200)", letterSpacing: "0.05em",
                }}>
                  {c.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <button onClick={() => toggleAssign(c.id)} className={c.assigned ? "badge badge-success" : "badge badge-muted"}>
                  {c.assigned ? "Portal Active" : "No Portal"}
                </button>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 15, letterSpacing: "0.05em", marginBottom: 4, textTransform: "uppercase" }}>
                {c.name}
              </div>
              <div style={{ fontSize: 13, color: "var(--bone-300)", fontFamily: "var(--font-serif)" }}>{c.email}</div>
              <div style={{ fontSize: 13, color: "var(--bone-300)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{c.phone}</div>
              {booking && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--ink-400)" }}>
                  <div className="label-sm" style={{ marginBottom: 4, fontSize: 9 }}>Active Booking</div>
                  <div style={{ fontSize: 12, color: "var(--gold-200)", fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}>
                    {booking.eventType} · {window.formatDate(booking.date, { day: "numeric", month: "short" })}
                  </div>
                </div>
              )}
              {c.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
                  {c.tags.map(t => <span key={t} className="badge badge-muted">{t}</span>)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// CONTENT MANAGEMENT (lightweight)
// ============================================================
const AdminContent = () => (
  <div className="fade-in">
    <SectionHeader
      eyebrow="— CMS"
      title="Site Content"
      subtitle="Edit packages, copy, and featured frames on the public landing page."
    />
    <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <ContentBlock
        title="Hero Headline"
        value={"Weddings, Editorials, quietly extraordinary."}
        type="text"
      />
      <ContentBlock
        title="Hero Subtitle"
        value={"A boutique studio for couples and brands who prefer their stories told in light, not in noise."}
        type="textarea"
      />
      <ContentBlock title="Studio Address" value={"Studio 12 · Gertrude Street, Fitzroy VIC 3065"} type="text" />
      <ContentBlock title="Contact Email" value={"hello@illuminatestudios.com.au"} type="text" />
      <ContentBlock title="Phone" value={"+61 3 9417 4821"} type="text" />
      <ContentBlock title="Booking Notice"
        value={"Limited dates each season. Enquiries answered within two working days."}
        type="textarea" />
    </div>

    <div className="hairline" style={{ margin: "56px 0" }} />

    <div className="label-sm" style={{ marginBottom: 20 }}>Featured Frames · Landing Strip</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
      {window.GALLERY_PROOFS.slice(0, 6).map((p, i) => (
        <div key={i} style={{
          aspectRatio: "4/5",
          backgroundImage: `url(${p.src})`, backgroundSize: "cover", backgroundPosition: "center",
          border: "1px solid var(--ink-500)",
          position: "relative", cursor: "pointer",
        }}>
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
            opacity: 0, transition: "opacity 200ms",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold-200)",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0}>
            <Icon name="edit" size={20} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ContentBlock = ({ title, value, type }) => (
  <div className="card">
    <div className="label-sm" style={{ marginBottom: 12 }}>{title}</div>
    {type === "textarea" ? (
      <textarea className="textarea" defaultValue={value} rows={3} />
    ) : (
      <input className="input" defaultValue={value} />
    )}
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
      <button className="btn btn-ghost btn-sm">Save</button>
    </div>
  </div>
);

Object.assign(window, { AdminPortal });
