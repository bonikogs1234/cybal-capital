import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { db, auth, storage } from "./firebase";
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ── GLOBAL STYLES ─────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --black: #12122a; --dark: #1a1a3e; --dark2: #222255;
      --gold: #c9a84c; --gold-light: #e2c47a; --gold-dim: rgba(201,168,76,0.15);
      --white: #f0eee8; --white-dim: rgba(240,238,232,0.65);
      --green: #4caf82; --red: #e05c5c;
      --serif: 'Cormorant Garamond', serif; --sans: 'Jost', sans-serif;
    }
    html { scroll-behavior: smooth; }
    body { background: var(--black); color: var(--white); font-family: var(--sans); font-weight: 300; overflow-x: hidden; width: 100%; }
    * { max-width: 100%; box-sizing: border-box; }
    img { max-width: 100%; height: auto; }
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

    /* ── VIEWPORT FIX ── */
    html { font-size: 16px; }
    meta[name="viewport"] { content: "width=device-width, initial-scale=1.0"; }

    /* ── NAVBAR ── */
    .desktop-nav { display:flex !important; }
    .hamburger   { display:none !important; }
    .mobile-menu { display:none !important; }

    /* ── MOBILE 768px ── */
    @media (max-width: 768px) {
      /* Navbar */
      .desktop-nav { display:none !important; }


      /* Grids */
      .stats-grid    { grid-template-columns:1fr 1fr !important; }
      .prop-grid     { grid-template-columns:1fr !important; }
      .about-grid    { grid-template-columns:1fr !important; gap:24px !important; }
      .services-grid { grid-template-columns:1fr 1fr !important; gap:12px !important; }
      .contact-grid  { grid-template-columns:1fr !important; gap:24px !important; }
      .footer-grid   { grid-template-columns:1fr 1fr !important; gap:20px !important; }
      .locations-grid{ grid-template-columns:1fr 1fr !important; }
      .detail-grid   { grid-template-columns:1fr !important; }
      .detail-stats  { grid-template-columns:1fr 1fr !important; }
      .admin-stats   { grid-template-columns:1fr 1fr !important; }
      .admin-recent  { grid-template-columns:1fr !important; }
      .form-row      { grid-template-columns:1fr !important; }
      .cta-banner    { flex-direction:column !important; text-align:center !important; gap:12px !important; }

      /* Hero */
      .hero-content  { padding:0 6% 22% !important; }
      .hero-btns     { flex-direction:column !important; gap:10px !important; width:100% !important; }
      .hero-btns button { width:100% !important; }
      .scroll-indicator { display:none !important; }

      /* Cards */
      .prop-card-img { height:200px !important; }

      /* Admin */
      .admin-tabs { overflow-x:auto !important; white-space:nowrap !important; -webkit-overflow-scrolling:touch !important; }

      /* Footer */
      .footer-bottom { flex-direction:column !important; gap:10px !important; text-align:center !important; }

      /* Touch targets */
      button, a, [onClick] { min-height:44px; min-width:44px; }

      /* Sections padding */
      .section-pad { padding:48px 5% !important; }
    }

    /* ── MOBILE 480px ── */
    @media (max-width: 480px) {
      .services-grid { grid-template-columns:1fr !important; }
      .footer-grid   { grid-template-columns:1fr !important; }
    }

    @keyframes slideIn { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }

    /* ── GLOBAL OVERFLOW FIX ── */
    html, body { overflow-x: hidden; width: 100%; max-width: 100%; }
    #root { overflow-x: hidden; width: 100%; }
    input, select, textarea { font-size: 16px !important; width: 100% !important; max-width: 100% !important; }
    img { max-width: 100% !important; }

    @media (max-width: 768px) {
      /* Contact page */
      .contact-grid { grid-template-columns: 1fr !important; gap: 24px !important; }

      /* About page */  
      .about-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
      .about-img-wrap { position: relative; margin-bottom: 24px; }
      .about-gold-box { display: none !important; }

      /* Footer */
      .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 20px !important; }

      /* Page headers */
      .page-header { padding: 24px 5% 20px !important; }

      /* Form rows */
      .form-row { grid-template-columns: 1fr !important; }

      /* Admin enquiries */
      .enquiry-grid { grid-template-columns: 1fr !important; }

      /* Properties filters */
      .filter-bar { flex-wrap: wrap !important; gap: 8px !important; }
      .filter-bar select, .filter-bar input { flex: 1 1 calc(50% - 4px) !important; min-width: 0 !important; }

      /* Property detail */
      .detail-grid { grid-template-columns: 1fr !important; }

      /* CTA */
      .cta-banner { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
    }

    @media (max-width: 480px) {
      .footer-grid { grid-template-columns: 1fr !important; }
      .filter-bar select, .filter-bar input { flex: 1 1 100% !important; }
      .stats-grid { grid-template-columns: 1fr 1fr !important; }
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
const fmtDate  = (d) => {
  if (!d) return "—";
  try {
    // Firebase Timestamp object has .toDate() method
    const date = d?.toDate ? d.toDate() : new Date(d);
    if (isNaN(date)) return "—";
    return date.toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
  } catch { return "—"; }
};

// ── FIREBASE API ─────────────────────────────────────────────────────────────
const api = {
  // Properties
  getProperties: async (filters = {}) => {
    const q = query(collection(db, "properties"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    let props = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (filters.type) props = props.filter(p => p.type === filters.type);
    if (filters.status) props = props.filter(p => p.status === filters.status);
    if (filters.neighbourhood) props = props.filter(p => p.location?.neighbourhood?.toLowerCase().includes(filters.neighbourhood.toLowerCase()));
    if (filters.search) props = props.filter(p => p.title?.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.minPrice) props = props.filter(p => p.price >= Number(filters.minPrice));
    if (filters.maxPrice) props = props.filter(p => p.price <= Number(filters.maxPrice));
    return props;
  },
  getFeatured: async () => {
    const q = query(collection(db, "properties"), where("isFeatured", "==", true), limit(6));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  getProperty: async (id) => {
    const snap = await getDoc(doc(db, "properties", id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },
  createProperty: async (data) => {
    return await addDoc(collection(db, "properties"), { ...data, createdAt: serverTimestamp(), views: 0 });
  },
  updateProperty: async (id, data) => {
    return await updateDoc(doc(db, "properties", id), data);
  },
  deleteProperty: async (id) => {
    return await deleteDoc(doc(db, "properties", id));
  },
  // Enquiries
  submitEnquiry: async (data) => {
    return await addDoc(collection(db, "enquiries"), { ...data, status: "New", createdAt: serverTimestamp() });
  },
  getEnquiries: async () => {
    const q = query(collection(db, "enquiries"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  updateEnquiryStatus: async (id, status) => {
    return await updateDoc(doc(db, "enquiries", id), { status });
  },
  // Upload image
  uploadImage: async (file, path) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }
};

// ── AUTH CONTEXT ──────────────────────────────────────────────────────────────
const AuthCtx = createContext();
const useAuth = () => useContext(AuthCtx);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: "Admin", role: "admin" });
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  const loginUser = (userData) => setUser(userData);
  const logoutUser = async () => {
    await signOut(auth);
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
        border:"1px solid var(--gold)", padding: small?"8px 22px":"14px 36px",
        fontSize: small?"0.72rem":"0.78rem", letterSpacing:"0.14em", textTransform:"uppercase",
        cursor:"pointer", fontWeight:500, transition:"all 0.25s", borderRadius:"4px", ...style }}>
      {children}
    </button>
  );
};

const InputStyle = { width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.12)", color:"var(--white)", padding:"12px 14px", fontSize:"16px", fontWeight:300, outline:"none", transition:"border-color 0.2s", boxSizing:"border-box" };
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
  const colors = { "For Sale":"var(--green)", "For Rent":"#4a9eda", Sold:"var(--red)", "Under Offer":"var(--gold)", Rented:"#9b72cf" };
  return <span style={{ color:colors[status]||"#888", fontSize:"0.7rem", fontWeight:600, letterSpacing:"0.08em" }}>{status}</span>;
};

// ── NAVBAR ────────────────────────────────────────────────────────────────────
const Navbar = ({ page, setPage }) => {
  const { user, logoutUser } = useAuth();
  const toast = useToast();
  const [userMenu, setUserMenu] = useState(false);

  const go = (p) => { setPage(p); setUserMenu(false); window.scrollTo(0,0); };

  const NAV_LINKS = [
    { page:"home",       label:"Home" },
    { page:"properties", label:"Properties" },
    { page:"about",      label:"About" },
    { page:"contact",    label:"Contact" },
  ];

  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:999, background:"rgba(12,12,40,0.97)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(201,168,76,0.15)" }}>

      {/* Row 1 — Logo */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
        <div onClick={() => go("home")} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
          <div style={{ width:34, height:34, background:"linear-gradient(135deg,var(--gold),var(--gold-light))", clipPath:"polygon(50% 0%,100% 30%,100% 100%,0% 100%,0% 30%)", flexShrink:0 }} />
          <div>
            <div style={{ fontFamily:"var(--serif)", fontSize:"0.95rem", fontWeight:700, letterSpacing:"0.06em", color:"var(--white)", lineHeight:1.1 }}>CYBAL CAPITAL</div>
            <div style={{ fontSize:"0.44rem", letterSpacing:"0.2em", color:"var(--gold)" }}>LIMITED</div>
          </div>
        </div>

        {/* Admin avatar — top right */}
        {user?.role === "admin" && (
          <div style={{ position:"relative" }}>
            <div onClick={()=>setUserMenu(!userMenu)} style={{ width:30, height:30, borderRadius:"50%", background:"var(--gold)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--black)", fontSize:"0.78rem", fontWeight:700, cursor:"pointer" }}>
              A
            </div>
            {userMenu && (
              <div style={{ position:"absolute", top:42, right:0, background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.2)", minWidth:160, borderRadius:4, zIndex:100, overflow:"hidden" }}>
                <div onClick={()=>go("admin")} style={{ padding:"12px 16px", fontSize:"0.8rem", color:"var(--gold)", cursor:"pointer", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>⚙ Dashboard</div>
                <div onClick={()=>{ logoutUser(); toast("Logged out"); go("home"); }} style={{ padding:"12px 16px", fontSize:"0.8rem", color:"var(--red)", cursor:"pointer" }}>↩ Log Out</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Row 2 — Nav links spread full width */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-around", padding:"0" }}>
        {NAV_LINKS.map(({page:p, label}) => (
          <span key={p} onClick={() => go(p)} style={{
            flex:1, textAlign:"center",
            color: page===p ? "var(--gold)" : "var(--white-dim)",
            fontSize:"0.62rem", letterSpacing:"0.1em", textTransform:"uppercase",
            cursor:"pointer", transition:"all 0.2s", fontWeight:page===p?600:300,
            padding:"9px 4px",
            borderBottom: page===p ? "2px solid var(--gold)" : "2px solid transparent",
            display:"block"
          }}
            onMouseEnter={e=>{ e.currentTarget.style.color="var(--gold)"; }}
            onMouseLeave={e=>{ if(page!==p) e.currentTarget.style.color="var(--white-dim)"; }}>
            {label}
          </span>
        ))}
      </div>

    </nav>
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
        <div className="hero-content" style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 5% 12%" }}>
          <div style={{ width:50, height:1, background:"var(--gold)", marginBottom:24, animation:"fadeIn 1s 0.3s both" }} />
          <div style={{ animation:"fadeUp 0.9s 0.4s both" }}>
            <p style={{ fontSize:"0.65rem", letterSpacing:"0.15em", color:"var(--gold)", textTransform:"uppercase", marginBottom:16 }}>Premier Luxury Real Estate · Exclusive Properties</p>
            <h1 style={{ fontFamily:"var(--serif)", fontSize:"clamp(2.4rem, 7vw, 6rem)", fontWeight:300, lineHeight:1.05, color:"var(--white)", marginBottom:24 }}>
              Welcome to<br/><em style={{ fontStyle:"italic", color:"var(--gold-light)" }}>Cybal Capital</em><br/>Limited
            </h1>
            <p style={{ fontSize:"1rem", color:"var(--white-dim)", maxWidth:"100%", lineHeight:1.7, marginBottom:32 }}>
              Exclusive access to multi-million-dollar properties. Guided by quality, integrity, and innovation.
            </p>
            <div className="hero-btns" style={{ display:"flex", gap:14 }}>
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
        <div className="scroll-indicator" style={{ position:"absolute", bottom:36, right:48, display:"flex", flexDirection:"column", alignItems:"center", gap:8, animation:"float 2.5s ease-in-out infinite" }}>
          <div style={{ fontSize:"0.58rem", letterSpacing:"0.2em", color:"var(--white-dim)", writingMode:"vertical-rl" }}>Scroll</div>
          <div style={{ width:1, height:48, background:"linear-gradient(to bottom,var(--gold),transparent)" }} />
        </div>
      </section>

      {/* Stats */}
      <section style={{ background:"var(--gold)" }}>
        <div className="stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", width:"100%", margin:"0 auto" }}>
          {STATS.map((s,i) => (
            <div key={i} style={{ padding:"20px 8px", textAlign:"center", borderRight:i<3?"1px solid rgba(8,8,8,0.15)":"none" }}>
              <div style={{ fontFamily:"var(--serif)", fontSize:"1.9rem", fontWeight:600, color:"var(--black)" }}>{s.value}</div>
              <div style={{ fontSize:"0.68rem", letterSpacing:"0.14em", color:"rgba(8,8,8,0.6)", textTransform:"uppercase", marginTop:5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section style={{ background:"var(--black)", padding:"clamp(40px,6vw,80px) 5%" }}>
        <div style={{ maxWidth:"100%", margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:52 }}>
            <div>
              <p style={{ fontSize:"0.7rem", letterSpacing:"0.24em", color:"var(--gold)", textTransform:"uppercase", marginBottom:12 }}>Handpicked For You</p>
              <h2 style={{ fontFamily:"var(--serif)", fontSize:"clamp(2rem,4vw,3rem)", fontWeight:300, color:"var(--white)" }}>Featured Properties</h2>
            </div>
            <GoldBtn outline small onClick={() => { setPage("properties"); window.scrollTo(0,0); }}>View All</GoldBtn>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:20 }}>
            {featured.map(l => <PropertyCard key={l.id||l._id} listing={l} setPage={setPage} />)}
          </div>
        </div>
      </section>

      {/* About snippet */}
      <section style={{ background:"var(--dark)", padding:"clamp(40px,6vw,80px) 5%" }}>
        <div style={{ maxWidth:"100%", margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, alignItems:"center" }}>
          <div style={{ position:"relative" }}>
            <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=85" alt="City skyline" style={{ width:"100%", height:"clamp(280px,40vw,500px)", objectFit:"cover" }} />
            <div className="about-gold-box" style={{ position:"absolute", top:-14, left:-14, width:"55%", height:"55%", border:"1px solid var(--gold)", zIndex:-1 }} />
            <div className="about-gold-box" style={{ position:"absolute", bottom:-22, right:-22, background:"var(--gold)", padding:"16px 20px", textAlign:"center" }}>
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
      <section style={{ background:"var(--black)", padding:"clamp(40px,6vw,80px) 5%" }}>
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
    <div style={{ paddingTop:90, background:"var(--black)", minHeight:"100vh" }}>
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
                {listings.map(l => <PropertyCard key={l.id||l._id} listing={l} setPage={setPage} />)}
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
    try {
      await api.submitEnquiry({ ...enquiryForm, propertyId: property?.id || null, propertyTitle: property?.title || "" });
      setSent(true);
      toast("Enquiry sent! We will be in touch shortly.");
    } catch (err) {
      toast("Error sending enquiry. Please try again.", "error");
    }
    setSending(false);
  };

  return (
    <div style={{ paddingTop:90, background:"var(--black)", minHeight:"100vh" }}>
      {/* Back */}
      <div style={{ padding:"20px 8%", background:"var(--dark)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <span onClick={() => { setPage("properties"); window.scrollTo(0,0); }} style={{ color:"var(--gold)", fontSize:"0.8rem", cursor:"pointer", letterSpacing:"0.1em" }}>← Back to Properties</span>
      </div>

      <div style={{ maxWidth:"100%", margin:"0 auto", padding:"48px 5%" }}>
        <div className="detail-grid" style={{ display:"grid", gridTemplateColumns:"1fr minmax(0,360px)", gap:32 }}>
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
  const [enquiries, setEnquiries] = useState([]);
  const [listings, setListings] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editListing, setEditListing] = useState(null);
  const [form, setForm] = useState({ title:"", description:"", price:"", type:"Apartment", tag:"New", status:"For Sale", location:{address:"",neighbourhood:""}, details:{beds:1,baths:1,sqft:0}, images:[{url:""}], features:"" });

  // Load data from Firebase
  useEffect(() => {
    if (!user || user.role !== "admin") return;
    setLoadingData(true);
    Promise.all([api.getProperties(), api.getEnquiries()])
      .then(([props, enqs]) => {
        setListings(props.length > 0 ? props : MOCK_LISTINGS);
        setEnquiries(enqs);
        setLoadingData(false);
      })
      .catch(() => {
        setListings(MOCK_LISTINGS);
        setEnquiries([]);
        setLoadingData(false);
      });
  }, [user]);

  if (!user || user.role !== "admin") {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--black)" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"var(--serif)", fontSize:"3rem", color:"var(--red)", marginBottom:16 }}>Access Denied</div>
          <p style={{ color:"var(--white-dim)", marginBottom:24 }}>Admin privileges required.</p>
          <GoldBtn onClick={() => setPage("admin-login")}>Sign In as Admin</GoldBtn>
        </div>
      </div>
    );
  }

  const STATS = [
    { label:"Total Listings", value:listings.length, icon:"🏠", color:"var(--gold)" },
    { label:"For Sale", value:listings.filter(l=>l.status==="For Sale").length, icon:"📋", color:"var(--green)" },
    { label:"For Rent", value:listings.filter(l=>l.status==="For Rent").length, icon:"🔑", color:"#4a9eda" },
    { label:"Sold", value:listings.filter(l=>l.status==="Sold").length, icon:"✓", color:"var(--red)" },
    { label:"New Enquiries", value:enquiries.filter(e=>e.status==="New").length, icon:"✉", color:"var(--gold)" },
  ];

  const openAdd = () => { setEditListing(null); setForm({ title:"", description:"", price:"", type:"Apartment", tag:"New", status:"For Sale", location:{address:"",neighbourhood:""}, details:{beds:1,baths:1,sqft:0}, images:[{url:""}], features:"" }); setShowForm(true); };
  const openEdit = (l) => { setEditListing({...l, id: l.id||l._id}); setForm({ ...l, features: l.features?.join(", ")||"" }); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = { ...form, price: Number(form.price), features: form.features.split(",").map(f=>f.trim()).filter(Boolean), images: form.images?.length ? form.images : [{url:"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900"}] };
    try {
      if (editListing) {
        await api.updateProperty(editListing.id||editListing._id, data);
        setListings(ls => ls.map(l => (l.id||l._id)===(editListing.id||editListing._id) ? { ...l, ...data } : l));
        toast("Property updated successfully");
      } else {
        const ref = await api.createProperty(data);
        setListings(ls => [{ ...data, id: ref.id, views:0, isFeatured:false }, ...ls]);
        toast("Property added successfully");
      }
    } catch (err) {
      toast("Error saving property", "error");
    }
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this listing?")) return;
    try {
      await api.deleteProperty(id);
      setListings(ls => ls.filter(l => (l.id||l._id) !== id));
      toast("Property removed");
    } catch (err) {
      toast("Error removing property", "error");
    }
  };

  const updateEnquiryStatus = async (id, status) => {
    try {
      await api.updateEnquiryStatus(id, status);
      setEnquiries(es => es.map(e => (e.id||e._id)===id ? {...e,status} : e));
      toast("Enquiry status updated");
    } catch (err) {
      toast("Error updating status", "error");
    }
  };

  const TABS = [["dashboard","Dashboard"],["listings","Listings"],["enquiries","Enquiries"]];

  return (
    <div style={{ paddingTop:90, background:"var(--black)", minHeight:"100vh" }}>
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
                  <div key={e.id||e._id} style={{ padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
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
                  <div key={l.id||l._id} style={{ padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
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
                        {["For Sale","For Rent","Sold","Rented","Under Offer"].map(s=><option key={s} value={s} style={{background:"#161616"}}>{s}</option>)}
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
                      <label style={LabelStyle}>Property Image</label>
                      
                      {/* Preview */}
                      {form.images?.[0]?.url && (
                        <div style={{ position:"relative", marginBottom:10 }}>
                          <img src={form.images[0].url} alt="Preview" style={{ width:"100%", height:160, objectFit:"cover", borderRadius:2 }} 
                            onError={e=>e.target.style.display="none"} />
                          <div onClick={()=>setForm({...form,images:[{url:""}]})} style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.7)", color:"#fff", width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:"1rem" }}>✕</div>
                        </div>
                      )}

                      {/* Upload from device */}
                      <div style={{ marginBottom:10 }}>
                        <label style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, background:"rgba(201,168,76,0.08)", border:"1px dashed rgba(201,168,76,0.4)", padding:"14px 20px", cursor:"pointer", borderRadius:2, color:"var(--gold)", fontSize:"0.82rem", letterSpacing:"0.1em" }}>
                          📁 Choose Image From Device
                          <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>{
                            const file = e.target.files[0];
                            if (!file) return;
                            if (file.size > 15 * 1024 * 1024) { alert("Image too large. Please choose an image under 15MB."); return; }
                            // Auto-compress using canvas
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement("canvas");
                                const MAX = 1200;
                                let w = img.width, h = img.height;
                                if (w > h && w > MAX) { h = h * MAX / w; w = MAX; }
                                else if (h > MAX) { w = w * MAX / h; h = MAX; }
                                canvas.width = w; canvas.height = h;
                                canvas.getContext("2d").drawImage(img, 0, 0, w, h);
                                const compressed = canvas.toDataURL("image/jpeg", 0.82);
                                const kb = Math.round(compressed.length * 0.75 / 1024);
                                if (kb > 900) {
                                  // compress more if still too big
                                  const compressed2 = canvas.toDataURL("image/jpeg", 0.6);
                                  setForm(f=>({...f, images:[{url: compressed2}]}));
                                } else {
                                  setForm(f=>({...f, images:[{url: compressed}]}));
                                }
                              };
                              img.src = ev.target.result;
                            };
                            reader.readAsDataURL(file);
                          }} />
                        </label>
                      </div>

                      {/* OR URL */}
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }} />
                        <span style={{ fontSize:"0.68rem", color:"var(--white-dim)", letterSpacing:"0.1em" }}>OR PASTE URL</span>
                        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }} />
                      </div>
                      <input value={form.images?.[0]?.url?.startsWith("data:") ? "" : form.images?.[0]?.url||""} 
                        onChange={e=>setForm({...form,images:[{url:e.target.value}]})} 
                        style={InputStyle} placeholder="https://images.unsplash.com/..." 
                        onFocus={e=>e.target.style.borderColor="var(--gold)"} 
                        onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} />
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
                    <tr key={l.id||l._id} style={{ borderBottom:"1px solid rgba(255,255,255,0.05)", background:i%2===0?"transparent":"rgba(255,255,255,0.015)" }}>
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
                          <button onClick={() => handleDelete(l.id || l._id)} style={{ background:"none", border:"1px solid rgba(224,92,92,0.3)", color:"var(--red)", padding:"5px 12px", fontSize:"0.7rem", cursor:"pointer", letterSpacing:"0.08em" }}>Remove</button>
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
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
                <h2 style={{ fontFamily:"var(--serif)", fontSize:"1.6rem", fontWeight:300, color:"var(--white)" }}>Enquiries ({enquiries.length})</h2>
                <GoldBtn small outline onClick={async()=>{
                  try {
                    const enqs = await api.getEnquiries();
                    setEnquiries(enqs);
                    toast("Enquiries refreshed!");
                  } catch { toast("Failed to refresh","error"); }
                }}>↻ Refresh</GoldBtn>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                {["All","New","Read","Replied","Closed"].map(s => (
                  <button key={s} style={{ background:"none", border:"1px solid rgba(255,255,255,0.15)", color:"var(--white-dim)", padding:"6px 14px", fontSize:"0.7rem", cursor:"pointer", letterSpacing:"0.08em" }}>{s}</button>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {enquiries.map(e => (
                <div key={e.id||e._id} style={{ background:"var(--dark2)", border:"1px solid rgba(255,255,255,0.06)", padding:"20px 22px", display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:12, alignItems:"start", className:"enquiry-grid" }}>
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
                    <select value={e.status} onChange={ev=>updateEnquiryStatus(e.id||e._id, ev.target.value)} style={{ ...InputStyle, padding:"5px 10px", fontSize:"0.72rem", width:"auto", appearance:"none", cursor:"pointer" }}>
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
    try {
      await api.submitEnquiry({
        name: form.name,
        email: form.email,
        phone: form.phone,
        interest: form.interest,
        message: form.message,
        propertyId: null,
        propertyTitle: "General Enquiry",
        status: "New"
      });
      setSent(true);
      toast("Enquiry submitted! We'll be in touch shortly.");
    } catch(err) {
      toast("Failed to send. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop:90, background:"var(--dark)", minHeight:"100vh" }}>
      <div style={{ background:"var(--black)", padding:"clamp(32px,5vw,60px) 5% clamp(24px,4vw,50px)", borderBottom:"1px solid rgba(201,168,76,0.1)" }}>
        <div style={{ maxWidth:"100%", margin:"0 auto" }}>
          <p style={{ fontSize:"0.7rem", letterSpacing:"0.24em", color:"var(--gold)", textTransform:"uppercase", marginBottom:12 }}>Get In Touch</p>
          <h1 style={{ fontFamily:"var(--serif)", fontSize:"clamp(2rem,4vw,3rem)", fontWeight:300, color:"var(--white)" }}>Contact Us</h1>
        </div>
      </div>

      <div className="contact-grid" style={{ maxWidth:"100%", margin:"0 auto", padding:"clamp(40px,6vw,72px) 5%", display:"grid", gridTemplateColumns:"1fr 1fr", gap:40, alignItems:"start" }}>
        {/* Info */}
        <div>
          <div style={{ width:36, height:1, background:"var(--gold)", marginBottom:24 }} />
          <h2 style={{ fontFamily:"var(--serif)", fontSize:"clamp(1.8rem,3vw,2.6rem)", fontWeight:300, color:"var(--white)", lineHeight:1.25, marginBottom:20 }}>Begin Your Property Journey</h2>
          <p style={{ color:"var(--white-dim)", lineHeight:1.9, fontSize:"0.92rem", marginBottom:44 }}>Our team of experts is ready to connect you with the finest properties. Reach out and let us curate an exclusive selection tailored to your needs.</p>
          {[{ label:"Office", value:"Karen, Nairobi" },{ label:"Phone", value:"+254 714 164 545" },{ label:"Email", value:"info@cybalcapital.co.ke" }].map(({ label, value }) => (
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
        <div style={{ background:"var(--dark2)", border:"1px solid rgba(201,168,76,0.12)", padding:"clamp(16px,4vw,36px) clamp(16px,4vw,32px)" }}>
          {sent ? (
            <div style={{ textAlign:"center", padding:"40px 0" }}>
              <div style={{ fontSize:"3rem", marginBottom:16 }}>✓</div>
              <div style={{ fontFamily:"var(--serif)", fontSize:"1.6rem", color:"var(--gold)", marginBottom:10 }}>Message Sent!</div>
              <p style={{ color:"var(--white-dim)", marginBottom:24 }}>Thank you for reaching out. We'll respond within 24 hours.</p>
              <GoldBtn outline onClick={() => setSent(false)}>Send Another</GoldBtn>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div className="form-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <Field label="Full Name"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={InputStyle} required onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} /></Field>
                <Field label="Email"><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={InputStyle} required onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} /></Field>
              </div>
              <Field label="Phone"><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={InputStyle} onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} /></Field>
              <Field label="Interest">
                <select value={form.interest} onChange={e=>setForm({...form,interest:e.target.value})} style={{ ...InputStyle, appearance:"none" }}>
                  {["Buying","Selling","Investment Advisory","General Enquiry"].map(o=><option key={o} value={o} style={{background:"#161616"}}>{o}</option>)}
                </select>
              </Field>
              <Field label="Message"><textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} style={{ ...InputStyle, height:120, resize:"vertical", width:"100%" }} required onFocus={e=>e.target.style.borderColor="var(--gold)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.12)"} /></Field>
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
  <div style={{ paddingTop:90, background:"var(--black)", minHeight:"100vh" }}>
    <div style={{ background:"var(--dark)", padding:"60px 8% 50px", borderBottom:"1px solid rgba(201,168,76,0.1)" }}>
      <div style={{ maxWidth:"100%", margin:"0 auto" }}>
        <p style={{ fontSize:"0.7rem", letterSpacing:"0.24em", color:"var(--gold)", textTransform:"uppercase", marginBottom:12 }}>Our Story</p>
        <h1 style={{ fontFamily:"var(--serif)", fontSize:"clamp(2rem,4vw,3rem)", fontWeight:300, color:"var(--white)" }}>About Cybal Capital</h1>
      </div>
    </div>
    <div style={{ maxWidth:"100%", margin:"0 auto", padding:"clamp(40px,6vw,72px) 5%" }}>
      <div className="about-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, alignItems:"center", marginBottom:60 }}>
        <div style={{ position:"relative" }}>
          <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=85" alt="City" style={{ width:"100%", height:"clamp(220px,40vw,500px)", objectFit:"cover" }} />
          <div className="about-gold-box" style={{ position:"absolute", top:-14, left:-14, width:"55%", height:"55%", border:"1px solid var(--gold)", zIndex:-1 }} />
          <div className="about-gold-box" style={{ position:"absolute", bottom:-22, right:-22, background:"var(--gold)", padding:"16px 20px", textAlign:"center" }}>
            <div style={{ fontFamily:"var(--serif)", fontSize:"2rem", fontWeight:600, color:"var(--black)" }}>4+</div>
            <div style={{ fontSize:"0.65rem", letterSpacing:"0.1em", color:"rgba(8,8,8,0.7)", textTransform:"uppercase", marginTop:4 }}>Years<br/>Excellence</div>
          </div>
        </div>
        <div>
          <h2 style={{ fontFamily:"var(--serif)", fontSize:"clamp(1.8rem,3vw,2.6rem)", fontWeight:300, color:"var(--white)", lineHeight:1.25, marginBottom:22 }}>A Premier Luxury Real Estate Marketing Company</h2>
          <p style={{ color:"var(--white-dim)", lineHeight:1.9, fontSize:"0.92rem", marginBottom:18 }}><strong style={{ color:"var(--white)", fontWeight:500 }}>Cybal Capital Limited</strong> is a premier luxury real estate marketing company, offering exclusive access to multi-million-dollar properties. With a commitment to excellence, we provide bespoke real estate solutions tailored to meet the unique needs of our clients.</p>
          <p style={{ color:"var(--white-dim)", lineHeight:1.9, fontSize:"0.92rem", marginBottom:18 }}>Guided by our core values of quality, integrity, and innovation, we passionately strive to deliver exceptional marketing strategies and customer service that highlight the true potential of premium developments.</p>
          <p style={{ color:"var(--white-dim)", lineHeight:1.9, fontSize:"0.92rem", marginBottom:36 }}>With over four years of expertise, Cybal Capital Limited connects discerning clients with luxurious and sustainable properties, making us a trusted name in the competitive real estate market.</p>
          <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
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
// ── SOCIAL MEDIA LINKS — update these when you get official accounts ──────────
const SOCIAL_LINKS = [
  { name:"Facebook",  icon:"f",  url:"https://facebook.com/cybalcapital",  color:"#1877f2" },
  { name:"Instagram", icon:"in", url:"https://instagram.com/cybalcapital", color:"#e1306c" },
  { name:"Twitter",   icon:"𝕏",  url:"https://twitter.com/cybalcapital",  color:"#fff"    },
  { name:"LinkedIn",  icon:"li", url:"https://linkedin.com/company/cybalcapital", color:"#0a66c2" },
  { name:"WhatsApp",  icon:"w",  url:"https://wa.me/254714164545",         color:"#25d366" },
  { name:"TikTok",    icon:"tt", url:"https://tiktok.com/@cybalcapital",   color:"#fff"    },
];

const SocialIcon = ({ s }) => {
  const [hov, setHov] = useState(false);
  const icons = {
    Facebook: <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
    Instagram: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>,
    Twitter: <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    LinkedIn: <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>,
    WhatsApp: <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>,
    TikTok: <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>,
  };
  return (
    <a href={s.url} target="_blank" rel="noopener noreferrer"
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ width:34, height:34, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
        background: hov ? s.color : "rgba(255,255,255,0.07)",
        color: hov ? "#fff" : "rgba(255,255,255,0.5)",
        border:`1px solid ${hov ? s.color : "rgba(255,255,255,0.1)"}`,
        transition:"all 0.25s", textDecoration:"none", flexShrink:0 }}>
      {icons[s.name]}
    </a>
  );
};

const Footer = ({ setPage }) => {
  const go = (p) => { setPage(p); window.scrollTo(0,0); };
  return (
    <footer style={{ background:"#050505", borderTop:"1px solid rgba(201,168,76,0.12)", padding:"56px 5% 32px" }}>
      <div style={{ maxWidth:"100%", margin:"0 auto" }}>
        <div className="footer-grid" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:24, marginBottom:32 }}>
          {/* Brand column */}
          <div>
            <div style={{ fontFamily:"var(--serif)", fontSize:"1.2rem", fontWeight:600, color:"var(--white)", letterSpacing:"0.06em", marginBottom:3 }}>CYBAL CAPITAL</div>
            <div style={{ fontSize:"0.58rem", letterSpacing:"0.22em", color:"var(--gold)", marginBottom:16 }}>LIMITED</div>
            <p style={{ fontSize:"0.82rem", color:"var(--white-dim)", lineHeight:1.8, maxWidth:260, fontWeight:300, marginBottom:20 }}>Premier luxury real estate marketing, connecting discerning clients with the finest properties since 2020.</p>
            {/* Social icons */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {SOCIAL_LINKS.map(s => <SocialIcon key={s.name} s={s} />)}
            </div>
          </div>

          {/* Other columns */}
          {[["Company",[["home","Home"],["about","About"],["contact","Contact"]]],["Properties",[["properties","All Properties"],["properties","Featured"],["properties","For Sale"]]],["Contact",[null,"Karen, Nairobi","+254 714 164 545","info@cybalcapital.co.ke"]]].map(([col, items]) => (
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

        <div className="footer-bottom" style={{ borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:"0.73rem", color:"rgba(255,255,255,0.22)" }}>© 2026 Cybal Capital Limited. All rights reserved.</div>
          <div style={{ display:"flex", gap:20, alignItems:"center" }}>
            {["Privacy Policy","Terms of Service"].map(t=>(
              <span key={t} style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.22)", cursor:"pointer" }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Hidden admin link */}
        <div style={{ marginTop:12, textAlign:"left" }}>
          <span onClick={() => go("admin-login")}
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
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      loginUser({ email: form.email, name: "Admin", role: "admin" });
      toast("Welcome, Admin!");
      setPage("admin");
      window.scrollTo(0,0);
    } catch (err) {
      toast("Invalid credentials", "error");
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

// ── BOTTOM NAV (Mobile Only) ─────────────────────────────────────────────────
const BottomNav = ({ page, setPage }) => {
  const { user, logoutUser } = useAuth();
  const toast = useToast();

  const go = (p) => { setPage(p); window.scrollTo(0,0); };

  const items = [
    { page:"home",       icon:"🏠", label:"Home" },
    { page:"properties", icon:"🏢", label:"Properties" },
    { page:"about",      icon:"⭐", label:"About" },
    { page:"contact",    icon:"📞", label:"Contact" },
  ];

  return (
    <div className="bottom-nav">
      {items.map(item => (
        <div key={item.page} className="bottom-nav-item" onClick={() => go(item.page)}
          style={{ color: page === item.page ? "var(--gold)" : "rgba(255,255,255,0.5)" }}>
          <span className="icon">{item.icon}</span>
          <span className="label">{item.label}</span>
        </div>
      ))}
      {user?.role === "admin" ? (
        <div className="bottom-nav-item" onClick={() => go("admin")}
          style={{ color:"var(--gold)" }}>
          <span className="icon">⚙️</span>
          <span className="label">Admin</span>
        </div>
      ) : null}
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