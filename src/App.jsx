import { useState, useEffect, useCallback, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { loadData, saveData } from "./supabase";

const WIFE = "Emilie";
const YOU = "Tomer";
const MBX = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
mapboxgl.accessToken = MBX;
const BG_HOME = "/landing-bg.jpg";
const BG_INNER = "/inner-bg.jpg";
const P = { coral:"#D4615A",magenta:"#B03A78",pink:"#E07BA5",sky:"#5EAED0",deep:"#2D2A26",text:"#3D3832",tl:"#5E574F",tm:"#7A7168",bdr:"#C8BFB4",bl:"#E0D8CE",stone:"#F0EBE5",cream:"#FFFBF5" };
const grad = "linear-gradient(135deg," + P.coral + "," + P.magenta + ")";
const CATS = [
  { id:"survival", emoji:"\u{1F9ED}", label:"Paris Survival Tips", desc:"Insider hacks: bureaucracy, transport, apps, coworking-friendly spots, English-friendly events, things you wish you knew on day one...", color:"#AE916B", tp:"e.g. Get a Navigo card day one...", dp:"The hack \u2014 be specific!" },
  { id:"homing", emoji:"\u{1F3E1}", label:"Home & Settling In", desc:"We're moving into a new home and getting everything from scratch! Best home tips or must-have items? Cleaning gadgets, kitchen essentials, which sheets to get? Kitchen life hacks, smart home tips, Marie Kondo wisdom? What made your home feel most 'homey' after you moved \u2014 or the single best thing you did for your place?", color:"#7D8E71", tp:"e.g. A good knife set changes everything...", dp:"Your best nesting advice \u2014 what to buy, what to skip, what made it home." },
  { id:"food", emoji:"\u{1F957}", label:"Food", desc:"Restaurants, caf\u00e9s, markets \u2014 near R\u00e9publique (3rd/11th). Veggie \u{1F331} & casual everyday spots are the best!", color:"#5B8C7A", tp:"e.g. Wild & The Moon...", dp:"Why would Emilie love it?" },
  { id:"culture", emoji:"\u{1F3A8}", label:"Culture, Art & Music", desc:"Museums, galleries, jazz, live music, theatre, cinema, bookshops", color:"#8B6BAE", tp:"e.g. Le Caveau de la Huchette...", dp:"What's the vibe?" },
  { id:"recharge", emoji:"\u{1F33F}", label:"Recreation & Recharge", desc:"Paris life can get busy \u2014 how would you rest & recharge? Parks, walks, running, yoga, wellness, or just tips for how to wave off the hectic vibes?", color:"#5EAED0", tp:"e.g. Parc des Buttes-Chaumont...", dp:"Why is this your go-to for recharging?" },
  { id:"community", emoji:"\u{1F3AA}", label:"Events, People & Community", desc:"What are the cool Paris events and scenes we must know? Any networks, communities, or groups to connect us to? Where would we find our new people?", color:"#C4956A", tp:"e.g. InterNations Paris...", dp:"Why should we check it out?" },
  { id:"gems", emoji:"\u{1F48E}", label:"Hidden Gems", desc:"Secret spots, secret hacks, free coworking space tricks, underground finds, insider-only places and meetups \u2014 things only locals know!", color:"#B03A78", tp:"e.g. That caf\u00e9 with free wifi nobody knows...", dp:"What makes it a hidden gem?" },
  { id:"getaway", emoji:"\u{1F333}", label:"Weekend Getaways", desc:"Day trips by easy train to the best nature, cultural spots with natural beauty, countryside, coast \u2014 all the better if you come with!", color:"#7D8E9E", tp:"e.g. Fontainebleau forest, 40 min by train...", dp:"How to get there & what to do?" },
];
const HOODS = [
  { id:"republique", label:"R\u00e9publique (3rd/11th) \u2B50", lat:48.8639, lng:2.3619 },
  { id:"montmartre", label:"Montmartre (18th)", lat:48.8867, lng:2.3431 },
  { id:"canal", label:"Canal Saint-Martin (10th)", lat:48.8716, lng:2.3636 },
  { id:"marais", label:"Le Marais (3rd/4th)", lat:48.8566, lng:2.3622 },
  { id:"bastille", label:"Bastille / Oberkampf (11th)", lat:48.8533, lng:2.3695 },
  { id:"belleville", label:"Belleville (20th)", lat:48.8716, lng:2.3848 },
  { id:"stgermain", label:"Saint-Germain (6th)", lat:48.8534, lng:2.334 },
  { id:"latin", label:"Latin Quarter (5th)", lat:48.8492, lng:2.347 },
  { id:"outside", label:"Outside Paris / Day Trip", lat:null, lng:null },
  { id:"other", label:"Other", lat:null, lng:null },
  { id:"notaplace", label:"Not a specific place", lat:null, lng:null },
];
const TAGS = ["casual","worth a splurge","date night","solo","winter-friendly","summer","meet people","near home (3rd/11th)","hidden","free entry","reservation needed"];
const isNL = (id) => id === "survival" || id === "homing";
function nc(n) { let h = 0; for (let i = 0; i < (n || "").length; i++) h = n.charCodeAt(i) + ((h << 5) - h); return [P.coral, "#8B6BAE", "#5B8C7A", "#C4956A", "#7D8E71", P.magenta][Math.abs(h) % 6]; }

function Av({ name, size = 40, src }) {
  if (src) return <img src={src} alt="" style={{ width: size, height: size, minWidth: size, objectFit: "cover" }} className="rounded-full" />;
  return (<div style={{ width: size, height: size, minWidth: size, backgroundColor: nc(name) }} className="rounded-full flex items-center justify-center text-white font-semibold"><span style={{ fontSize: size * 0.42 }}>{(name || "?")[0].toUpperCase()}</span></div>);
}
function Tg({ text, onClick, active, removable, onRemove }) {
  return (<span onClick={onClick} style={{ backgroundColor: active ? P.coral + "18" : "rgba(255,255,255,0.8)", color: active ? P.coral : "#5E574F", border: active ? "1px solid " + P.coral + "50" : "1px solid rgba(0,0,0,0.08)", cursor: onClick ? "pointer" : "default" }} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium">{text}{removable && <button onClick={e => { e.stopPropagation(); onRemove(); }} className="opacity-40 hover:opacity-100 ml-0.5">{"\u00D7"}</button>}</span>);
}
function IBg() { return (<><div style={{ position: "fixed", inset: 0, background: "linear-gradient(135deg, #d0e8f2 0%, #e8d5ef 25%, #c9dff5 50%, #f0d6e8 75%, #d4ecf8 100%)", zIndex: -2 }} /><div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 20% 80%, rgba(94,174,208,0.25) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(176,58,120,0.15) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(224,123,165,0.1) 0%, transparent 60%)", zIndex: -1 }} /></>); }
function compress(file, cb) { if (file.size > 500000) { const cv = document.createElement("canvas"); const ctx = cv.getContext("2d"); const img = new Image(); img.onload = () => { const s = 200 / Math.max(img.width, img.height); cv.width = img.width * s; cv.height = img.height * s; ctx.drawImage(img, 0, 0, cv.width, cv.height); cb(cv.toDataURL("image/jpeg", 0.5)); }; img.src = URL.createObjectURL(file); } else { const r = new FileReader(); r.onload = ev => cb(ev.target.result); r.readAsDataURL(file); } }


function PlaceSearch({ onSelect }) {
  const [q, setQ] = useState("");
  const [res, setRes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const timer = useRef(null);
  const sessionRef = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()) + Math.random().toString(36).slice(2)
  );
  const resetSession = () => {
    sessionRef.current =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now()) + Math.random().toString(36).slice(2);
  };
  const doSearch = (value) => {
    setQ(value);
    setErr("");
    clearTimeout(timer.current);
    if (value.trim().length < 2) {
      setRes([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const suggestUrl =
          "https://api.mapbox.com/search/searchbox/v1/suggest" +
          "?q=" + encodeURIComponent(value) +
          "&access_token=" + encodeURIComponent(MBX) +
          "&session_token=" + encodeURIComponent(sessionRef.current) +
          "&language=en,fr" +
          "&country=fr" +
          "&bbox=2.2241,48.8156,2.4699,48.9022" +
          "&proximity=2.3522,48.8566" +
          "&limit=8";
        const suggestResp = await fetch(suggestUrl);
        if (!suggestResp.ok) {
          throw new Error("Mapbox suggest failed: " + suggestResp.status);
        }
        const suggestData = await suggestResp.json();
        const suggestions = suggestData.suggestions || [];
        setRes(
          suggestions.map((s, i) => ({
            id: s.mapbox_id || s.id || String(i),
            mapbox_id: s.mapbox_id,
            name: s.name || s.name_preferred || "",
            address:
              s.full_address ||
              [s.address, s.place_formatted].filter(Boolean).join(", ") ||
              s.place_formatted ||
              "",
          }))
        );
      } catch (e) {
        console.error("Search suggest error:", e);
        setErr("Place search unavailable \u2014 try picking a neighborhood below");
        setRes([]);
      } finally {
        setLoading(false);
      }
    }, 250);
  };
  const chooseSuggestion = async (item) => {
    setRes([]);
    setQ(item.name);
    if (item.mapbox_id) {
      try {
        const retrieveUrl =
          "https://api.mapbox.com/search/searchbox/v1/retrieve/" +
          encodeURIComponent(item.mapbox_id) +
          "?access_token=" + encodeURIComponent(MBX) +
          "&session_token=" + encodeURIComponent(sessionRef.current);
        const resp = await fetch(retrieveUrl);
        if (!resp.ok) throw new Error("retrieve:" + resp.status);
        const data = await resp.json();
        const feat = data.features && data.features[0];
        if (feat && feat.geometry && feat.geometry.coordinates) {
          const [lng, lat] = feat.geometry.coordinates;
          const addr =
            (feat.properties &&
              (feat.properties.full_address || feat.properties.place_formatted)) ||
            item.address;
          onSelect({ name: item.name, full: addr, lat, lng });
          resetSession();
          return;
        }
      } catch (e) {
        console.warn("Retrieve failed, using suggestion data:", e);
      }
    }
    onSelect({ name: item.name, full: item.address, lat: null, lng: null });
  };
  return (
    <div className="mb-3" style={{ position: "relative", zIndex: 20 }}>
      <input
        value={q}
        onChange={e => doSearch(e.target.value)}
        placeholder={"Search a restaurant, caf\u00e9, park, hotel..."}
        style={{ border: "1.5px solid " + P.bdr }}
        className="w-full px-4 py-3 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-100"
      />
      {loading && <p className="text-xs mt-1" style={{ color: P.tm }}>Searching places...</p>}
      {err && <p className="text-xs mt-1" style={{ color: P.coral }}>{err}</p>}
      {res.length > 0 && (
        <div style={{ border: "1px solid " + P.bdr, background: "white", position: "absolute", left: 0, right: 0, zIndex: 30 }} className="rounded-xl mt-1 overflow-hidden shadow-lg">
          {res.map((r, i) => (
            <button
              key={r.id}
              onClick={() => chooseSuggestion(r)}
              className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50"
              style={{ borderBottom: i < res.length - 1 ? "1px solid " + P.bl : "none", color: P.text }}
            >
              <span className="font-medium">{r.name}</span>
              {r.address && <><br /><span style={{ color: P.tm }}>{r.address}</span></>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MapboxMap({ recs, people, selected, onSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [2.362, 48.864],
      zoom: 12.5,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    const homeEl = document.createElement('div');
    homeEl.textContent = '🏠';
    homeEl.style.cssText = 'font-size:32px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));cursor:pointer';
    new mapboxgl.Marker({ element: homeEl })
      .setLngLat([2.3619, 48.8639])
      .setPopup(new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML('<b>Home! 🏠</b><br/>Rue de Beauce, 3rd arr.'))
      .addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    recs.forEach(r => {
      if (!r.lat || !r.lng) return;
      const cat = CATS.find(c => c.id === r.cat);
      const el = document.createElement('div');
      el.textContent = cat ? cat.emoji : '📍';
      el.style.cssText = 'font-size:24px;cursor:pointer;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.5))';
      const person = people[r.by] || {};
      const photoHTML = r.photo ? '<img src="' + r.photo + '" style="width:100%;max-height:100px;object-fit:cover;border-radius:6px;margin-bottom:4px"/>' : '';
      const avHTML = person.photo ? '<img src="' + person.photo + '" style="width:22px;height:22px;border-radius:50%;object-fit:cover;display:inline-block;vertical-align:middle;margin-right:4px"/>' : '';
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, maxWidth: '220px' })
        .setHTML(photoHTML + '<b style="font-size:12px">' + r.title + '</b><br/>' + avHTML + '<span style="font-size:11px;color:#7A7168">' + r.by + (cat ? ' · ' + cat.emoji : '') + '</span>');
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([r.lng, r.lat])
        .setPopup(popup)
        .addTo(mapRef.current);
      el.addEventListener('click', () => onSelect(r.id));
      marker._recId = r.id;
      markersRef.current.push(marker);
    });
  }, [recs, people, onSelect]);

  useEffect(() => {
    if (!mapRef.current || !selected) return;
    const r = recs.find(x => x.id === selected);
    if (r && r.lat && r.lng) {
      mapRef.current.flyTo({ center: [r.lng, r.lat], zoom: 15, duration: 800 });
      const mk = markersRef.current.find(m => m._recId === selected);
      if (mk) mk.togglePopup();
    }
  }, [selected, recs]);

  return <div ref={containerRef} style={{ width: "100%", height: 420, borderRadius: 16, overflow: "hidden" }} />;
}

function FeaturedSwipe({ items, renderItem, keyFn }) {
  const scrollRef = useRef(null);
  const [ai, setAi] = useState(0);
  useEffect(() => { const el = scrollRef.current; if (!el) return; const f = () => { setAi(Math.round(el.scrollLeft / (el.offsetWidth * 0.72))); }; el.addEventListener("scroll", f, { passive: true }); return () => el.removeEventListener("scroll", f); }, []);
  if (!items.length) return null;
  return (
    <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 snx" style={{ marginLeft: -20, marginRight: -20, paddingLeft: 20, paddingRight: 20, scrollPaddingLeft: 20 }}>
      {items.map((item, i) => {
        const featured = i === ai;
        return (
          <div key={keyFn(item)} style={{ minWidth: featured ? "85%" : "65%", maxWidth: featured ? "85%" : "65%", transition: "all 0.3s ease", opacity: featured ? 1 : 0.55, transform: featured ? "scale(1)" : "scale(0.92)", flexShrink: 0 }}>
            {renderItem(item, featured)}
          </div>
        );
      })}
    </div>
  );
}

function Nav({ title, onBack }) { return (<div style={{ background: "rgba(220,230,240,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.4)" }} className="sticky top-0 z-30 px-4 py-3 flex items-center"><button onClick={onBack} style={{ color: P.coral }} className="text-sm font-medium">{"\u2190"} Back</button><h2 className="sf text-lg font-semibold flex-1 text-center pr-10" style={{ color: P.deep }}>{title}</h2></div>); }

export default function App() {
  const [view, setView] = useState("landing");
  const [data, setData] = useState({ people: {}, recs: [] });
  const [saving, setSaving] = useState(false);
  const [cName, setCName] = useState("");
  const [cNote, setCNote] = useState("");
  const [cPhoto, setCPhoto] = useState(null);
  const [nameOk, setNameOk] = useState(false);
  const [items, setItems] = useState([]);
  const [ci, setCi] = useState(null);
  const [done, setDone] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [fCat, setFCat] = useState(null);
  const [fTag, setFTag] = useState(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [selMap, setSelMap] = useState(null);
  const [aiQ, setAiQ] = useState("");
  const [aiR, setAiR] = useState("");
  const [aiL, setAiL] = useState(false);
  const formRef = useRef(null);
  const ppRef = useRef(null);
  const rpRef = useRef(null);

  const load = useCallback(async () => { try { const d = await loadData(); setData(d); } catch (e) { console.error("Load error:", e); } }, []);
  useEffect(() => { load(); }, [load]);
  const save = async (name, note, photo, list) => { setSaving(true); try { await saveData(name, note, photo, list); await load(); } catch (e) { console.error("Save error:", e); } setSaving(false); };
  const rc = data.recs.length;
  const pc = Object.keys(data.people).length;
  const allTags = [...new Set(data.recs.flatMap(r => r.tags || []))].sort();
  const fresh = () => ({ cat: "", title: "", desc: "", hood: "", loc: "", lat: null, lng: null, tags: [], ti: "", photo: null });
  const goC = () => { setView("contribute"); setNameOk(false); setItems([]); setCi(null); setDone(false); setCName(""); setCNote(""); setCPhoto(null); };
  const doAi = async () => { if (!aiQ.trim() || !data.recs.length) return; setAiL(true); setAiR(""); try { const resp = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 600, messages: [{ role: "user", content: "You are a helpful Paris guide. Based on these friend recommendations, answer concisely and warmly. Refer to recs by name and who suggested them.\n\nRecs:\n" + data.recs.map(r => '- "' + r.title + '" by ' + r.by + " [" + (CATS.find(c => c.id === r.cat) || {}).label + "]: " + r.desc).join("\n") + "\n\nQuestion: " + aiQ }] }) }); const d = await resp.json(); setAiR((d.content && d.content[0] && d.content[0].text) || "No answer found."); } catch (e) { setAiR("Couldn't search right now."); } setAiL(false); };
  const fil = data.recs.filter(r => { if (fCat && r.cat !== fCat) return false; if (fTag && !(r.tags || []).includes(fTag)) return false; if (search) { const s = search.toLowerCase(); return [r.title, r.desc, r.by, ...(r.tags || [])].some(x => (x || "").toLowerCase().includes(s)); } return true; });
  const locR = fil.filter(r => !isNL(r.cat));
  const tipR = fil.filter(r => isNL(r.cat));

  const RecCard = ({ rec, big, highlight }) => {
    const cat = CATS.find(c => c.id === rec.cat);
    const person = data.people[rec.by];
    const isOpen = expanded === rec.id;
    return (
      <div onClick={() => setExpanded(isOpen ? null : rec.id)} style={{ background: highlight ? "rgba(212,97,90,0.06)" : "rgba(255,255,255,0.92)", border: highlight ? "2px solid " + P.coral + "50" : "1px solid " + P.bl, cursor: "pointer", minWidth: big ? undefined : 240, maxWidth: big ? undefined : 280, flexShrink: 0 }} className={"rounded-2xl " + (big ? "p-5" : "p-4") + " shadow-sm hover:shadow-md transition-all"}>
        {rec.photo && <img src={rec.photo} alt="" className="w-full rounded-xl mb-3 object-cover" style={{ maxHeight: big ? 180 : 100 }} />}
        <div className="flex items-start gap-2 mb-2">
          <Av name={rec.by} size={big ? 32 : 28} src={person ? person.photo : null} />
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ color: P.deep }} className="font-semibold text-xs">{rec.by}</span>
            {cat && <span style={{ backgroundColor: cat.color + "18", color: cat.color }} className="px-2 py-0.5 rounded-full text-xs font-medium">{cat.emoji} {cat.label}</span>}
          </div>
        </div>
        <p className="sf font-semibold mb-1" style={{ color: P.deep, fontSize: big ? 16 : 14 }}>{rec.title}</p>
        {rec.loc && <p style={{ color: P.tm }} className="text-xs mb-2">{"\u{1F4CD}"} {rec.loc}</p>}
        <p style={{ color: P.text, lineHeight: 1.7 }} className={"text-sm " + (isOpen || big ? "" : "lc3")}>{rec.desc}</p>
        {rec.tags && rec.tags.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{rec.tags.map(t => <Tg key={t} text={t} />)}</div>}
      </div>
    );
  };

  // === LANDING ===
  if (view === "landing") return (
    <div className="min-h-screen flex flex-col" style={{ position: "relative", overflow: "hidden" }}>
      
      <div style={{ position: "absolute", inset: 0, backgroundImage: "url(" + BG_HOME + ")", backgroundSize: "cover", backgroundPosition: "center 30%", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(45,42,38,0.08) 0%,rgba(45,42,38,0.35) 35%,rgba(45,42,38,0.82) 65%,rgba(45,42,38,0.96) 100%)", zIndex: 1 }} />
      <div className="flex-1 flex flex-col items-center justify-end px-6 pb-10 pt-40 text-center" style={{ position: "relative", zIndex: 2 }}>
        <h1 className="sf font-bold mb-3" style={{ color: "white", fontSize: "clamp(2.2rem,7vw,3.5rem)", lineHeight: 1.08, textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
          {WIFE}'s<br /><span style={{ fontStyle: "italic", fontWeight: 400, color: P.pink }}>Paris Guide</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.8)", maxWidth: 380 }} className="text-base mb-2">A personal guide to Paris, made with love by everyone who knows {WIFE} best.</p>
        {(rc > 0 || pc > 0) && <div style={{ color: P.pink }} className="flex items-center gap-3 mt-3 mb-2 text-sm font-medium">{pc > 0 && <span>{pc} friend{pc !== 1 ? "s" : ""}</span>}{rc > 0 && <><span>{"\u00B7"}</span><span>{rc} rec{rc !== 1 ? "s" : ""}</span></>}</div>}
        <div className="flex flex-col gap-3 w-full mt-5" style={{ maxWidth: 320 }}>
          <button onClick={goC} style={{ background: grad }} className="w-full text-white font-semibold py-3.5 rounded-xl text-base shadow-lg hover:opacity-90">Add yours {"\u270D\uFE0F"}</button>
          <button onClick={() => setView("explore")} style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1.5px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }} className="w-full font-medium py-3.5 rounded-xl text-base">Explore the guide {"\u{1F5FA}\uFE0F"}</button>
        </div>
      </div>
      <p style={{ color: "rgba(255,255,255,0.35)", position: "relative", zIndex: 2 }} className="text-center text-xs pb-5">made with love by {YOU} & friends {"\u{1F92B}"}</p>
    </div>
  );

  // === NAME STEP ===
  if (view === "contribute" && !nameOk) {
    const ok = cName.trim() && cNote.trim();
    return (
      <div className="min-h-screen" style={{ position: "relative" }}><IBg />
        <Nav title="Add yours" onBack={() => setView("landing")} />
        <div className="px-5 py-6 max-w-lg mx-auto">
          <h3 className="sf text-xl font-bold mb-1" style={{ color: P.deep }}>First, about you</h3>
          <p style={{ color: P.tm }} className="text-sm mb-6">So {WIFE} knows who's talking {"\u2764\uFE0F"}</p>
          <label className="block text-sm font-medium mb-1.5" style={{ color: P.text }}>Your first name *</label>
          <input value={cName} onChange={e => setCName(e.target.value)} placeholder="Your first name" style={{ border: "1.5px solid " + P.bdr }} className="w-full px-4 py-3 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-pink-100 mb-5" />
          <label className="block text-sm font-medium mb-1.5" style={{ color: P.text }}>A photo of you <span style={{ color: P.tm, fontWeight: 400 }}>(ideally in Paris or at a place you recommend! {"\u{1F4F8}"})</span></label>
          <div className="flex items-center gap-3 mb-6">
            {cPhoto ? (<div className="relative"><img src={cPhoto} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" /><button onClick={() => setCPhoto(null)} style={{ background: P.coral }} className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center">{"\u00D7"}</button></div>
            ) : (<button onClick={() => ppRef.current && ppRef.current.click()} style={{ border: "2px dashed " + P.bdr, color: P.tm }} className="w-14 h-14 rounded-full flex items-center justify-center text-xl">{"\u{1F4F7}"}</button>)}
            <div><button onClick={() => ppRef.current && ppRef.current.click()} style={{ color: P.coral }} className="text-sm font-medium">{cPhoto ? "Change photo \u2713" : "Upload a photo"}</button><p style={{ color: cPhoto ? "#5B8C7A" : P.tm }} className="text-xs">{cPhoto ? "Photo uploaded! \u2713" : "It'll appear next to your entries!"}</p></div>
            <input ref={ppRef} type="file" accept="image/*" onChange={e => { const f = e.target.files && e.target.files[0]; if (f) compress(f, setCPhoto); }} className="hidden" />
          </div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: P.text }}>A note for {WIFE} *</label>
          <textarea value={cNote} onChange={e => setCNote(e.target.value)} placeholder={"Happy birthday " + WIFE + "! So excited for your Paris chapter..."} rows={3} style={{ border: "1.5px solid " + P.bdr, resize: "vertical" }} className="w-full px-4 py-3 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-pink-100 mb-8" />
          <button onClick={() => { setNameOk(true); setCi(fresh()); }} disabled={!ok} style={{ background: ok ? grad : "#C5BDAF" }} className="w-full text-white font-semibold py-3.5 rounded-xl text-base shadow-lg">Next {"\u2014"} add recommendations {"\u2192"}</button>
        </div>
      </div>
    );
  }

  // === DONE ===
  if (view === "contribute" && done) return (
    <div className="min-h-screen" style={{ position: "relative" }}><IBg />
      <Nav title="" onBack={() => setView("landing")} />
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="text-5xl mb-5">{"\u{1F950}"}</div>
        <h2 className="sf text-2xl font-bold mb-2" style={{ color: P.deep }}>Merci, {cName}!</h2>
        <p style={{ color: P.tl, maxWidth: 340 }} className="mb-6">{items.length > 0 ? items.length + " rec" + (items.length !== 1 ? "s" : "") + " added. " : ""}{WIFE} will love this.</p>
        <button onClick={() => { setDone(false); setCi(fresh()); }} style={{ background: P.coral }} className="w-full max-w-xs text-white font-semibold py-3 rounded-xl text-sm shadow mb-3">Add more {"\u270D\uFE0F"}</button>
        <button onClick={() => setView("explore")} style={{ color: P.coral }} className="font-medium py-3 text-sm">See all contributions {"\u2192"}</button>
      </div>
    </div>
  );

  // === FORM ===
  if (view === "contribute") {
    const cur = ci || fresh();
    const up = (k, v) => setCi(p => ({ ...(p || fresh()), [k]: v }));
    const addTag = t => { const v = (t || cur.ti || "").trim(); if (v && !(cur.tags || []).includes(v)) up("tags", [...(cur.tags || []), v]); up("ti", ""); };
    const ok = cur.cat && cur.title.trim() && cur.desc.trim();
    const catObj = CATS.find(c => c.id === cur.cat);
    const saveMore = () => { if (!ok) return; const cp = { ...cur }; delete cp.ti; setItems(p => [...p, cp]); setCi(fresh()); setShowDesc(false); setTimeout(() => formRef.current && formRef.current.scrollIntoView({ behavior: "smooth" }), 150); };
    const submitFinish = async () => { const a = [...items]; if (ok) { const cp = { ...cur }; delete cp.ti; a.push(cp); } setItems(a); await save(cName.trim(), cNote.trim(), cPhoto, a); setDone(true); };
    return (
      <div className="min-h-screen pb-8" style={{ position: "relative" }}><IBg />
        <Nav title="Add recommendations" onBack={() => setView("landing")} />
        <div className="px-5 py-6 max-w-lg mx-auto">
          {items.length > 0 && <div className="mb-6 pb-5" style={{ borderBottom: "1px solid " + P.bl }}>
            <p style={{ color: "#5B8C7A" }} className="text-xs font-semibold mb-2 uppercase tracking-wider">{"\u2713"} Saved ({items.length})</p>
            <div className="flex flex-wrap gap-2">{items.map((it, i) => { const cat = CATS.find(c => c.id === it.cat); return (<span key={i} style={{ background: (cat ? cat.color : "#999") + "10", color: cat ? cat.color : "#999", border: "1px solid " + (cat ? cat.color : "#999") + "20" }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium">{cat ? cat.emoji : ""} {it.title}<button onClick={() => setItems(p => p.filter((_, j) => j !== i))} className="ml-0.5 opacity-40 hover:opacity-100">{"\u00D7"}</button></span>); })}</div>
          </div>}
          <div ref={formRef}>
            <h3 className="sf text-xl font-bold mb-1" style={{ color: P.deep }}>{items.length === 0 ? "Add a recommendation" : "Add another"}</h3>
            <p style={{ color: P.tm }} className="text-sm mb-5">Something {WIFE} would love for her new life in Paris.</p>
            <label className="block text-sm font-medium mb-2" style={{ color: P.text }}>What kind? *</label>
            <div className="grid grid-cols-2 gap-2 mb-2">{CATS.map(cat => (
              <button key={cat.id} onClick={() => { up("cat", cat.id); setShowDesc(true); }} style={{ background: cur.cat === cat.id ? cat.color + "10" : "rgba(255,255,255,0.8)", border: "1.5px solid " + (cur.cat === cat.id ? cat.color + "50" : P.bdr), color: cur.cat === cat.id ? cat.color : P.text, textAlign: "left" }} className="flex items-center gap-2 px-3 py-2.5 rounded-xl">
                <span className="text-lg">{cat.emoji}</span><span className="font-medium text-xs">{cat.label}</span>
              </button>))}</div>
            {catObj && showDesc && <div style={{ background: catObj.color + "08", border: "1px solid " + catObj.color + "20", color: catObj.color }} className="rounded-xl px-4 py-3 mb-5 text-xs leading-relaxed">{catObj.emoji} <b>{catObj.label}:</b> {catObj.desc}</div>}
            {cur.cat && <>
              <label className="block text-sm font-medium mb-1.5" style={{ color: P.text }}>Name *</label>
              <input value={cur.title} onChange={e => up("title", e.target.value)} placeholder={catObj ? catObj.tp : ""} style={{ border: "1.5px solid " + P.bdr }} className="w-full px-4 py-3 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-pink-100 mb-4" />
              <label className="block text-sm font-medium mb-1.5" style={{ color: P.text }}>Description *</label>
              <textarea value={cur.desc} onChange={e => up("desc", e.target.value)} placeholder={catObj ? catObj.dp : ""} rows={3} style={{ border: "1.5px solid " + P.bdr, resize: "vertical" }} className="w-full px-4 py-3 rounded-xl text-base bg-white focus:outline-none focus:ring-2 focus:ring-pink-100 mb-4" />
              <label className="block text-sm mb-1.5" style={{ color: P.tm }}>Optional: photo of this place or you there {"\u{1F4F8}"}</label>
              <div className="flex items-center gap-3 mb-4">
                {cur.photo ? (<div className="relative"><img src={cur.photo} alt="" className="w-16 h-16 rounded-xl object-cover border shadow" /><button onClick={() => up("photo", null)} style={{ background: P.coral }} className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center">{"\u00D7"}</button></div>
                ) : (<button onClick={() => rpRef.current && rpRef.current.click()} style={{ border: "2px dashed " + P.bdr, color: P.tm }} className="w-16 h-16 rounded-xl flex items-center justify-center text-xl">{"\u{1F3DE}\uFE0F"}</button>)}
                <div><button onClick={() => rpRef.current && rpRef.current.click()} style={{ color: P.coral }} className="text-sm font-medium">{cur.photo ? "Change photo \u2713" : "Add photo"}</button>{cur.photo && <p style={{ color: "#5B8C7A" }} className="text-xs">Photo added! {"\u2713"}</p>}</div>
                <input ref={rpRef} type="file" accept="image/*" onChange={e => { const f = e.target.files && e.target.files[0]; if (f) compress(f, v => up("photo", v)); }} className="hidden" />
              </div>
              {!isNL(cur.cat) && <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5" style={{ color: P.text }}>Location</label>
                <PlaceSearch onSelect={r => { up("loc", r.name + (r.full ? " \u2014 " + r.full : "")); up("lat", r.lat); up("lng", r.lng); }} />
                <select value={cur.hood} onChange={e => { up("hood", e.target.value); const h = HOODS.find(n => n.id === e.target.value); if (h && h.lat) { up("lat", h.lat); up("lng", h.lng); } }} style={{ border: "1.5px solid " + P.bdr, color: cur.hood ? P.deep : P.tm }} className="w-full px-4 py-3 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-100 appearance-none mb-1">
                  <option value="">Or pick neighborhood...</option>{HOODS.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                </select>
                {cur.loc && <p className="text-xs mt-1" style={{ color: P.tm }}>{"\u{1F4CD}"} {cur.loc} <button onClick={() => { up("loc", ""); up("lat", null); up("lng", null); }} style={{ color: P.coral }}>{"\u00D7"}</button></p>}
              </div>}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1" style={{ color: P.text }}>Tags <span style={{ color: P.tm, fontWeight: 400 }}>(optional)</span></label>
                <div className="flex flex-wrap gap-1.5 mb-3 mt-2">{TAGS.filter(t => !(cur.tags || []).includes(t)).map(t => <button key={t} onClick={() => addTag(t)} style={{ background: "rgba(255,255,255,0.85)", color: P.tl, border: "1px solid " + P.bdr }} className="px-2.5 py-1 rounded-full text-xs font-medium hover:bg-pink-50">+ {t}</button>)}</div>
                <div className="flex gap-2 mb-2"><input value={cur.ti || ""} onChange={e => up("ti", e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder="Or type your own + enter" style={{ border: "1.5px solid " + P.bdr }} className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-100" /><button onClick={() => addTag()} style={{ background: "rgba(255,255,255,0.85)", color: P.text, border: "1px solid " + P.bdr }} className="px-4 py-2.5 rounded-xl text-sm font-semibold">+</button></div>
                {(cur.tags || []).length > 0 && <div className="flex flex-wrap gap-1.5">{cur.tags.map(t => <Tg key={t} text={t} removable onRemove={() => up("tags", cur.tags.filter(x => x !== t))} />)}</div>}
              </div>
              <button onClick={saveMore} disabled={!ok} style={{ background: ok ? grad : "#C5BDAF" }} className="w-full text-white font-semibold py-3.5 rounded-xl text-base shadow-lg mb-3">Submit & add more {"\u270D\uFE0F"}</button>
              <button onClick={submitFinish} disabled={saving || (!ok && items.length === 0)} style={{ color: (ok || items.length > 0) ? P.coral : P.tl, border: "1.5px solid", borderColor: (ok || items.length > 0) ? P.coral + "60" : P.bdr, background: "rgba(255,255,255,0.7)" }} className="w-full font-semibold py-3 rounded-xl text-sm">Submit & finish {"\u2713"}</button>
            </>}
            {!cur.cat && <button onClick={submitFinish} disabled={saving} style={{ color: items.length > 0 ? P.coral : P.tl, background: "rgba(255,255,255,0.6)", borderRadius: 12 }} className="w-full mt-2 font-semibold py-3 text-sm">{items.length > 0 ? "Submit & finish (" + items.length + ") \u2713" : "Skip \u2014 just submit my note \u2192"}</button>}
          </div>
        </div>
      </div>
    );
  }

  // === EXPLORE ===
  const selRec = selMap ? data.recs.find(r => r.id === selMap) : null;
  const survivalRecs = data.recs.filter(r => r.cat === "survival");
  const homingRecs = data.recs.filter(r => r.cat === "homing");
  const allLocRecs = fil.filter(r => !isNL(r.cat));

  const TipCard = ({ r, featured }) => {
    const person = data.people[r.by];
    return (
      <div style={{ background: "rgba(255,255,255,0.94)", border: "1px solid " + P.bl, boxShadow: featured ? "0 8px 30px rgba(0,0,0,0.08)" : "none" }} className="rounded-2xl p-5">
        {r.photo && <img src={r.photo} alt="" className="w-full rounded-xl mb-3 object-cover" style={{ maxHeight: featured ? 180 : 120 }} />}
        <div className="flex items-center gap-2 mb-2"><Av name={r.by} size={28} src={person ? person.photo : null} /><span style={{ color: P.deep }} className="font-semibold text-xs">{r.by}</span></div>
        <p className="sf font-semibold mb-1" style={{ color: P.deep, fontSize: featured ? 16 : 14 }}>{r.title}</p>
        <p style={{ color: P.text, lineHeight: 1.7 }} className={"text-sm " + (featured ? "" : "lc3")}>{r.desc}</p>
        {r.tags && r.tags.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{r.tags.map(t => <Tg key={t} text={t} />)}</div>}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24" style={{ position: "relative" }}><IBg />
      <Nav title={WIFE + "'s Paris Guide"} onBack={() => setView("landing")} />
      <div className="px-5 py-6 max-w-2xl mx-auto">
        {/* Filters */}
        <div className="flex flex-wrap gap-1.5 mb-4 sticky top-12 z-10 py-2" style={{ background: "rgba(220,230,240,0.85)", backdropFilter: "blur(12px)", marginLeft: -20, marginRight: -20, paddingLeft: 20, paddingRight: 20 }}>
          <button onClick={() => { setFCat(null); setFTag(null); }} style={{ background: !fCat && !fTag ? P.deep : "white", color: !fCat && !fTag ? "white" : P.text, border: "1.5px solid " + (!fCat && !fTag ? P.deep : P.bdr) }} className="px-3 py-1 rounded-full text-xs font-semibold">All ({rc})</button>
          {CATS.map(cat => { const cnt = data.recs.filter(r => r.cat === cat.id).length; if (!cnt) return null; return (<button key={cat.id} onClick={() => { setFCat(fCat === cat.id ? null : cat.id); setFTag(null); }} style={{ background: fCat === cat.id ? cat.color + "18" : "white", border: "1.5px solid " + (fCat === cat.id ? cat.color + "50" : P.bdr), color: fCat === cat.id ? cat.color : P.text }} className="px-2.5 py-1 rounded-full text-xs font-semibold">{cat.emoji} {cnt}</button>); })}
          {allTags.slice(0, 8).map(t => <Tg key={t} text={t} active={fTag === t} onClick={() => { setFTag(fTag === t ? null : t); setFCat(null); }} />)}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search places, tips, friends, tags..." style={{ border: "1.5px solid " + P.bdr }} className="w-full px-4 py-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-100 mb-6" />

        {/* 1. WELCOME NOTES */}
        {!fCat && pc > 0 && <section className="mb-10">
          <h3 className="sf text-xl font-bold mb-4" style={{ color: P.deep }}>{"\u{1F48C}"} Welcome Notes</h3>
          <FeaturedSwipe items={Object.entries(data.people)} keyFn={([n]) => n} renderItem={([n, info], featured) => (
            <div style={{ background: "rgba(255,255,255,0.94)", border: "1px solid " + P.bl, boxShadow: featured ? "0 8px 30px rgba(0,0,0,0.08)" : "none" }} className="rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3"><Av name={n} size={featured ? 48 : 36} src={info.photo} /><span className="sf font-semibold" style={{ color: P.deep, fontSize: featured ? 18 : 15 }}>{n}</span></div>
              <p style={{ color: P.text, fontStyle: "italic", lineHeight: 1.8, fontSize: featured ? 15 : 13 }}>"{info.note}"</p>
            </div>
          )} />
        </section>}

        {/* 2. SURVIVAL TIPS */}
        {(!fCat || fCat === "survival") && survivalRecs.length > 0 && <section className="mb-10">
          <h3 className="sf text-xl font-bold mb-1" style={{ color: "#AE916B" }}>{"\u{1F9ED}"} Paris Survival Tips</h3>
          <p style={{ color: P.tm }} className="text-xs mb-4">Insider hacks from friends who know</p>
          <FeaturedSwipe items={survivalRecs} keyFn={r => r.id} renderItem={(r, f) => <TipCard r={r} featured={f} />} />
        </section>}

        {/* 3. HOME TIPS */}
        {(!fCat || fCat === "homing") && homingRecs.length > 0 && <section className="mb-10">
          <h3 className="sf text-xl font-bold mb-1" style={{ color: "#7D8E71" }}>{"\u{1F3E1}"} Home Tips</h3>
          <p style={{ color: P.tm }} className="text-xs mb-4">Make your new place feel like home</p>
          <FeaturedSwipe items={homingRecs} keyFn={r => r.id} renderItem={(r, f) => <TipCard r={r} featured={f} />} />
        </section>}

        {/* 4. MAP */}
        {allLocRecs.length > 0 && <section className="mb-10">
          <h3 className="sf text-xl font-bold mb-1" style={{ color: P.deep }}>{"\u{1F4CD}"} Everything on the Map</h3>
          <p style={{ color: P.tm }} className="text-xs mb-3">Tap a marker to see the recommendation</p>
          <MapboxMap recs={allLocRecs} people={data.people} selected={selMap} onSelect={setSelMap} />
          {selRec && <div className="mt-3 af"><RecCard rec={selRec} big highlight /></div>}
        </section>}

        {/* 5. AI */}
        <section className="mb-10">
          <h3 className="sf text-xl font-bold mb-3" style={{ color: P.deep }}>{"\u2728"} Ask the Guide</h3>
          <div className="flex gap-2">
            <input value={aiQ} onChange={e => setAiQ(e.target.value)} onKeyDown={e => { if (e.key === "Enter") doAi(); }} placeholder="e.g. Where should we go for a veggie date night?" style={{ border: "1.5px solid " + P.bdr }} className="flex-1 px-4 py-3 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-100" />
            <button onClick={doAi} disabled={aiL} style={{ background: grad }} className="px-4 py-3 rounded-xl text-white text-sm font-medium">{aiL ? "..." : "Ask"}</button>
          </div>
          {aiR && <div style={{ background: "rgba(255,255,255,0.92)", border: "1px solid " + P.bl, color: P.text }} className="rounded-xl p-4 mt-3 text-sm leading-relaxed">{aiR}</div>}
        </section>

        {/* 6. Category sections */}
        {CATS.filter(c => !isNL(c.id)).map(cat => { const cr = allLocRecs.filter(r => r.cat === cat.id); if (!cr.length) return null; return (<section key={cat.id} className="mb-8"><h3 className="sf text-lg font-bold mb-3" style={{ color: cat.color }}>{cat.emoji} {cat.label}</h3><div className="grid gap-4">{cr.map(r => <RecCard key={r.id} rec={r} big />)}</div></section>); })}

        {!rc && <div className="text-center py-20"><div className="text-5xl mb-4">{"\u{1F5FA}\uFE0F"}</div><p style={{ color: P.tm }} className="text-base">No recommendations yet {"\u2014"} share the link!</p></div>}
      </div>
      <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 40 }}><button onClick={goC} style={{ background: grad, boxShadow: "0 4px 20px " + P.coral + "55" }} className="text-white font-semibold py-3 px-6 rounded-full text-sm flex items-center gap-2">{"\u270D\uFE0F"} Add yours</button></div>
    </div>
  );
}