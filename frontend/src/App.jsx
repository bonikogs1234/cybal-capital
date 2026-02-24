import { useState, useEffect, createContext, useContext, useCallback } from "react";

// ── GLOBAL STYLES ─────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --black: #1a1a2e; --dark: #22223b; --dark2: #2d2d44;
      --gold: #c9a84c; --gold-light: #e2c47a; --gold-dim: rgba(201,168,76,0.15);
      --white: #f0eee8; --white-dim: rgba(240,238,232,0.65);
      --green: #4caf82; --red: #e05c5c;
      --serif: 'Cormorant Garamond', serif; --sans: 'Jost', sans-serif;
    }
    html { scroll-behavior: smooth; }
    body { background: var(--black); color: var(--white); font-family: var(--sans); font-weight: 300; overflow-x: hidden; }
    ::selection { background: var(--gold); color: var(--black); }
    input, select, textarea, button { font-family: var(--sans); }
    @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes kenBurns { 0% { transform:scale(1); } 100% { transform:scale(1.07); } }
    @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
    @keyframes spin { to { transform:rotate(360deg); } }
    ::-webkit-scrollbar { width:4px; }
    ::-webkit-scrollbar-track { background:var(--dark); }
    ::-webkit-scrollbar-thumb { background:var(--gold); border-radius:2px; }

    /* RESPONSIVE */
    .desktop-nav { display:flex !important; }
    .hamburger   { display:none !important; }
    .mobile-menu { display:none !important; }

    @media (max-width: 768px) {
      .desktop-nav  { display:none !important; }
      .hamburger    { display:flex !important; flex-direction:column; gap:5px; cursor:pointer; background:none; border:none; padding:4px; }
      .hamburger span { width:24px; height:2px; background:var(--white); display:block; transition:all 0.3s; }
      .mobile-menu  { display:flex !important; flex-direction:column; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(8,8,8,0.97); z-index:998; align-items:center; justify-content:center; gap:36px; animation:fadeIn 0.3s ease; }
      .stats-grid    { grid-template-columns:1fr 1fr !important; }
      .prop-grid     { grid-template-columns:1fr !important; }
      .about-grid    { grid-template-columns:1fr !important; }
      .services-grid { grid-template-columns:1fr 1fr !important; }
      .contact-grid  { grid-template-columns:1fr !important; }
      .footer-grid   { grid-template-columns:1fr 1fr !important; gap:24px !important; }
      .locations-grid{ grid-template-columns:1fr 1fr !important; }
      .detail-grid   { grid-template-columns:1fr !important; }
      .detail-stats  { grid-template-columns:1fr 1fr !important; }
      .admin-stats   { grid-template-columns:1fr 1fr !important; }
      .admin-recent  { grid-template-columns:1fr !important; }
      .form-row      { grid-template-columns:1fr !important; }
      .cta-banner    { flex-direction:column !important; text-align:center !important; }
    }
    @media (max-width: 480px) {
      .services-grid { grid-template-columns:1fr !important; }
      .footer-grid   { grid-template-columns:1fr !important; }
    }
  `}</style>
);

// ── MOCK API (replace with real axios calls in production) ────────────────────
const MOCK_LISTINGS = [
  { _id:"1", title:"The Pinnacle Residences", location:{neighbourhood:"Westlands", address:"14 Westlands Rd"}, price:45000000, details:{beds:4,baths:4,sqft:3800}, type:"Penthouse", tag:"Featured", status:"For Sale", isFeatured:true, views:234, images:[{url:"https://images.unsplash.com/photo-1600607687939-ce8a6d8f7046?w=900&q=85"}], description:"A stunning penthouse with panoramic city views, floor-to-ceiling windows, and premium finishes throughout.", features:["Swimming Pool","Gym","24hr Security","Smart Home","Balcony"], createdAt:"2026-01-15" },
  { _id:"2", title:"Serene Gardens Estate", location:{neighbourhood:"Karen", address:"88 Karen Rd"}, price:78000000, details:{beds:5,baths:5,sqft:5200}, type:"Villa", tag:"Exclusive", status:"For Sale", isFeatured:true, views:189, images:[{url:"https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&q=85"}], description:"Majestic villa set in lush gardens with a private pool, guest cottage, and expansive entertaining spaces.", features:["Private Pool","Guest Cottage","Garden","Security","Garage"], createdAt:"2026-01-20" },
  { _id:"3", title:"Skyline Tower Suite", location:{neighbourhood:"Upper Hill", address:"5 Hill Ln"}, price:28500000, details:{beds:3,baths:3,sqft:2400}, type:"Apartment", tag:"New", status:"For Sale", isFeatured:false, views:112, images:[{url:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85"}], description:"Contemporary apartment in the heart of the business district with spectacular skyline views.", features:["Concierge","Gym","Rooftop Terrace","Underground Parking"], createdAt:"2026-02-01" },
  { _id:"4", title:"The Grand Runda", location:{neighbourhood:"Runda", address:"3 Runda Grove"}, price:120000000, details:{beds:6,baths:6,sqft:7800}, type:"Mansion", tag:"Luxury", status:"For Sale", isFeatured:true, views:301, images:[{url:"https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=900&q=85"}], description:"An architectural masterpiece with cinema room, wine cellar, infinity pool, and manicured grounds.", features:["Infinity Pool","Cinema Room","Wine Cellar","Staff Quarters","Tennis Court"], createdAt:"2026-01-10" },
  { _id:"5", title:"Lavington Court", location:{neighbourhood:"Lavington", address:"22 Lavington Cl"}, price:55000000, details:{beds:4,baths:4,sqft:4100}, type:"Townhouse", tag:"Featured", status:"For Sale", isFeatured:false, views:156, images:[{url:"https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=85"}], description:"Elegant townhouse in a sought-after gated community with a private garden and double garage.", features:["Private Garden","Double Garage","Security","Modern Kitchen"], createdAt:"2026-02-05" },
  { _id:"6", title:"Kileleshwa Heights", location:{neighbourhood:"Kileleshwa", address:"7 Heights Ave"}, price:32000000, details:{beds:3,baths:2,sqft:2000}, type:"Apartment", tag:"New", status:"Sold", isFeatured:false, views:98, images:[{url:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=85"}], description:"Modern apartment in a boutique development with high-end finishes and open-plan living.", features:["Open Plan","Fitted Kitchen","Balcony","Parking"], createdAt:"2026-02-10" },
];

const MOCK_ENQUIRIES = [
  { _id:"e1", name:"James Mwangi", email:"james@email.com", phone:"+254711000001", interest:"Buying", message:"I am interested in the Pinnacle Residences penthouse.", status:"New", createdAt:"2026-02-20", property:{title:"The Pinnacle Residences"} },
  { _id:"e2", name:"Sarah Kamau", email:"sarah@email.com", phone:"+254722000002", interest:"Investment Advisory", message:"Looking to invest in luxury real estate. Please advise.", status:"Read", createdAt:"2026-02-18", property:null },
  { _id:"e3", name:"David Ochieng", email:"david@email.com", phone:"+254733000003", interest:"Selling", message:"I have a property in Karen I wish to list.", status:"Replied", createdAt:"2026-02-15", property:null },
  { _id:"e4", name:"Grace Njeri", email:"grace@email.com", phone:"+254744000004", interest:"Buying", message:"Interested in Serene Gardens Estate. Can we arrange a viewing?", status:"New", createdAt:"2026-02-19", property:{title:"Serene Gardens Estate"} },
];

const fmtPrice = (n) => "KSh " + Number(n).toLocaleString();
const fmtDate  = (d) => new Date(d).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });

// ── AUTH CONTEXT ──────────────────────────────────────────────────────────────
const AuthCtx = createContext();
const useAuth = () => useContext(AuthCtx);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("cybal_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const loginUser = (userData) => {
    localStorage.setItem("cybal_user", JSON.stringify(userData));
    setUser(userData);
  };
  const logoutUser = () => {
    localStorage.removeItem("cybal_user");
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, loginUser, logoutUser }}>{children}</AuthCtx.Provider>;
};

// ── TOAST ─────────────────────────────────────────────────────────────────────
const ToastCtx = createContext();
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div style={{ position:"fixed", bottom:28, right:28, zIndex:9999, display:"flex", flexDirection:"column", gap:10 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: t.type==="error" ? "var(--red)" : t.type==="warning" ? "var(--gold)" : "var(--green)", color:"#fff", padding:"12px 20px", fontSize:"0.85rem", borderRadius:2, fontFamily:"var(--sans)", animation:"fadeUp 0.3s ease", maxWidth:320, boxShadow:"0 8px 24px rgba(0,0,0,0.3)" }}>
            {t.type==="success" ? "✓ " : t.type==="error" ? "✕ " : "⚠ "}{t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};
const useToast = () => useContext(ToastCtx);

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{ display:"flex", justifyContent:"center", alignItems:"center", padding:60 }}>
    <div style={{ width:36, height:36, border:"2px solid var(--gold-dim)", borderTop:"2px solid var(--gold)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
  </div>
);

const GoldBtn = ({ children, onClick, type="button", outline=false, small=false, style={} }) => {
  const [hov, setHov] = useState(false);
  return (
    <button type={type} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: outline ? (hov?"var(--gold)":"transparent") : (hov?"var(--gold-light)":"var(--gold)"),
        color: outline ? (hov?"var(--black)":"var(--gold)") : "var(--black)",
        border:"1px solid var(--gold)", padding: small?"8px 18px":"14px 32px",
        fontSize: small?"0.72rem":"0.78rem", letterSpacing:"0.14em", textTransform:"uppercase",
        cursor:"pointer", fontWeight:500, transition:"all 0.25s", ...style }}>
      {children}
    </button>
  );
};

const InputStyle = { width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.12)", color:"var(--white)", padding:"13px 16px", fontSize:"0.88rem", fontWeight:300, outline:"none", transition:"border-color 0.2s" };
const LabelStyle = { fontSize:"0.68rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--gold)", marginBottom:6, display:"block" };

const Field = ({ label, children }) => (
  <div style={{ marginBottom:16 }}>
    <label style={LabelStyle}>{label}</label>
    {children}
  </div>
);

const TagBadge = ({ tag }) => {
  const colors = { Featured:"#c9a84c", Exclusive:"#9b72cf", New:"#4caf82", Luxury:"#e05c5c", "Hot Deal":"#e05c5c" };
  return <span style={{ background:colors[tag]||"#888", color:"#fff", fontSize:"0.63rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", padding:"3px 10px" }}>{tag}</span>;
};

const StatusBadge = ({ status }) => {
  const colors = { "For Sale":"var(--green)", Sold:"var(--red)", "Under Offer":"var(--gold)" };
  return <span style={{ color:colors[status]||"#888", fontSize:"0.7rem", fontWeight:600, letterSpacing:"0.08em" }}>{status}</span>;
};

// ── NAVBAR ────────────────────────────────────────────────────────────────────
const Navbar = ({ page, setPage }) => {
  const { user, logoutUser } = useAuth();
  const toast = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (p) => { setPage(p); setMobileOpen(false); setUserMenu(false); window.scrollTo(0,0); };

  return (
    <>
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:999, padding: scrolled?"12px 24px":"18px 24px", background: scrolled?"rgba(8,8,8,0.97)":"transparent", backdropFilter: scrolled?"blur(20px)":"none", borderBottom: scrolled?"1px solid rgba(201,168,76,0.12)":"none", display:"flex", alignItems:"center", justifyContent:"space-between", transition:"all 0.4s ease" }}>

        {/* Logo */}
        <div onClick={() => go("home")} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", zIndex:1000 }}>
          <div style={{ width:28, height:28, background:"linear-gradient(135deg,var(--gold),var(--gold-light))", clipPath:"polygon(50% 0%,100% 35%,100% 100%,0% 100%,0% 35%)", flexShrink:0 }} />
          <div>
            <div style={{ fontFamily:"var(--serif)", fontSize:"0.95rem", fontWeight:600, letterSpacing:"0.06em", color:"var(--white)", lineHeight:1 }}>CYBAL CAPITAL</div>
            <div style={{ fontSize:"0.48rem", letterSpacing:"0.2em", color:"var(--gold)", marginTop:2 }}>LIMITED</div>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="desktop-nav" style={{ alignItems:"center", gap:32 }}>
          {[["home","Home"],["properties","Properties"],["about","About"],["contact","Contact"]].map(([p,label]) => (
            <span key={p} onClick={() => go(p)} style={{ color: page===p?"var(--gold)":"var(--white-dim)", fontSize:"0.74rem", letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer", transition:"color 0.2s", fontWeight: page===p?500:300 }}
              onMouseEnter={e=>e.target.style.color="var(--gold)"} onMouseLeave={e=>{ if(page!==p) e.target.style.color="var(--white-dim)"; }}>
              {label}
            </span>
          ))}
          {/* Admin avatar shown only after secret login */}
          {user && user.role === "admin" && (
            <div style={{ position:"relative" }}>
              <div onClick={()=>setUserMenu(!userMenu)} style={{ width:30, height:30, borderRadius:"50%", background:"var(--gold)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--black)", fontSize:"0.78rem", fontWeight:700, cursor:"pointer" }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              {userMenu && (
                <div style={{ position:"absolute", top:44, right:0, background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.2)", minWidth:180, zIndex:100 }}>
                  <div onClick={()=>go("admin")} style={{ padding:"12px 18px", fontSize:"0.82rem", color:"var(--gold)", cursor:"pointer", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>Dashboard</div>
                  <div onClick={()=>{ logoutUser(); toast("Logged out"); go("home"); }} style={{ padding:"12px 18px", fontSize:"0.82rem", color:"var(--red)", cursor:"pointer" }}>Log Out</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hamburger — Mobile Only */}
        <button className="hamburger" onClick={()=>setMobileOpen(!mobileOpen)} style={{ zIndex:1000 }}>
          <span style={{ transform: mobileOpen?"rotate(45deg) translate(5px,5px)":"none" }} />
          <span style={{ opacity: mobileOpen?0:1 }} />
          <span style={{ transform: mobileOpen?"rotate(-45deg) translate(5px,-5px)":"none" }} />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="mobile-menu" style={{ zIndex:997 }}>

          {/* Nav Links */}
          {[["home","Home"],["properties","Properties"],["about","About"],["contact","Contact"]].map(([p,label]) => (
            <span key={p} onClick={()=>go(p)} style={{ fontFamily:"var(--serif)", fontSize:"2rem", color: page===p?"var(--gold)":"var(--white)", cursor:"pointer", letterSpacing:"0.06em" }}>{label}</span>
          ))}

          {/* Gold divider */}
          <div style={{ width:40, height:1, background:"rgba(201,168,76,0.4)" }} />

          {/* Admin only — shown after secret login */}
          {user && user.role === "admin" && (
            <>
              <div style={{ textAlign:"center" }}>
                <div style={{ width:48, height:48, borderRadius:"50%", background:"var(--gold)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--black)", fontSize:"1.2rem", fontWeight:700, margin:"0 auto 8px" }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ fontFamily:"var(--serif)", fontSize:"0.9rem", color:"var(--gold)", letterSpacing:"0.1em" }}>ADMIN</div>
              </div>
              <span onClick={()=>go("admin")} style={{ fontFamily:"var(--serif)", fontSize:"1.5rem", color:"var(--gold)", cursor:"pointer", letterSpacing:"0.06em" }}>
                Dashboard
              </span>
              <span onClick={()=>{ logoutUser(); toast("Logged out"); go("home"); }} style={{ fontFamily:"var(--serif)", fontSize:"1.3rem", color:"var(--red)", cursor:"pointer" }}>
                Log Out
              </span>
            </>
          )}
        </div>
      )}
    </>
  );
};

// ── HOME PAGE ─────────────────────────────────────────────────────────────────
const HomePage = ({ setPage }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [featured, setFeatured] = useState([]);

  const HERO_IMGS = [
    "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=90",
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=90",
    "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1600&q=90",
  ];
  const STATS = [{ value:"KSh 2B+", label:"Property Value Sold" },{ value:"400+", label:"Premium Listings" },{ value:"4+ Yrs", label:"Market Expertise" },{ value:"98%", label:"Client Satisfaction" }];
  const SERVICES = [
    { icon:"◈", title:"Property Marketing", desc:"Bespoke marketing strategies that showcase the true potential of premium developments." },
    { icon:"◇", title:"Exclusive Listings", desc:"Access to off-market and pre-launch properties across our most coveted neighbourhoods." },
    { icon:"◉", title:"Investment Advisory", desc:"Expert guidance on high-yield real estate investment opportunities." },
    { icon:"◫", title:"Legal & Due Diligence", desc:"Comprehensive title deed verification and legal support for every transaction." },
  ];

  useEffect(() => {
    const t = setInterval(() => setImgIdx(i => (i+1) % HERO_IMGS.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setFeatured(MOCK_LISTINGS.filter(l => l.isFeatured).slice(0,3));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section style={{ position:"relative", height:"100vh", minHeight:680, overflow:"hidden" }}>
        {HERO_IMGS.map((img, i) => (
          <div key={i} style={{ position:"absolute", inset:0, opacity:imgIdx===i?1:0, transition:"opacity 1.5s ease" }}>
            <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", animation:imgIdx===i?"kenBurns 8s ease forwards":"none" }} />
          </div>
        ))}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(8,8,8,0.5) 0%, rgba(8,8,8,0.25) 50%, rgba(8,8,8,0.85) 100%)" }} />
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 8% 9%" }}>
          <div style={{ width:50, height:1, background:"var(--gold)", marginBottom:24, animation:"fadeIn 1s 0.3s both" }} />
          <div style={{ animation:"fadeUp 0.9s 0.4s both" }}>
            <p style={{ fontSize:"0.72rem", letterSpacing:"0.28em", color:"var(--gold)", textTransform:"uppercase", marginBottom:16 }}>Premier Luxury Real Estate · Exclusive Properties</p>
            <h1 style={{ fontFamily:"var(--serif)", fontSize:"clamp(3rem, 7vw, 7rem)", fontWeight:300, lineHeight:1.05, color:"var(--white)", marginBottom:24 }}>
              Welcome to<br/><em style={{ fontStyle:"italic", color:"var(--gold-light)" }}>Cybal Capital</em><br/>Limited
            </h1>
            <p style={{ fontSize:"1rem", color:"var(--white-dim)", maxWidth:520, lineHeight:1.8, marginBottom:40 }}>
              Exclusive access to multi-million-dollar properties. Guided by quality, integrity, and innovation.
            </p>
            <div style={{ display:"flex", gap:14 }}>
              <GoldBtn onClick={() => { setPage("properties"); window.scrollTo(0,0); }}>Explore Properties</GoldBtn>
              <GoldBtn outline onClick={() => { setPage("about"); window.scrollTo(0,0); }}>Our Story</GoldBtn>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:44 }}>
            {HERO_IMGS.map((_,i) => (
              <button key={i} onClick={() => setImgIdx(i)} style={{ width:i===imgIdx?32:8, height:2, background:i===imgIdx?"var(--gold)":"rgba(255,255,255,0.3)", border:"none", cursor:"pointer", transition:"all 0.4s" }} />
            ))}
          </div>
        </div>
        <div style={{ position:"absolute", bottom:36, right:48, display:"flex", flexDirection:"column", alignItems:"center", gap:8, animation:"float 2.5s ease-in-out infinite" }}>
          <div style={{ fontSize:"0.58rem", letterSpacing:"0.2em", color:"var(--white-dim)", writingMode:"vertical-rl" }}>Scroll</div>
          <div style={{ width:1, height:48, background:"linear-gradient(to bottom,var(--gold),transparent)" }} />
        </div>
      </section>

      {/* Stats */}
      <section style={{ background:"var(--gold)" }}>
        <div className="stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", width:"100%", margin:"0 auto" }}>
          {STATS.map((s,i) => (
            <div key={i} style={{ padding:"26px 20px", textAlign:"center", borderRight:i<3?"1px solid rgba(8,8,8,0.15)":"none" }}>
              <div style={{ fontFamily:"var(--serif)", fontSize:"1.9rem", fontWeight:600, color:"var(--black)" }}>{s.value}</div>
              <div style={{ fontSize:"0.68rem", letterSpacing:"0.14em", color:"rgba(8,8,8,0.6)", textTransform:"uppercase", marginTop:5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section style={{ background:"var(--black)", padding:"100px 5%" }}>
        <div style={{ maxWidth:"100%", margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:52 }}>
            <div>
              <p style={{ fontSize:"0.7rem", letterSpacing:"0.24em", color:"var(--gold)", textTransform:"uppercase", marginBottom:12 }}>Handpicked For You</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"clamp(2rem,4vw,3rem)", fontWeight:300, color:"var(--white)" }}>Featured Properties</h2>
            </div>
            <GoldBtn outline small onClick={() => { setPage("properties"); window.scrollTo(0,0); }}>View All</GoldBtn>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:20 }}>
            {featured.map(l => <PropertyCard key={l._id} listing={l} setPage={setPage} />)}
          </div>
        </div>
      </section>

      {/* About snippet */}
      <section style={{ background:"var(--dark)", padding:"100px 5%" }}>
        <div style={{ maxWidth:"100%", margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center" }}>
          <div style={{ position:"relative" }}>
            <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=85" alt="City skyline" style={{ width:"100%", height:500, objectFit:"cover" }} />
            <div style={{ position:"absolute", top:-14, left:-14, width:"55%", height:"55%", border:"1px solid var(--gold)", zIndex:-1 }} />
            <div style={{ position:"absolute", bottom:-22, right:-22, background:"var(--gold)", padding:"22px 26px", textAlign:"center" }}>
              <div style={{ fontFamily:"var(--serif)", fontSize:"2rem", fontWeight:600, color:"var(--black)" }}>4+</div>
              <div style={{ fontSize:"0.65rem", letterSpacing:"0.1em", color:"rgba(8,8,8,0.7)", textTransform:"uppercase", marginTop:4 }}>Years<br/>Excellence</div>
            </div>
          </div>
          <div>
            <p style={{ fontSize:"0.7rem", letterSpacing:"0.24em", color:"var(--gold)", textTransform:"uppercase", marginBottom:14 }}>About Us</p>
            <div style={{ width:36, height:1, background:"var(--gold)", marginBottom:24 }} />
            <h2 style={{ fontFamily:"var(--serif)", fontSize:"clamp(1.8rem,3vw,2.6rem)", fontWeight:300, color:"var(--white)", lineHeight:1.25, marginBottom:22 }}>A Premier Luxury Real Estate Marketing Company</h2>
            <p style={{ color:"var(--white-dim)", lineHeight:1.9, fontSize:"0.92rem", marginBottom:18 }}><strong style={{ color:"var(--white)", fontWeight:500 }}>Cybal Capital Limited</strong> is a premier luxury real estate marketing company, offering exclusive access to multi-million-dollar properties. With a commitment to excellence, we provide bespoke real estate solutions tailored to meet the unique needs of our clients.</p>
            <p style={{ color:"var(--white-dim)", lineHeight:1.9, fontSize:"0.92rem", marginBottom:36 }}>Guided by our core values of quality, integrity, and innovation, we passionately strive to deliver exceptional marketing strategies and customer service that highlight the true potential of premium developments.</p>
            <GoldBtn onClick={() => { setPage("about"); window.scrollTo(0,0); }}>Learn More</GoldBtn>
          </div>
        </div>
      </section>

      {/* Services */}
      <section style={{ background:"var(--black)", padding:"100px 5%" }}>
        <div style={{ maxWidth:"100%", margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <p style={{ fontSize:"0.7rem", letterSpacing:"0.24em", color:"var(--gold)", textTransform:"uppercase", marginBottom:12 }}>What We Offer</p>
            <h2 style={{ fontFamily:"var(--serif)", fontSize:"clamp(2rem,4vw,3rem)", fontWeight:300, color:"var(--white)" }}>Our Services</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:2 }}>
            {SERVICES.map((s,i) => (
              <div key={i} style={{ padding:"42px 32px", border:"1px solid rgba(201,168,76,0.1)", background:"rgba(22,22,22,0.5)", transition:"all 0.3s" }}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(201,168,76,0.05)";e.currentTarget.style.borderColor="rgba(201,168,76,0.28)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(22,22,22,0.5)";e.currentTarget.style.borderColor="rgba(201,168,76,0.1)";}}>
                <div style={{ fontSize:"1.7rem", color:"var(--gold)", marginBottom:18 }}>{s.icon}</div>
                <h3 style={{ fontFamily:"var(--serif)", fontSize:"1.2rem", fontWeight:500, color:"var(--white)", marginBottom:12 }}>{s.title}</h3>
                <p style={{ fontSize:"0.85rem", color:"var(--white-dim)", lineHeight:1.8 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ background:"var(--gold)", padding:"60px 5%" }}>
        <div style={{ maxWidth:"100%", margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", gap:32, flexWrap:"wrap" }}>
          <div>
            <h2 style={{ fontFamily:"var(--serif)", fontSize:"clamp(1.6rem,3vw,2.4rem)", fontWeight:400, color:"var(--black)", marginBottom:8 }}>Ready to Find Your Dream Property?</h2>
            <p style={{ fontSize:"0.88rem", color:"rgba(8,8,8,0.65)" }}>Our consultants are on hand to guide you every step of the way.</p>
          </div>
          <button onClick={() => { setPage("contact"); window.scrollTo(0,0); }} style={{ background:"var(--black)", color:"var(--gold)", border:"none", padding:"16px 36px", fontSize:"0.78rem", letterSpacing:"0.14em", textTransform:"uppercase", cursor:"pointer", fontWeight:500, transition:"all 0.3s", whiteSpace:"nowrap" }}
            onMouseEnter={e=>{e.target.style.background="#111";}} onMouseLeave={e=>{e.target.style.background="var(--black)";}}>
            Enquire Now
          </button>
        </div>
      </section>

      <Footer setPage={setPage} />
    </div>
  );
};

// ── PROPERTY CARD ─────────────────────────────────────────────────────────────
const PropertyCard = ({ listing, setPage, onSelect }) => {
  const [hov, setHov] = useState(false);
  const click = () => { if(onSelect) onSelect(listing); else { setPage("property-detail"); localStorage.setItem("cybal_prop", JSON.stringify(listing)); window.scrollTo(0,0); } };
  return (
    <div onClick={click} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:"var(--dark2)", overflow:"hidden", cursor:"pointer", border:`1px solid ${hov?"rgba(201,168,76,0.4)":"rgba(255,255,255,0.06)"}`, transform:hov?"translateY(-6px)":"translateY(0)", boxShadow:hov?"0 24px 50px rgba(0,0,0,0.5)":"0 4px 16px rgba(0,0,0,0.2)", transition:"all 0.35s cubic-bezier(0.25,0.8,0.25,1)" }}>
      <div style={{ position:"relative", height:240, overflow:"hidden" }}>
        <img src={listing.images?.[0]?.url||"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600"} alt={listing.title} style={{ width:"100%", height:"100%", objectFit:"cover", transform:hov?"scale(1.06)":"scale(1)", transition:"transform 0.5s ease" }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 50%,rgba(8,8,8,0.8))" }} />
        <div style={{ position:"absolute", top:14, left:14 }}><TagBadge tag={listing.tag} /></div>
        {listing.status !== "For Sale" && <div style={{ position:"absolute", top:14, right:14 }}><StatusBadge status={listing.status} /></div>}
        <div style={{ position:"absolute", bottom:14, left:16, right:16, fontFamily:"var(--serif)", fontSize:"1.35rem", fontWeight:500, color:"#fff" }}>{fmtPrice(listing.price)}</div>
      </div>
      <div style={{ padding:"18px 20px 22px" }}>
        <div style={{ fontSize:"0.66rem", color:"var(--gold)", letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:7 }}>{listing.type} · {listing.location?.neighbourhood}</div>
        <div style={{ fontFamily:"var(--serif)", fontSize:"1.15rem", fontWeight:500, color:"var(--white)", marginBottom:16 }}>{listing.title}</div>
        <div style={{ display:"flex", borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:14, fontSize:"0.76rem", color:"var(--white-dim)" }}>
          {[`${listing.details?.beds} Beds`, `${listing.details?.baths} Baths`, `${listing.details?.sqft?.toLocaleString()} ft²`].map((s,i) => (
            <div key={i} style={{ flex:1, textAlign:"center", borderRight:i<2?"1px solid rgba(255,255,255,0.07)":"none" }}>{s}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── PROPERTIES PAGE ───────────────────────────────────────────────────────────
const PropertiesPage = ({ setPage }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search:"", type:"", minPrice:"", maxPrice:"", beds:"", neighbourhood:"" });
  const [applied, setApplied] = useState({});

  const TYPES = ["","House","Apartment","Villa","Penthouse","Townhouse","Mansion","Studio","Loft"];
  const HOODS = ["","Westlands","Karen","Runda","Lavington","Kileleshwa","Upper Hill","Muthaiga","Gigiri"];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let res = [...MOCK_LISTINGS];
      if (applied.search) res = res.filter(l => l.title.toLowerCase().includes(applied.search.toLowerCase()) || l.location.neighbourhood.toLowerCase().includes(applied.search.toLowerCase()));
      if (applied.type) res = res.filter(l => l.type === applied.type);
      if (applied.neighbourhood) res = res.filter(l => l.location.neighbourhood === applied.neighbourhood);
      if (applied.minPrice) res = res.filter(l => l.price >= Number(applied.minPrice));
      if (applied.maxPrice) res = res.filter(l => l.price <= Number(applied.maxPrice));
      if (applied.beds) res = res.filter(l => l.details.beds >= Number(applied.beds));
      setListings(res);
      setLoading(false);
    }, 400);
  }, [applied]);

  const applyFilters = () => setApplied({...filters});
  const clearFilters = () => { setFilters({ search:"", type:"", minPrice:"", maxPrice:"", beds:"", neighbourhood:"" }); setApplied({}); };

  return (
    <div style={{ paddingTop:80, background:"var(--black)", minHeight:"100vh" }}>
      {/* Header */}
      <div style={{ background:"var(--dark)", padding:"48px 8% 40px", borderBottom:"1px solid rgba(201,168,76,0.1)" }}>
        <div style={{ maxWidth:"100%", margin:"0 auto" }}>
          <p style={{ fontSize:"0.7rem", letterSpacing:"0.24em", color:"var(--gold)", textTransform:"uppercase", marginBottom:10 }}>Browse Our Collection</p>
          <h1 style={{ fontFamily:"var(--serif)", fontSize:"clamp(2rem,4vw,3rem)", fontWeight:300, color:"var(--white)", marginBottom:32 }}>All Properties</h1>

          {/* Search Bar */}
          <div style={{ display:"flex", gap:10, marginBottom:16 }}>
            <input value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})} placeholder="Search by name or neighbourhood..." style={{ ...InputStyle, flex:1 }}
              onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"}
              onKeyDown={e=>e.key==="Enter"&&applyFilters()} />
            <GoldBtn onClick={applyFilters}>Search</GoldBtn>
          </div>

          {/* Filters row */}
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {[["type","Type",TYPES],["neighbourhood","Area",HOODS],["beds","Min Beds",["","1","2","3","4","5","6"]]].map(([key,label,opts]) => (
              <select key={key} value={filters[key]} onChange={e=>setFilters({...filters,[key]:e.target.value})} style={{ ...InputStyle, width:"auto", minWidth:130, padding:"10px 14px", appearance:"none", cursor:"pointer" }}>
                <option value="">{label}</option>
                {opts.filter(o=>o).map(o=><option key={o} value={o} style={{background:"#161616"}}>{o}</option>)}
              </select>
            ))}
            <input value={filters.minPrice} onChange={e=>setFilters({...filters,minPrice:e.target.value})} placeholder="Min Price (KSh)" style={{ ...InputStyle, width:160, padding:"10px 14px" }} type="number"
              onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} />
            <input value={filters.maxPrice} onChange={e=>setFilters({...filters,maxPrice:e.target.value})} placeholder="Max Price (KSh)" style={{ ...InputStyle, width:160, padding:"10px 14px" }} type="number"
              onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} />
            <GoldBtn small onClick={applyFilters}>Apply</GoldBtn>
            <GoldBtn small outline onClick={clearFilters}>Clear</GoldBtn>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth:"100%", margin:"0 auto", padding:"48px 5%" }}>
        {loading ? <Spinner /> : (
          <>
            <p style={{ fontSize:"0.78rem", color:"var(--white-dim)", marginBottom:28 }}>{listings.length} properties found</p>
            {listings.length === 0 ? (
              <div style={{ textAlign:"center", padding:"80px 0", color:"var(--white-dim)" }}>
                <div style={{ fontFamily:"var(--serif)", fontSize:"2rem", marginBottom:12 }}>No properties found</div>
                <p>Try adjusting your search filters</p>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:20 }}>
                {listings.map(l => <PropertyCard key={l._id} listing={l} setPage={setPage} />)}
              </div>
            )}
          </>
        )}
      </div>
      <Footer setPage={setPage} />
    </div>
  );
};

// ── PROPERTY DETAIL PAGE ──────────────────────────────────────────────────────
const PropertyDetailPage = ({ setPage }) => {
  const toast = useToast();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [enquiry, setEnquiry] = useState({ name: user?.name||"", email: user?.email||"", phone:"", message:"" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cybal_prop");
    if (saved) setListing(JSON.parse(saved));
  }, []);

  if (!listing) return <Spinner />;

  const imgs = listing.images?.length ? listing.images : [{ url:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900" }];

  const handleEnquiry = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setSending(false); setSent(true);
    toast("Enquiry sent! We will be in touch shortly.");
  };

  return (
    <div style={{ paddingTop:80, background:"var(--black)", minHeight:"100vh" }}>
      {/* Back */}
      <div style={{ padding:"20px 8%", background:"var(--dark)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <span onClick={() => { setPage("properties"); window.scrollTo(0,0); }} style={{ color:"var(--gold)", fontSize:"0.8rem", cursor:"pointer", letterSpacing:"0.1em" }}>← Back to Properties</span>
      </div>

      <div style={{ maxWidth:"100%", margin:"0 auto", padding:"48px 5%" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:48 }}>
          {/* Left */}
          <div>
            {/* Main image */}
            <div style={{ position:"relative", height:480, overflow:"hidden", marginBottom:12 }}>
              <img src={imgs[imgIdx]?.url} alt={listing.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              <div style={{ position:"absolute", top:16, left:16 }}><TagBadge tag={listing.tag} /></div>
              <div style={{ position:"absolute", top:16, right:16 }}><StatusBadge status={listing.status} /></div>
            </div>
            {/* Thumbnails */}
            {imgs.length > 1 && (
              <div style={{ display:"flex", gap:8, marginBottom:32 }}>
                {imgs.map((img,i) => (
                  <div key={i} onClick={() => setImgIdx(i)} style={{ width:80, height:60, overflow:"hidden", cursor:"pointer", border:`2px solid ${imgIdx===i?"var(--gold)":"transparent"}` }}>
                    <img src={img.url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  </div>
                ))}
              </div>
            )}

            {/* Info */}
            <div style={{ marginBottom:8 }}>
              <p style={{ fontSize:"0.7rem", color:"var(--gold)", letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:8 }}>{listing.type} · {listing.location?.neighbourhood}</p>
              <h1 style={{ fontFamily:"var(--serif)", fontSize:"clamp(1.8rem,3vw,2.8rem)", fontWeight:300, color:"var(--white)", marginBottom:8 }}>{listing.title}</h1>
              <p style={{ color:"var(--white-dim)", fontSize:"0.85rem", marginBottom:20 }}>📍 {listing.location?.address}</p>
              <div style={{ fontFamily:"var(--serif)", fontSize:"2rem", fontWeight:500, color:"var(--gold)", marginBottom:28 }}>{fmtPrice(listing.price)}</div>
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:2, marginBottom:36 }}>
              {[["Bedrooms",listing.details?.beds],["Bathrooms",listing.details?.baths],["Area",`${listing.details?.sqft?.toLocaleString()} ft²`],["Views",listing.views]].map(([k,v]) => (
                <div key={k} style={{ background:"var(--dark2)", padding:"18px 16px", textAlign:"center", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontFamily:"var(--serif)", fontSize:"1.5rem", fontWeight:500, color:"var(--gold)" }}>{v}</div>
                  <div style={{ fontSize:"0.66rem", color:"var(--white-dim)", letterSpacing:"0.1em", textTransform:"uppercase", marginTop:4 }}>{k}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ marginBottom:32 }}>
              <h3 style={{ fontFamily:"var(--serif)", fontSize:"1.4rem", fontWeight:400, color:"var(--white)", marginBottom:14, borderBottom:"1px solid rgba(255,255,255,0.07)", paddingBottom:12 }}>About This Property</h3>
              <p style={{ color:"var(--white-dim)", lineHeight:1.9, fontSize:"0.92rem" }}>{listing.description}</p>
            </div>

            {/* Features */}
            {listing.features?.length > 0 && (
              <div>
                <h3 style={{ fontFamily:"var(--serif)", fontSize:"1.4rem", fontWeight:400, color:"var(--white)", marginBottom:14, borderBottom:"1px solid rgba(255,255,255,0.07)", paddingBottom:12 }}>Features & Amenities</h3>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
                  {listing.features.map(f => (
                    <div key={f} style={{ display:"flex", alignItems:"center", gap:10, color:"var(--white-dim)", fontSize:"0.88rem" }}>
                      <span style={{ color:"var(--gold)", fontSize:"0.7rem" }}>◈</span> {f}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — Enquiry Form */}
          <div>
            <div style={{ background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.15)", padding:"28px 24px", position:"sticky", top:100 }}>
              <h3 style={{ fontFamily:"var(--serif)", fontSize:"1.4rem", fontWeight:400, color:"var(--white)", marginBottom:6 }}>Enquire About This Property</h3>
              <p style={{ fontSize:"0.78rem", color:"var(--white-dim)", marginBottom:22 }}>One of our consultants will respond within 24 hours.</p>
              {sent ? (
                <div style={{ textAlign:"center", padding:"32px 0" }}>
                  <div style={{ fontSize:"2.5rem", marginBottom:12 }}>✓</div>
                  <div style={{ fontFamily:"var(--serif)", fontSize:"1.3rem", color:"var(--gold)", marginBottom:8 }}>Enquiry Sent!</div>
                  <p style={{ color:"var(--white-dim)", fontSize:"0.85rem" }}>We'll be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleEnquiry} style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <Field label="Full Name">
                    <input value={enquiry.name} onChange={e=>setEnquiry({...enquiry,name:e.target.value})} style={InputStyle} required
                      onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} />
                  </Field>
                  <Field label="Email">
                    <input type="email" value={enquiry.email} onChange={e=>setEnquiry({...enquiry,email:e.target.value})} style={InputStyle} required
                      onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} />
                  </Field>
                  <Field label="Phone">
                    <input value={enquiry.phone} onChange={e=>setEnquiry({...enquiry,phone:e.target.value})} style={InputStyle}
                      onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} />
                  </Field>
                  <Field label="Message">
                    <textarea value={enquiry.message||`I am interested in ${listing.title}. Please contact me.`} onChange={e=>setEnquiry({...enquiry,message:e.target.value})} style={{ ...InputStyle, height:100, resize:"vertical" }}
                      onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} />
                  </Field>
                  <GoldBtn type="submit" style={{ width:"100%", textAlign:"center" }}>{sending?"Sending...":"Send Enquiry"}</GoldBtn>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer setPage={setPage} />
    </div>
  );
};

// ── AUTH PAGES ────────────────────────────────────────────────────────────────
const AuthPage = ({ mode, setPage }) => {
  const { loginUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name:"", email:"", password:"", confirmPassword:"" });
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && form.password !== form.confirmPassword) { toast("Passwords do not match", "error"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));

    // Mock auth — in production, call real API
    if (isLogin) {
      if (form.email === "admin@cybal.com" && form.password === "admin123") {
        loginUser({ _id:"admin1", name:"Admin", email:"admin@cybal.com", role:"admin" });
        toast("Welcome back, Admin!"); setPage("admin"); window.scrollTo(0,0);
      } else if (form.email && form.password.length >= 6) {
        loginUser({ _id:"u1", name:form.email.split("@")[0], email:form.email, role:"user" });
        toast("Welcome back!"); setPage("home"); window.scrollTo(0,0);
      } else {
        toast("Invalid credentials", "error");
      }
    } else {
      loginUser({ _id:"u2", name:form.name, email:form.email, role:"user" });
      toast("Account created successfully!"); setPage("home"); window.scrollTo(0,0);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--dark)", display:"flex", alignItems:"center", justifyContent:"center", padding:"100px 20px 40px" }}>
      <div style={{ width:"100%", maxWidth:440 }}>
        <div onClick={() => setPage("home")} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", marginBottom:40, justifyContent:"center" }}>
          <div style={{ width:28, height:28, background:"linear-gradient(135deg,var(--gold),var(--gold-light))", clipPath:"polygon(50% 0%,100% 35%,100% 100%,0% 100%,0% 35%)" }} />
          <div style={{ fontFamily:"var(--serif)", fontSize:"1rem", fontWeight:600, letterSpacing:"0.06em", color:"var(--white)" }}>CYBAL CAPITAL <span style={{ color:"var(--gold)" }}>LIMITED</span></div>
        </div>

        <div style={{ background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.15)", padding:"40px 36px" }}>
          <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.8rem", fontWeight:300, color:"var(--white)", marginBottom:6 }}>{isLogin?"Sign In":"Create Account"}</h2>
          <p style={{ fontSize:"0.82rem", color:"var(--white-dim)", marginBottom:28 }}>{isLogin?"Access your Cybal Capital account":"Join Cybal Capital Limited"}</p>

          {isLogin && (
            <div style={{ background:"rgba(201,168,76,0.08)", border:"1px solid rgba(201,168,76,0.2)", padding:"10px 14px", marginBottom:20, fontSize:"0.78rem", color:"var(--gold)" }}>
              Demo admin: admin@cybal.com / admin123
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {!isLogin && (
              <Field label="Full Name">
                <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={InputStyle} required
                  onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} />
              </Field>
            )}
            <Field label="Email Address">
              <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={InputStyle} required
                onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} />
            </Field>
            <Field label="Password">
              <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={InputStyle} required
                onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} />
            </Field>
            {!isLogin && (
              <Field label="Confirm Password">
                <input type="password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} style={InputStyle} required
                  onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} />
              </Field>
            )}
            <GoldBtn type="submit" style={{ width:"100%", marginTop:8 }}>{loading?"Please wait...":(isLogin?"Sign In":"Create Account")}</GoldBtn>
          </form>

          <p style={{ textAlign:"center", marginTop:22, fontSize:"0.82rem", color:"var(--white-dim)" }}>
            {isLogin?"Don't have an account? ":"Already have an account? "}
            <span onClick={() => setPage(isLogin?"register":"login")} style={{ color:"var(--gold)", cursor:"pointer" }}>
              {isLogin?"Register":"Sign In"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

// ── ADMIN DASHBOARD ───────────────────────────────────────────────────────────
const AdminPage = ({ setPage }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState("dashboard");
  const [enquiries, setEnquiries] = useState(MOCK_ENQUIRIES);
  const [listings, setListings] = useState(MOCK_LISTINGS);
  const [showForm, setShowForm] = useState(false);
  const [editListing, setEditListing] = useState(null);
  const [form, setForm] = useState({ title:"", description:"", price:"", type:"Apartment", tag:"New", status:"For Sale", location:{address:"",neighbourhood:""}, details:{beds:1,baths:1,sqft:0}, images:[{url:""}], features:"" });

  if (!user || user.role !== "admin") {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--black)" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"var(--serif)", fontSize:"3rem", color:"var(--red)", marginBottom:16 }}>Access Denied</div>
          <p style={{ color:"var(--white-dim)", marginBottom:24 }}>Admin privileges required.</p>
          <GoldBtn onClick={() => setPage("login")}>Sign In as Admin</GoldBtn>
        </div>
      </div>
    );
  }

  const STATS = [
    { label:"Total Listings", value:listings.length, icon:"🏠", color:"var(--gold)" },
    { label:"For Sale", value:listings.filter(l=>l.status==="For Sale").length, icon:"📋", color:"var(--green)" },
    { label:"Sold", value:listings.filter(l=>l.status==="Sold").length, icon:"✓", color:"var(--red)" },
    { label:"New Enquiries", value:enquiries.filter(e=>e.status==="New").length, icon:"✉", color:"var(--gold)" },
  ];

  const openAdd = () => { setEditListing(null); setForm({ title:"", description:"", price:"", type:"Apartment", tag:"New", status:"For Sale", location:{address:"",neighbourhood:""}, details:{beds:1,baths:1,sqft:0}, images:[{url:""}], features:"" }); setShowForm(true); };
  const openEdit = (l) => { setEditListing(l); setForm({ ...l, features: l.features?.join(", ")||"" }); setShowForm(true); };

  const handleSave = (e) => {
    e.preventDefault();
    const data = { ...form, price: Number(form.price), features: form.features.split(",").map(f=>f.trim()).filter(Boolean), images: form.images?.length ? form.images : [{url:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900"}] };
    if (editListing) {
      setListings(ls => ls.map(l => l._id===editListing._id ? { ...l, ...data } : l));
      toast("Property updated successfully");
    } else {
      setListings(ls => [{ ...data, _id:Date.now().toString(), views:0, isFeatured:false, createdAt:new Date().toISOString() }, ...ls]);
      toast("Property added successfully");
    }
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to remove this listing?")) return;
    setListings(ls => ls.filter(l => l._id !== id));
    toast("Property removed");
  };

  const updateEnquiryStatus = (id, status) => {
    setEnquiries(es => es.map(e => e._id===id ? {...e,status} : e));
    toast("Enquiry status updated");
  };

  const TABS = [["dashboard","Dashboard"],["listings","Listings"],["enquiries","Enquiries"]];

  return (
    <div style={{ paddingTop:80, background:"var(--black)", minHeight:"100vh" }}>
      {/* Admin Header */}
      <div style={{ background:"var(--dark)", borderBottom:"1px solid rgba(201,168,76,0.12)", padding:"0 5%" }}>
        <div style={{ maxWidth:"100%", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:24, paddingBottom:0 }}>
          <div>
            <p style={{ fontSize:"0.68rem", letterSpacing:"0.2em", color:"var(--gold)", textTransform:"uppercase" }}>Admin Panel</p>
            <h1 style={{ fontFamily:"var(--serif)", fontSize:"1.8rem", fontWeight:300, color:"var(--white)" }}>Cybal Capital Dashboard</h1>
          </div>
          <GoldBtn small outline onClick={() => setPage("home")}>← Back to Site</GoldBtn>
        </div>
        <div style={{ maxWidth:"100%", margin:"0 auto", display:"flex", gap:0, marginTop:24 }}>
          {TABS.map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ background:"none", border:"none", borderBottom:`2px solid ${tab===key?"var(--gold)":"transparent"}`, padding:"12px 24px", color:tab===key?"var(--gold)":"var(--white-dim)", fontSize:"0.78rem", letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer", fontFamily:"var(--sans)", transition:"all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:"100%", margin:"0 auto", padding:"40px 8%" }}>

        {/* ── DASHBOARD TAB ── */}
        {tab === "dashboard" && (
          <div>
            {/* Stats grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:40 }}>
              {STATS.map((s,i) => (
                <div key={i} style={{ background:"var(--dark2)", border:"1px solid rgba(255,255,255,0.06)", padding:"24px 22px" }}>
                  <div style={{ fontSize:"1.6rem", marginBottom:10 }}>{s.icon}</div>
                  <div style={{ fontFamily:"var(--serif)", fontSize:"2.2rem", fontWeight:500, color:s.color, lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontSize:"0.72rem", color:"var(--white-dim)", letterSpacing:"0.1em", textTransform:"uppercase", marginTop:6 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
              <div style={{ background:"var(--dark2)", border:"1px solid rgba(255,255,255,0.06)", padding:"24px" }}>
                <h3 style={{ fontFamily:"var(--serif)", fontSize:"1.2rem", color:"var(--white)", marginBottom:18, paddingBottom:12, borderBottom:"1px solid rgba(255,255,255,0.07)" }}>Recent Enquiries</h3>
                {enquiries.slice(0,4).map(e => (
                  <div key={e._id} style={{ padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:"0.85rem", color:"var(--white)", marginBottom:2 }}>{e.name}</div>
                      <div style={{ fontSize:"0.72rem", color:"var(--white-dim)" }}>{e.interest} · {fmtDate(e.createdAt)}</div>
                    </div>
                    <span style={{ fontSize:"0.65rem", padding:"3px 10px", background: e.status==="New"?"rgba(201,168,76,0.2)": e.status==="Read"?"rgba(100,100,100,0.2)":"rgba(76,175,130,0.2)", color: e.status==="New"?"var(--gold)":e.status==="Read"?"#aaa":"var(--green)", letterSpacing:"0.08em" }}>{e.status}</span>
                  </div>
                ))}
                <button onClick={()=>setTab("enquiries")} style={{ background:"none", border:"none", color:"var(--gold)", fontSize:"0.75rem", cursor:"pointer", marginTop:14, letterSpacing:"0.1em" }}>View All Enquiries →</button>
              </div>

              <div style={{ background:"var(--dark2)", border:"1px solid rgba(255,255,255,0.06)", padding:"24px" }}>
                <h3 style={{ fontFamily:"var(--serif)", fontSize:"1.2rem", color:"var(--white)", marginBottom:18, paddingBottom:12, borderBottom:"1px solid rgba(255,255,255,0.07)" }}>Recent Listings</h3>
                {listings.slice(0,4).map(l => (
                  <div key={l._id} style={{ padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:"0.85rem", color:"var(--white)", marginBottom:2 }}>{l.title}</div>
                      <div style={{ fontSize:"0.72rem", color:"var(--gold)" }}>{fmtPrice(l.price)}</div>
                    </div>
                    <StatusBadge status={l.status} />
                  </div>
                ))}
                <button onClick={()=>setTab("listings")} style={{ background:"none", border:"none", color:"var(--gold)", fontSize:"0.75rem", cursor:"pointer", marginTop:14, letterSpacing:"0.1em" }}>Manage Listings →</button>
              </div>
            </div>
          </div>
        )}

        {/* ── LISTINGS TAB ── */}
        {tab === "listings" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.6rem", fontWeight:300, color:"var(--white)" }}>Manage Listings ({listings.length})</h2>
              <GoldBtn onClick={openAdd}>+ Add Property</GoldBtn>
            </div>

            {/* Property Form Modal */}
            {showForm && (
              <div onClick={e=>e.target===e.currentTarget&&setShowForm(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:1000, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"80px 20px 20px", overflowY:"auto", backdropFilter:"blur(4px)" }}>
                <div style={{ background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.2)", width:"100%", maxWidth:680, padding:"36px", position:"relative" }}>
                  <button onClick={()=>setShowForm(false)} style={{ position:"absolute", top:16, right:16, background:"none", border:"none", color:"var(--white-dim)", fontSize:"1.2rem", cursor:"pointer" }}>✕</button>
                  <h3 style={{ fontFamily:"var(--serif)", fontSize:"1.6rem", fontWeight:300, color:"var(--white)", marginBottom:24 }}>{editListing?"Edit Property":"Add New Property"}</h3>
                  <form onSubmit={handleSave} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    <Field label="Title"><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={InputStyle} required onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} /></Field>
                    <Field label="Price (KSh)"><input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} style={InputStyle} required onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} /></Field>
                    <Field label="Type">
                      <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{ ...InputStyle, appearance:"none" }}>
                        {["Apartment","House","Villa","Penthouse","Townhouse","Mansion","Studio","Loft"].map(t=><option key={t} value={t} style={{background:"#161616"}}>{t}</option>)}
                      </select>
                    </Field>
                    <Field label="Status">
                      <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={{ ...InputStyle, appearance:"none" }}>
                        {["For Sale","Sold","Under Offer"].map(s=><option key={s} value={s} style={{background:"#161616"}}>{s}</option>)}
                      </select>
                    </Field>
                    <Field label="Tag">
                      <select value={form.tag} onChange={e=>setForm({...form,tag:e.target.value})} style={{ ...InputStyle, appearance:"none" }}>
                        {["New","Featured","Exclusive","Luxury","Hot Deal"].map(t=><option key={t} value={t} style={{background:"#161616"}}>{t}</option>)}
                      </select>
                    </Field>
                    <Field label="Neighbourhood"><input value={form.location?.neighbourhood} onChange={e=>setForm({...form,location:{...form.location,neighbourhood:e.target.value}})} style={InputStyle} required onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} /></Field>
                    <Field label="Address"><input value={form.location?.address} onChange={e=>setForm({...form,location:{...form.location,address:e.target.value}})} style={InputStyle} required onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} /></Field>
                    <Field label="Beds"><input type="number" min="1" value={form.details?.beds} onChange={e=>setForm({...form,details:{...form.details,beds:e.target.value}})} style={InputStyle} onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} /></Field>
                    <Field label="Baths"><input type="number" min="1" value={form.details?.baths} onChange={e=>setForm({...form,details:{...form.details,baths:e.target.value}})} style={InputStyle} onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} /></Field>
                    <Field label="Sqft"><input type="number" value={form.details?.sqft} onChange={e=>setForm({...form,details:{...form.details,sqft:e.target.value}})} style={InputStyle} onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} /></Field>
                    <div style={{ gridColumn:"1/-1" }}>
                      <Field label="Image URL"><input value={form.images?.[0]?.url||""} onChange={e=>setForm({...form,images:[{url:e.target.value}]})} style={InputStyle} placeholder="https://..." onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} /></Field>
                    </div>
                    <div style={{ gridColumn:"1/-1" }}>
                      <Field label="Features (comma separated)"><input value={form.features} onChange={e=>setForm({...form,features:e.target.value})} style={InputStyle} placeholder="Pool, Gym, Security..." onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} /></Field>
                    </div>
                    <div style={{ gridColumn:"1/-1" }}>
                      <Field label="Description"><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{ ...InputStyle, height:90, resize:"vertical" }} required onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} /></Field>
                    </div>
                    <div style={{ gridColumn:"1/-1", display:"flex", gap:12, justifyContent:"flex-end" }}>
                      <GoldBtn outline onClick={()=>setShowForm(false)}>Cancel</GoldBtn>
                      <GoldBtn type="submit">{editListing?"Save Changes":"Add Property"}</GoldBtn>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Listings Table */}
            <div style={{ background:"var(--dark2)", border:"1px solid rgba(255,255,255,0.06)", overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                    {["Property","Location","Price","Type","Status","Views","Actions"].map(h => (
                      <th key={h} style={{ padding:"14px 16px", textAlign:"left", fontSize:"0.65rem", letterSpacing:"0.14em", color:"var(--gold)", textTransform:"uppercase", fontWeight:500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listings.map((l,i) => (
                    <tr key={l._id} style={{ borderBottom:"1px solid rgba(255,255,255,0.05)", background:i%2===0?"transparent":"rgba(255,255,255,0.015)" }}>
                      <td style={{ padding:"14px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                          <img src={l.images?.[0]?.url} alt="" style={{ width:48, height:36, objectFit:"cover" }} />
                          <div style={{ fontSize:"0.85rem", color:"var(--white)", maxWidth:160 }}>{l.title}</div>
                        </div>
                      </td>
                      <td style={{ padding:"14px 16px", fontSize:"0.82rem", color:"var(--white-dim)" }}>{l.location?.neighbourhood}</td>
                      <td style={{ padding:"14px 16px", fontSize:"0.85rem", color:"var(--gold)", fontFamily:"var(--serif)" }}>{fmtPrice(l.price)}</td>
                      <td style={{ padding:"14px 16px", fontSize:"0.78rem", color:"var(--white-dim)" }}>{l.type}</td>
                      <td style={{ padding:"14px 16px" }}><StatusBadge status={l.status} /></td>
                      <td style={{ padding:"14px 16px", fontSize:"0.82rem", color:"var(--white-dim)" }}>{l.views}</td>
                      <td style={{ padding:"14px 16px" }}>
                        <div style={{ display:"flex", gap:8 }}>
                          <button onClick={() => openEdit(l)} style={{ background:"none", border:"1px solid rgba(201,168,76,0.3)", color:"var(--gold)", padding:"5px 12px", fontSize:"0.7rem", cursor:"pointer", letterSpacing:"0.08em" }}>Edit</button>
                          <button onClick={() => handleDelete(l._id)} style={{ background:"none", border:"1px solid rgba(224,92,92,0.3)", color:"var(--red)", padding:"5px 12px", fontSize:"0.7rem", cursor:"pointer", letterSpacing:"0.08em" }}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ENQUIRIES TAB ── */}
        {tab === "enquiries" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.6rem", fontWeight:300, color:"var(--white)" }}>Enquiries ({enquiries.length})</h2>
              <div style={{ display:"flex", gap:8 }}>
                {["All","New","Read","Replied","Closed"].map(s => (
                  <button key={s} style={{ background:"none", border:"1px solid rgba(255,255,255,0.15)", color:"var(--white-dim)", padding:"6px 14px", fontSize:"0.7rem", cursor:"pointer", letterSpacing:"0.08em" }}>{s}</button>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {enquiries.map(e => (
                <div key={e._id} style={{ background:"var(--dark2)", border:"1px solid rgba(255,255,255,0.06)", padding:"20px 22px", display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:20, alignItems:"start" }}>
                  <div>
                    <div style={{ fontSize:"0.65rem", letterSpacing:"0.14em", color:"var(--gold)", textTransform:"uppercase", marginBottom:6 }}>{e.interest}</div>
                    <div style={{ fontSize:"0.95rem", color:"var(--white)", marginBottom:4 }}>{e.name}</div>
                    <div style={{ fontSize:"0.78rem", color:"var(--white-dim)", marginBottom:2 }}>{e.email}</div>
                    <div style={{ fontSize:"0.78rem", color:"var(--white-dim)" }}>{e.phone}</div>
                  </div>
                  <div>
                    <p style={{ fontSize:"0.85rem", color:"var(--white-dim)", lineHeight:1.7, marginBottom:8 }}>"{e.message}"</p>
                    {e.property && <div style={{ fontSize:"0.72rem", color:"var(--gold)" }}>Re: {e.property.title}</div>}
                    <div style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.25)", marginTop:4 }}>{fmtDate(e.createdAt)}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end" }}>
                    <span style={{ fontSize:"0.65rem", padding:"3px 10px", background: e.status==="New"?"rgba(201,168,76,0.2)":e.status==="Replied"?"rgba(76,175,130,0.2)":"rgba(100,100,100,0.2)", color:e.status==="New"?"var(--gold)":e.status==="Replied"?"var(--green)":"#aaa" }}>{e.status}</span>
                    <select value={e.status} onChange={ev=>updateEnquiryStatus(e._id,ev.target.value)} style={{ ...InputStyle, padding:"5px 10px", fontSize:"0.72rem", width:"auto", appearance:"none", cursor:"pointer" }}>
                      {["New","Read","Replied","Closed"].map(s=><option key={s} value={s} style={{background:"#161616"}}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── CONTACT PAGE ──────────────────────────────────────────────────────────────
const ContactPage = ({ setPage }) => {
  const toast = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState({ name:user?.name||"", email:user?.email||"", phone:"", interest:"Buying", message:"" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false); setSent(true);
    toast("Enquiry submitted! We'll be in touch shortly.");
  };

  return (
    <div style={{ paddingTop:80, background:"var(--dark)", minHeight:"100vh" }}>
      <div style={{ background:"var(--black)", padding:"60px 8% 50px", borderBottom:"1px solid rgba(201,168,76,0.1)" }}>
        <div style={{ maxWidth:"100%", margin:"0 auto" }}>
          <p style={{ fontSize:"0.7rem", letterSpacing:"0.24em", color:"var(--gold)", textTransform:"uppercase", marginBottom:12 }}>Get In Touch</p>
          <h1 style={{ fontFamily:"var(--serif)", fontSize:"clamp(2rem,4vw,3rem)", fontWeight:300, color:"var(--white)" }}>Contact Us</h1>
        </div>
      </div>

      <div style={{ maxWidth:"100%", margin:"0 auto", padding:"72px 5%", display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"start" }}>
        {/* Info */}
        <div>
          <div style={{ width:36, height:1, background:"var(--gold)", marginBottom:24 }} />
          <h2 style={{ fontFamily:"var(--serif)", fontSize:"clamp(1.8rem,3vw,2.6rem)", fontWeight:300, color:"var(--white)", lineHeight:1.25, marginBottom:20 }}>Begin Your Property Journey</h2>
          <p style={{ color:"var(--white-dim)", lineHeight:1.9, fontSize:"0.92rem", marginBottom:44 }}>Our team of experts is ready to connect you with the finest properties. Reach out and let us curate an exclusive selection tailored to your needs.</p>
          {[{ label:"Office", value:"Westlands Business Park" },{ label:"Phone", value:"+254 700 000 000" },{ label:"Email", value:"info@cybalcapital.co.ke" }].map(({ label, value }) => (
            <div key={label} style={{ marginBottom:22, display:"flex", gap:18, alignItems:"flex-start" }}>
              <div style={{ width:1, background:"var(--gold)", height:38, marginTop:2, flexShrink:0 }} />
              <div>
                <div style={{ fontSize:"0.64rem", letterSpacing:"0.2em", color:"var(--gold)", textTransform:"uppercase", marginBottom:4 }}>{label}</div>
                <div style={{ color:"var(--white)", fontSize:"0.9rem" }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={{ background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.12)", padding:"36px 32px" }}>
          {sent ? (
            <div style={{ textAlign:"center", padding:"40px 0" }}>
              <div style={{ fontSize:"3rem", marginBottom:16 }}>✓</div>
              <div style={{ fontFamily:"var(--serif)", fontSize:"1.6rem", color:"var(--gold)", marginBottom:10 }}>Message Sent!</div>
              <p style={{ color:"var(--white-dim)", marginBottom:24 }}>Thank you for reaching out. We'll respond within 24 hours.</p>
              <GoldBtn outline onClick={() => setSent(false)}>Send Another</GoldBtn>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <Field label="Full Name"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={InputStyle} required onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} /></Field>
                <Field label="Email"><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={InputStyle} required onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} /></Field>
              </div>
              <Field label="Phone"><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={InputStyle} onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} /></Field>
              <Field label="Interest">
                <select value={form.interest} onChange={e=>setForm({...form,interest:e.target.value})} style={{ ...InputStyle, appearance:"none" }}>
                  {["Buying","Selling","Investment Advisory","General Enquiry"].map(o=><option key={o} value={o} style={{background:"#161616"}}>{o}</option>)}
                </select>
              </Field>
              <Field label="Message"><textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} style={{ ...InputStyle, height:130, resize:"vertical" }} required onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} /></Field>
              <GoldBtn type="submit" style={{ width:"100%" }}>{loading?"Sending...":"Send Enquiry"}</GoldBtn>
            </form>
          )}
        </div>
      </div>
      <Footer setPage={setPage} />
    </div>
  );
};

// ── ABOUT PAGE ────────────────────────────────────────────────────────────────
const AboutPage = ({ setPage }) => (
  <div style={{ paddingTop:80, background:"var(--black)", minHeight:"100vh" }}>
    <div style={{ background:"var(--dark)", padding:"60px 8% 50px", borderBottom:"1px solid rgba(201,168,76,0.1)" }}>
      <div style={{ maxWidth:"100%", margin:"0 auto" }}>
        <p style={{ fontSize:"0.7rem", letterSpacing:"0.24em", color:"var(--gold)", textTransform:"uppercase", marginBottom:12 }}>Our Story</p>
        <h1 style={{ fontFamily:"var(--serif)", fontSize:"clamp(2rem,4vw,3rem)", fontWeight:300, color:"var(--white)" }}>About Cybal Capital</h1>
      </div>
    </div>
    <div style={{ maxWidth:"100%", margin:"0 auto", padding:"72px 5%" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center", marginBottom:80 }}>
        <div style={{ position:"relative" }}>
          <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=85" alt="City" style={{ width:"100%", height:500, objectFit:"cover" }} />
          <div style={{ position:"absolute", top:-14, left:-14, width:"55%", height:"55%", border:"1px solid var(--gold)", zIndex:-1 }} />
          <div style={{ position:"absolute", bottom:-22, right:-22, background:"var(--gold)", padding:"22px 26px", textAlign:"center" }}>
            <div style={{ fontFamily:"var(--serif)", fontSize:"2rem", fontWeight:600, color:"var(--black)" }}>4+</div>
            <div style={{ fontSize:"0.65rem", letterSpacing:"0.1em", color:"rgba(8,8,8,0.7)", textTransform:"uppercase", marginTop:4 }}>Years<br/>Excellence</div>
          </div>
        </div>
        <div>
          <h2 style={{ fontFamily:"var(--serif)", fontSize:"clamp(1.8rem,3vw,2.6rem)", fontWeight:300, color:"var(--white)", lineHeight:1.25, marginBottom:22 }}>A Premier Luxury Real Estate Marketing Company</h2>
          <p style={{ color:"var(--white-dim)", lineHeight:1.9, fontSize:"0.92rem", marginBottom:18 }}><strong style={{ color:"var(--white)", fontWeight:500 }}>Cybal Capital Limited</strong> is a premier luxury real estate marketing company, offering exclusive access to multi-million-dollar properties. With a commitment to excellence, we provide bespoke real estate solutions tailored to meet the unique needs of our clients.</p>
          <p style={{ color:"var(--white-dim)", lineHeight:1.9, fontSize:"0.92rem", marginBottom:18 }}>Guided by our core values of quality, integrity, and innovation, we passionately strive to deliver exceptional marketing strategies and customer service that highlight the true potential of premium developments.</p>
          <p style={{ color:"var(--white-dim)", lineHeight:1.9, fontSize:"0.92rem", marginBottom:36 }}>With over four years of expertise, Cybal Capital Limited connects discerning clients with luxurious and sustainable properties, making us a trusted name in the competitive real estate market.</p>
          <div style={{ display:"flex", gap:36 }}>
            {["Quality","Integrity","Innovation"].map(v=>(
              <div key={v}>
                <div style={{ width:22, height:1, background:"var(--gold)", marginBottom:8 }} />
                <div style={{ fontFamily:"var(--serif)", fontSize:"1rem", color:"var(--white)" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <Footer setPage={setPage} />
  </div>
);

// ── FOOTER ────────────────────────────────────────────────────────────────────
const Footer = ({ setPage }) => {
  const go = (p) => { setPage(p); window.scrollTo(0,0); };
  return (
    <footer style={{ background:"#050505", borderTop:"1px solid rgba(201,168,76,0.12)", padding:"56px 5% 32px" }}>
      <div style={{ maxWidth:"100%", margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:32, marginBottom:36 }}>
          <div>
            <div style={{ fontFamily:"var(--serif)", fontSize:"1.2rem", fontWeight:600, color:"var(--white)", letterSpacing:"0.06em", marginBottom:3 }}>CYBAL CAPITAL</div>
            <div style={{ fontSize:"0.58rem", letterSpacing:"0.22em", color:"var(--gold)", marginBottom:16 }}>LIMITED</div>
            <p style={{ fontSize:"0.82rem", color:"var(--white-dim)", lineHeight:1.8, maxWidth:260, fontWeight:300 }}>Premier luxury real estate marketing, connecting discerning clients with the finest properties since 2020.</p>
          </div>
          {[["Company",[["home","Home"],["about","About"],["contact","Contact"]]],["Properties",[["properties","All Properties"],["properties","Featured"],["properties","For Sale"]]],["Contact",[null,"Head Office","+254 700 000 000","info@cybalcapital.co.ke"]]].map(([col, items]) => (
            <div key={col}>
              <div style={{ fontSize:"0.66rem", letterSpacing:"0.18em", color:"var(--gold)", textTransform:"uppercase", marginBottom:16, fontWeight:500 }}>{col}</div>
              {items.map((item,i) => (
                typeof item === "string" ? (
                  <div key={i} style={{ fontSize:"0.82rem", color:"var(--white-dim)", marginBottom:10, fontWeight:300 }}>{item}</div>
                ) : item && item[0] ? (
                  <div key={i} onClick={() => go(item[0])} style={{ fontSize:"0.82rem", color:"var(--white-dim)", marginBottom:10, cursor:"pointer", fontWeight:300 }}
                    onMouseEnter={e=>e.target.style.color="var(--gold)"} onMouseLeave={e=>e.target.style.color="var(--white-dim)"}>{item[1]}</div>
                ) : null
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:"0.73rem", color:"rgba(255,255,255,0.22)" }}>© 2026 Cybal Capital Limited. All rights reserved.</div>
          <div style={{ display:"flex", gap:20, alignItems:"center" }}>
            {["Privacy Policy","Terms of Service"].map(t=>(
              <span key={t} style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.22)", cursor:"pointer" }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Hidden admin link — subtle, only you know it's clickable */}
        <div style={{ marginTop:12, textAlign:"left" }}>
          <span
            onClick={() => go("admin-login")}
            style={{ fontSize:"0.58rem", color:"rgba(255,255,255,0.08)", cursor:"default", letterSpacing:"0.18em", textTransform:"uppercase", userSelect:"none", transition:"color 0.3s" }}
            onMouseEnter={e => { e.target.style.color="rgba(201,168,76,0.35)"; e.target.style.cursor="pointer"; }}
            onMouseLeave={e => { e.target.style.color="rgba(255,255,255,0.08)"; e.target.style.cursor="default"; }}>
            Admin
          </span>
        </div>
      </div>
    </footer>
  );
};

// ── ADMIN LOGIN PAGE (Secret) ─────────────────────────────────────────────────
const AdminLoginPage = ({ setPage }) => {
  const { loginUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    if (form.email === "admin@cybal.com" && form.password === "admin123") {
      loginUser({ _id:"admin1", name:"Admin", email:"admin@cybal.com", role:"admin" });
      toast("Welcome, Admin!"); setPage("admin"); window.scrollTo(0,0);
    } else {
      toast("Invalid admin credentials", "error");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--dark)", display:"flex", alignItems:"center", justifyContent:"center", padding:"100px 20px 40px" }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ width:48, height:48, background:"linear-gradient(135deg,var(--gold),var(--gold-light))", clipPath:"polygon(50% 0%,100% 35%,100% 100%,0% 100%,0% 35%)", margin:"0 auto 16px" }} />
          <div style={{ fontFamily:"var(--serif)", fontSize:"1.2rem", fontWeight:600, color:"var(--white)", letterSpacing:"0.06em" }}>CYBAL CAPITAL</div>
          <div style={{ fontSize:"0.6rem", letterSpacing:"0.22em", color:"var(--gold)", marginTop:4 }}>ADMIN ACCESS</div>
        </div>

        <div style={{ background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.2)", padding:"36px 32px" }}>
          <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.6rem", fontWeight:300, color:"var(--white)", marginBottom:6 }}>Admin Sign In</h2>
          <p style={{ fontSize:"0.78rem", color:"var(--white-dim)", marginBottom:28 }}>Restricted access. Authorised personnel only.</p>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Field label="Admin Email">
              <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={InputStyle} required
                onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} />
            </Field>
            <Field label="Password">
              <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={InputStyle} required
                onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} />
            </Field>
            <GoldBtn type="submit" style={{ width:"100%", marginTop:8 }}>
              {loading ? "Verifying..." : "Access Dashboard"}
            </GoldBtn>
          </form>

          <p onClick={()=>setPage("home")} style={{ textAlign:"center", marginTop:20, fontSize:"0.78rem", color:"var(--white-dim)", cursor:"pointer" }}>
            ← Back to Website
          </p>
        </div>

        <p style={{ textAlign:"center", marginTop:16, fontSize:"0.68rem", color:"rgba(255,255,255,0.15)", letterSpacing:"0.1em" }}>
          CYBAL CAPITAL LIMITED · ADMIN PORTAL
        </p>
      </div>
    </div>
  );
};

// ── SECRET ADMIN PATH (only you know this URL) ───────────────────────────────
const SECRET_PATH = "cybal-admin-2026"; // change this anytime

// ── APP ROUTER ────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");

  // Listen for secret URL hash
  useEffect(() => {
    const check = () => {
      const hash = window.location.hash.replace("#/", "").replace("#", "");
      if (hash === SECRET_PATH) setPage("admin-login");
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);

  // Clear hash when leaving admin
  useEffect(() => {
    if (!["admin","admin-login"].includes(page)) {
      history.replaceState(null, "", window.location.pathname);
    }
  }, [page]);

  const renderPage = () => {
    switch(page) {
      case "home":            return <HomePage setPage={setPage} />;
      case "properties":      return <PropertiesPage setPage={setPage} />;
      case "property-detail": return <PropertyDetailPage setPage={setPage} />;
      case "about":           return <AboutPage setPage={setPage} />;
      case "contact":         return <ContactPage setPage={setPage} />;
      case "login":           return <HomePage setPage={setPage} />;
      case "register":        return <HomePage setPage={setPage} />;
      case "admin-login":     return <AdminLoginPage setPage={setPage} />;
      case "admin":           return <AdminPage setPage={setPage} />;
      default:                return <HomePage setPage={setPage} />;
    }
  };

  return (
    <AuthProvider>
      <ToastProvider>
        <GlobalStyles />
        <Navbar page={page} setPage={setPage} />
        {renderPage()}
      </ToastProvider>
    </AuthProvider>
  );
}