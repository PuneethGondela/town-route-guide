import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Map as MapIcon, Route as RouteIcon, Shield, Bot, Search, Wifi, WifiOff,
  MapPin, Utensils, Hospital, Banknote, PartyPopper, Landmark, X,
  Clock, IndianRupee, Users, Bus, ArrowRight, AlertTriangle, PhoneCall,
  Share2, ShieldCheck, Send, Sparkles, Navigation, ChevronRight, Bell,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Naa Transit — Smart Public Transport" },
      { name: "description", content: "Smart public transport for Srikakulam, Vizag and small towns. Offline-ready routes, safety & AI assistant." },
      { property: "og:title", content: "Naa Transit" },
      { property: "og:description", content: "Smart public transport for small cities & towns." },
    ],
  }),
  component: App,
});

type Tab = "home" | "routes" | "safety" | "ai";

function App() {
  const [tab, setTab] = useState<Tab>("home");
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md pb-24">
        {tab === "home" && <HomeMap />}
        {tab === "routes" && <SmartRoutes />}
        {tab === "safety" && <Safety />}
        {tab === "ai" && <AIAssistant />}
      </div>
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}

/* ---------- Bottom Nav ---------- */
function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: { id: Tab; label: string; icon: typeof MapIcon }[] = [
    { id: "home", label: "Map", icon: MapIcon },
    { id: "routes", label: "Routes", icon: RouteIcon },
    { id: "safety", label: "Safety", icon: Shield },
    { id: "ai", label: "Assistant", icon: Bot },
  ];
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/95 backdrop-blur">
      <div className="grid grid-cols-4">
        {items.map((it) => {
          const active = tab === it.id;
          const Icon = it.icon;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className={`flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className={`rounded-full p-1.5 ${active ? "bg-primary/10" : ""}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={active ? "font-semibold" : ""}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ---------- Header ---------- */
function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 px-5 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Bus className="h-5 w-5" />
        </div>
      </div>
    </header>
  );
}

/* ---------- 1. Home & Map ---------- */
function HomeMap() {
  const [online, setOnline] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [destination, setDestination] = useState("Vizag Beach");

  return (
    <>
      <Header title="Naa Transit" subtitle="Srikakulam → Visakhapatnam" />
      <div className="px-5 pt-4">
        {/* Mode toggle */}
        <div className="flex rounded-full bg-secondary p-1 text-sm">
          <button
            onClick={() => setOnline(true)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 font-medium transition ${
              online ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Wifi className="h-4 w-4" /> Online Mode
          </button>
          <button
            onClick={() => setOnline(false)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-xs font-medium transition ${
              !online ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <WifiOff className="h-4 w-4" /> Offline (Cached)
          </button>
        </div>

        {/* Map */}
        <div className="relative mt-4 h-[360px] overflow-hidden rounded-2xl border border-border bg-accent">
          <MapMock />
          {/* Floating search */}
          <div className="absolute left-3 right-3 top-3 flex items-center gap-2 rounded-xl border border-border bg-card/95 px-3 py-2.5 shadow-md backdrop-blur">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              defaultValue="Vizag Beach"
              onFocus={() => setSheetOpen(true)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search destination"
            />
          </div>
          {/* CTA pin */}
          <button
            onClick={() => { setDestination("Vizag Beach"); setSheetOpen(true); }}
            className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-lg"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4" /> Explore {destination}
            </span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Quick stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="ETA" value="2h 15m" icon={Clock} />
          <Stat label="Bus" value="111A" icon={Bus} />
          <Stat label="Crowd" value="Medium" icon={Users} />
        </div>
      </div>

      {sheetOpen && <PlacesSheet destination={destination} onClose={() => setSheetOpen(false)} />}
    </>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Clock }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1 text-sm font-bold">{value}</div>
    </div>
  );
}

function MapMock() {
  return (
    <svg viewBox="0 0 400 360" className="h-full w-full">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.95 0.03 220)" />
          <stop offset="100%" stopColor="oklch(0.9 0.05 200)" />
        </linearGradient>
      </defs>
      <rect width="400" height="360" fill="url(#bg)" />
      {/* roads */}
      <g stroke="oklch(0.85 0.02 240)" strokeWidth="8" fill="none" strokeLinecap="round">
        <path d="M-20 80 Q 120 100 200 60 T 420 120" />
        <path d="M-20 220 Q 80 200 180 240 T 420 220" />
        <path d="M60 -20 Q 80 120 140 200 T 200 420" />
        <path d="M300 -20 Q 280 120 320 200 T 320 420" />
      </g>
      {/* route Srikakulam → Vizag */}
      <path
        d="M40 70 Q 140 140 200 180 T 360 290"
        stroke="oklch(0.55 0.18 250)"
        strokeWidth="4"
        strokeDasharray="2 6"
        fill="none"
        strokeLinecap="round"
      />
      {/* start */}
      <circle cx="40" cy="70" r="8" fill="oklch(0.65 0.16 155)" />
      <text x="52" y="65" fontSize="11" fill="oklch(0.2 0.03 250)" fontWeight="700">Srikakulam</text>
      {/* mid stop */}
      <circle cx="200" cy="180" r="5" fill="oklch(0.55 0.18 250)" />
      <text x="208" y="176" fontSize="10" fill="oklch(0.3 0.03 250)">Anakapalle</text>
      {/* end */}
      <g>
        <circle cx="360" cy="290" r="10" fill="oklch(0.58 0.22 25)" />
        <circle cx="360" cy="290" r="18" fill="oklch(0.58 0.22 25)" fillOpacity="0.2" />
      </g>
      <text x="295" y="320" fontSize="11" fill="oklch(0.2 0.03 250)" fontWeight="700">Vizag Beach</text>
    </svg>
  );
}

/* ---------- Places sheet ---------- */
type PlaceCat = "tourist" | "food" | "hospital" | "atm" | "events";

function PlacesSheet({ destination, onClose }: { destination: string; onClose: () => void }) {
  const [cat, setCat] = useState<PlaceCat>("tourist");
  const tabs: { id: PlaceCat; label: string; icon: typeof Landmark }[] = [
    { id: "tourist", label: "Tourist", icon: Landmark },
    { id: "food", label: "Food", icon: Utensils },
    { id: "hospital", label: "Hospitals", icon: Hospital },
    { id: "atm", label: "ATMs", icon: Banknote },
    { id: "events", label: "Events", icon: PartyPopper },
  ];

  const data: Record<PlaceCat, { name: string; meta: string; tag?: string }[]> = {
    tourist: [
      { name: "RK Beach", meta: "0.4 km • Beachfront promenade", tag: "Popular" },
      { name: "INS Kursura Submarine Museum", meta: "0.8 km • Open till 8 PM" },
      { name: "Kailasagiri Hilltop", meta: "6 km • Ropeway available" },
      { name: "Tenneti Park", meta: "2.1 km • Sunset views" },
    ],
    food: [
      { name: "Sea Inn Restaurant", meta: "0.3 km • Andhra meals • ₹₹" },
      { name: "Dharani Restaurant", meta: "1.2 km • Veg thali • ₹" },
      { name: "Bay of Bengal Café", meta: "0.5 km • Seafood • ₹₹₹" },
    ],
    hospital: [
      { name: "KGH Govt. Hospital", meta: "2.4 km • 24x7 Emergency" },
      { name: "Apollo Hospitals Health City", meta: "8 km • Multi-specialty" },
    ],
    atm: [
      { name: "SBI ATM — Beach Road", meta: "0.2 km • Working" },
      { name: "HDFC ATM — RTC Complex", meta: "3.1 km • Working" },
    ],
    events: [
      { name: "Visakha Utsav Festival", meta: "Happening now at Beach Road", tag: "Live" },
      { name: "Traffic diversion at RTC Complex", meta: "Use NH-16 bypass via Gopalapatnam", tag: "Alert" },
      { name: "Navy Day Air Show", meta: "Dec 4 • RK Beach", tag: "Upcoming" },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-card pb-6 shadow-2xl animate-in slide-in-from-bottom-4"
      >
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-border" />
        <div className="flex items-start justify-between px-5 pt-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Surrounding Places</p>
            <h2 className="text-xl font-bold">{destination}</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto px-5 pb-2">
          {tabs.map((t) => {
            const active = cat === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setCat(t.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="max-h-[55vh] overflow-y-auto px-5">
          <ul className="space-y-2 pb-2">
            {data[cat].map((p) => (
              <li key={p.name} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    {p.tag && (
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        p.tag === "Live" ? "bg-success/15 text-success"
                        : p.tag === "Alert" ? "bg-danger/15 text-danger"
                        : "bg-primary/10 text-primary"
                      }`}>{p.tag}</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.meta}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------- 2. Smart Routes ---------- */
function SmartRoutes() {
  const [from, setFrom] = useState("Srikakulam");
  const [to, setTo] = useState("Visakhapatnam");
  const [selected, setSelected] = useState<number | null>(0);

  const routes = [
    {
      label: "Fastest Route",
      tag: "Recommended",
      time: "2h 15m",
      price: "₹120",
      crowd: "Medium" as const,
      buses: ["APSRTC 111A — Express"],
      stops: ["Srikakulam RTC", "Ranasthalam", "Anakapalle", "NAD Junction", "RTC Complex Vizag"],
      getOff: "RTC Complex Vizag",
    },
    {
      label: "Cheapest Route",
      tag: "Best Value",
      time: "3h 05m",
      price: "₹80",
      crowd: "High" as const,
      buses: ["APSRTC 222P — Pallevelugu", "City Bus 28A"],
      stops: ["Srikakulam RTC", "Amadalavalasa", "Vizianagaram", "Gajuwaka", "Vizag Bus Stand"],
      getOff: "Vizag Bus Stand",
    },
    {
      label: "Least Crowded",
      tag: "Comfortable",
      time: "2h 40m",
      price: "₹140",
      crowd: "Low" as const,
      buses: ["APSRTC 305L — Super Luxury"],
      stops: ["Srikakulam RTC", "Tekkali Bypass", "Anakapalle", "Dwaraka Bus Stand"],
      getOff: "Dwaraka Bus Stand",
    },
  ];

  return (
    <>
      <Header title="Smart Routes" subtitle="Crowd-aware recommendations" />
      <div className="px-5 pt-4">
        {/* From / To */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center pt-1">
              <span className="h-2.5 w-2.5 rounded-full bg-success" />
              <span className="my-1 h-6 w-px bg-border" />
              <span className="h-2.5 w-2.5 rounded-sm bg-danger" />
            </div>
            <div className="flex-1 space-y-2">
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="From"
              />
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="To"
              />
            </div>
          </div>
          <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
            <Search className="h-4 w-4" /> Find Routes
          </button>
        </div>

        {/* Route cards */}
        <div className="mt-4 space-y-3">
          {routes.map((r, i) => (
            <RouteCard key={r.label} route={r} active={selected === i} onClick={() => setSelected(selected === i ? null : i)} />
          ))}
        </div>
      </div>
    </>
  );
}

function RouteCard({
  route, active, onClick,
}: {
  route: { label: string; tag: string; time: string; price: string; crowd: "Low" | "Medium" | "High"; buses: string[]; stops: string[]; getOff: string };
  active: boolean;
  onClick: () => void;
}) {
  const crowdColor =
    route.crowd === "Low" ? "bg-success/15 text-success"
    : route.crowd === "Medium" ? "bg-warning/20 text-warning-foreground"
    : "bg-danger/15 text-danger";

  return (
    <div className={`overflow-hidden rounded-2xl border bg-card transition ${active ? "border-primary shadow-md" : "border-border"}`}>
      <button onClick={onClick} className="w-full p-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-primary">{route.tag}</p>
            <h3 className="truncate text-base font-bold">{route.label}</h3>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${crowdColor}`}>
            {route.crowd} Crowd
          </span>
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 font-semibold"><Clock className="h-4 w-4 text-muted-foreground" /> {route.time}</span>
          <span className="flex items-center gap-1 font-semibold"><IndianRupee className="h-4 w-4 text-muted-foreground" /> {route.price.replace("₹", "")}</span>
          <span className="ml-auto text-xs text-muted-foreground">{active ? "Hide details" : "View details"}</span>
        </div>
      </button>

      {active && (
        <div className="border-t border-border bg-background/50 px-4 py-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Bus className="h-3.5 w-3.5" /> BUS NUMBERS
          </div>
          <ul className="mb-3 space-y-1 text-sm">
            {route.buses.map((b) => <li key={b} className="rounded-md bg-accent/60 px-2 py-1.5 font-medium">{b}</li>)}
          </ul>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Navigation className="h-3.5 w-3.5" /> STOPS
          </div>
          <ol className="space-y-1.5">
            {route.stops.map((s, i) => (
              <li key={s} className="flex items-center gap-2 text-sm">
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  s === route.getOff ? "bg-danger text-danger-foreground" : "bg-secondary text-secondary-foreground"
                }`}>{i + 1}</span>
                <span className={s === route.getOff ? "font-bold text-danger" : ""}>{s}</span>
                {s === route.getOff && <span className="ml-auto text-[10px] font-bold text-danger">GET DOWN</span>}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/* ---------- 3. Safety ---------- */
function Safety() {
  const [sosSent, setSosSent] = useState(false);
  const [sharing, setSharing] = useState(false);
  const alerts = [
    { type: "good", text: "Well-lit bus stop at Dwaraka Nagar", time: "5 min ago", by: "Priya" },
    { type: "warn", text: "Heavy crowd at RTC Complex Terminal", time: "12 min ago", by: "Anil" },
    { type: "good", text: "Police patrol seen at Jagadamba Junction", time: "32 min ago", by: "Lakshmi" },
    { type: "warn", text: "Avoid isolated stretch near NAD after 9 PM", time: "1 hr ago", by: "Community" },
  ];

  return (
    <>
      <Header title="Guardian Safety" subtitle="Always with you on the road" />
      <div className="space-y-4 px-5 pt-4">
        {/* SOS */}
        <div className="rounded-2xl border border-danger/30 bg-gradient-to-br from-danger/10 to-card p-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger text-danger-foreground">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="mt-3 text-lg font-bold">Emergency SOS</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Sends your live location via SMS to your 3 saved family contacts.
          </p>
          <button
            onClick={() => setSosSent(true)}
            className="mt-4 w-full rounded-xl bg-danger py-3 text-sm font-bold text-danger-foreground active:scale-[0.98]"
          >
            {sosSent ? "✓ SOS Sent — Help is on the way" : "TAP TO SEND SOS"}
          </button>
          {sosSent && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Location 17.6868° N, 83.2185° E shared with Amma, Nanna, Bro.
            </p>
          )}
        </div>

        {/* Share Live Journey */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Share Live Journey</p>
                <p className="text-xs text-muted-foreground">Lightweight tracking link</p>
              </div>
            </div>
            <button
              onClick={() => setSharing(!sharing)}
              className={`relative h-7 w-12 rounded-full transition ${sharing ? "bg-primary" : "bg-border"}`}
            >
              <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-card shadow transition ${sharing ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
          {sharing && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-secondary px-3 py-2 text-xs">
              <span className="truncate font-mono text-muted-foreground">naa.tr/j/9KX2P-vzg</span>
              <button className="shrink-0 font-semibold text-primary">Copy</button>
            </div>
          )}
        </div>

        {/* Quick contacts */}
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-semibold">
            <PhoneCall className="h-4 w-4 text-success" /> Call 112
          </button>
          <button className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-primary" /> Women 181
          </button>
        </div>

        {/* Women Safety Alerts */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold">Women Safety Alerts</h3>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Bell className="h-3 w-3" /> Community Feed
            </span>
          </div>
          <ul className="space-y-2">
            {alerts.map((a, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
                <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${a.type === "good" ? "bg-success" : "bg-warning"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{a.text}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{a.by} • {a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

/* ---------- 4. AI Assistant ---------- */
type Msg = { id: number; role: "user" | "bot"; text: string; rich?: boolean };

function AIAssistant() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: 1, role: "bot", text: "Namaste 🙏 I'm your offline-capable travel assistant. Ask me about buses, routes, or timings in Srikakulam & Vizag." },
  ]);
  const [input, setInput] = useState("");

  const suggestions = [
    "How do I go from Srikakulam to Vizag Car Shed?",
    "Last bus from RTC Complex to Gajuwaka?",
    "Cheapest route to Araku Valley?",
  ];

  const ask = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { id: Date.now(), role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTimeout(() => {
      const reply: Msg = {
        id: Date.now() + 1,
        role: "bot",
        rich: text.toLowerCase().includes("car shed") || text.toLowerCase().includes("vizag"),
        text:
          text.toLowerCase().includes("car shed") || text.toLowerCase().includes("vizag")
            ? "Take Bus 111A → Expected Arrival: 10 mins → Map route initialized → Get down at Hanumanthawaka Junction."
            : "Based on cached schedules: nearest bus departs in ~12 mins from your area. Tap Smart Routes for alternates.",
      };
      setMessages((m) => [...m, reply]);
    }, 600);
  };

  return (
    <div className="flex h-screen max-h-screen flex-col">
      <Header title="AI Travel Assistant" subtitle="Works offline • Cached intelligence" />

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 pb-32">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "bot" && (
              <div className="mr-2 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                m.role === "user"
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-card text-foreground"
              }`}
            >
              {m.rich ? <RichBotReply text={m.text} /> : m.text}
            </div>
          </div>
        ))}

        {/* Suggested chips (always visible at top of messages area) */}
        <div className="pt-2">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Suggested
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="fixed bottom-16 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-border bg-card px-3 py-2.5">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask(input)}
            placeholder="Ask anything about transit…"
            className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={() => ask(input)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function RichBotReply({ text }: { text: string }) {
  const parts = text.split(" → ");
  const icons = [Bus, Clock, MapIcon, ArrowRight];
  return (
    <div className="space-y-2">
      {parts.map((p, i) => {
        const Icon = icons[i] ?? ArrowRight;
        return (
          <div key={i} className="flex items-start gap-2 rounded-lg bg-accent/60 px-2.5 py-2">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm font-medium text-foreground">{p}</span>
          </div>
        );
      })}
    </div>
  );
}
