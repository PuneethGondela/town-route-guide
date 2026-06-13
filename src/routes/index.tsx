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
  const [online, setOnline] = useState(true);
  const [routeLabel, setRouteLabel] = useState("Srikakulam → Visakhapatnam");

  return (
    <div className="min-h-screen w-full bg-slate-100 py-0 sm:py-6">
      {/* Mobile device frame */}
      <div className="relative mx-auto flex w-full max-w-md flex-col overflow-hidden border border-slate-200 bg-background shadow-2xl sm:rounded-[2rem] sm:border-4 sm:border-slate-900/90"
        style={{ height: "min(880px, 100vh)" }}>
        <GlobalHeader routeLabel={routeLabel} online={online} setOnline={setOnline} />

        <main className="flex-1 overflow-y-auto pb-20">
          {tab === "home" && <HomeMap routeLabel={routeLabel} setRouteLabel={setRouteLabel} />}
          {tab === "routes" && <SmartRoutes />}
          {tab === "safety" && <Safety />}
          {tab === "ai" && <AIAssistant setRouteLabel={setRouteLabel} />}
        </main>

        <BottomNav tab={tab} setTab={setTab} />
      </div>
    </div>
  );
}

/* ---------- Global Header ---------- */
function GlobalHeader({
  routeLabel, online, setOnline,
}: { routeLabel: string; online: boolean; setOnline: (b: boolean) => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 pb-3 pt-4 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
            <Bus className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-bold leading-tight tracking-tight">
              Naa Transit <span className="text-[10px] font-semibold text-muted-foreground">v2.0</span>
            </h1>
            <p className="truncate text-[11px] font-medium text-indigo-700">{routeLabel}</p>
          </div>
        </div>
        <button
          onClick={() => setOnline(!online)}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
            online
              ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/40"
              : "bg-amber-500 text-white shadow-sm shadow-amber-500/40"
          }`}
        >
          {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {online ? "Online" : "Offline"}
        </button>
      </div>
      {!online && (
        <p className="mt-2 rounded-md bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-800">
          Using Cached Schedules • Last sync 4 min ago
        </p>
      )}
    </header>
  );
}

/* ---------- Bottom Nav ---------- */
function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: { id: Tab; label: string; icon: typeof MapIcon }[] = [
    { id: "home", label: "Discover", icon: MapIcon },
    { id: "routes", label: "Routes", icon: RouteIcon },
    { id: "safety", label: "Safety", icon: Shield },
    { id: "ai", label: "Assistant", icon: Bot },
  ];
  return (
    <nav className="absolute bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur">
      <div className="grid grid-cols-4">
        {items.map((it) => {
          const active = tab === it.id;
          const Icon = it.icon;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                active ? "text-indigo-600" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`rounded-full px-3 py-1 transition ${active ? "bg-indigo-100" : ""}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={active ? "font-bold" : ""}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ---------- 1. Home & Map ---------- */
function HomeMap({
  routeLabel, setRouteLabel,
}: { routeLabel: string; setRouteLabel: (s: string) => void }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [destination, setDestination] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const pills = [
    { id: "Vizag Beach", label: "Vizag Beach", route: "Srikakulam → Vizag Beach" },
    { id: "Maddilapalem", label: "Maddilapalem", route: "Srikakulam → Maddilapalem" },
    { id: "RTC Complex", label: "RTC Complex", route: "Srikakulam → RTC Complex" },
  ];

  const placesAvailable = new Set(["RTC Complex", "Maddilapalem", "Vizag Beach"]);

  const choose = (p: { id: string; route: string }) => {
    setDestination(p.id);
    setRouteLabel(p.route);
    setSheetOpen(true);
  };

  const submitSearch = () => {
    const q = search.trim();
    if (!q) return;
    // Normalize known destinations to canonical casing
    const known = ["RTC Complex", "Maddilapalem", "Vizag Beach", "Gajuwaka", "Hanumanthawaka"];
    const match = known.find((k) => k.toLowerCase() === q.toLowerCase());
    const dest = match ?? q;
    setDestination(dest);
    setRouteLabel(`Srikakulam → ${dest}`);
    if (placesAvailable.has(dest)) setSheetOpen(true);
    else setSheetOpen(false);
  };

  return (
    <>
      <div className="px-4 pt-3">
        {/* Section title */}
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight">Live Map</h2>
            <p className="text-[11px] text-muted-foreground">Tap a destination to explore nearby</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> LIVE
          </span>
        </div>

        {/* Map */}
        <div className="relative h-[280px] overflow-hidden rounded-2xl border border-border bg-accent">
          <MapMock destination={destination} />
          <div className="absolute left-2.5 right-2.5 top-2.5 flex items-center gap-2 rounded-xl border border-border bg-card/95 px-3 py-2 shadow-md backdrop-blur">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              defaultValue={destination ?? "Where to?"}
              onFocus={() => setSheetOpen(true)}
              className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              placeholder="Search destination"
            />
          </div>
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between rounded-xl bg-indigo-600/95 px-3 py-2.5 text-white shadow-lg">
            <span className="flex items-center gap-2 text-xs font-semibold">
              <Navigation className="h-3.5 w-3.5" /> {routeLabel}
            </span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
              ETA 2h 15m
            </span>
          </div>
        </div>

        {/* Quick destination pills */}
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Quick destinations
          </p>
          <div className="flex flex-wrap gap-2">
            {pills.map((p) => {
              const active = destination === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => choose(p)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                    active
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                      : "border-border bg-card text-foreground hover:border-indigo-300"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" /> {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="Next Bus" value="111A" icon={Bus} />
          <Stat label="Arriving" value="10 min" icon={Clock} />
          <Stat label="Crowd" value="Medium" icon={Users} />
        </div>
      </div>

      {sheetOpen && destination && (
        <PlacesSheet destination={destination} onClose={() => setSheetOpen(false)} />
      )}
    </>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Clock }) {
  return (
    <div className="rounded-xl border border-border bg-card p-2.5">
      <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-0.5 text-sm font-bold tracking-tight">{value}</div>
    </div>
  );
}

function MapMock({ destination }: { destination: string | null }) {
  // Different end markers slightly shifted for visual reroute effect
  const ends: Record<string, { x: number; y: number; label: string }> = {
    "Vizag Beach": { x: 360, y: 280, label: "Vizag Beach" },
    "Maddilapalem": { x: 320, y: 230, label: "Maddilapalem" },
    "RTC Complex": { x: 340, y: 200, label: "RTC Complex" },
  };
  const end = (destination && ends[destination]) || { x: 360, y: 260, label: "Visakhapatnam" };

  return (
    <svg viewBox="0 0 400 280" className="h-full w-full">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eef2ff" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#c7d2fe" strokeWidth="0.5" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="400" height="280" fill="url(#bg)" />
      <rect width="400" height="280" fill="url(#grid)" />
      {/* roads */}
      <g stroke="#94a3b8" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.4">
        <path d="M-20 60 Q 120 80 200 50 T 420 100" />
        <path d="M-20 180 Q 80 160 180 200 T 420 180" />
        <path d="M60 -20 Q 80 100 140 160 T 200 300" />
        <path d="M300 -20 Q 280 100 320 160 T 320 300" />
      </g>
      {/* route */}
      <path
        d={`M40 50 Q 140 110 200 140 T ${end.x} ${end.y}`}
        stroke="#4f46e5"
        strokeWidth="3.5"
        strokeDasharray="2 6"
        fill="none"
        strokeLinecap="round"
      />
      {/* start */}
      <circle cx="40" cy="50" r="7" fill="#10b981" />
      <circle cx="40" cy="50" r="12" fill="#10b981" fillOpacity="0.2" />
      <text x="50" y="46" fontSize="10" fill="#0f172a" fontWeight="700">Srikakulam</text>
      {/* mid */}
      <circle cx="200" cy="140" r="4" fill="#4f46e5" />
      <text x="208" y="136" fontSize="9" fill="#334155">Anakapalle</text>
      {/* end */}
      <circle cx={end.x} cy={end.y} r="18" fill="#e11d48" fillOpacity="0.18" />
      <circle cx={end.x} cy={end.y} r="8" fill="#e11d48" />
      <text x={end.x - 50} y={end.y + 25} fontSize="10" fill="#0f172a" fontWeight="700">
        {end.label}
      </text>
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
    { id: "hospital", label: "Medical", icon: Hospital },
    { id: "atm", label: "ATMs", icon: Banknote },
    { id: "events", label: "Events", icon: PartyPopper },
  ];

  const data: Record<PlaceCat, { name: string; meta: string; tag?: string }[]> = {
    tourist: [
      { name: "RK Beach Promenade", meta: "0.4 km • Beachfront walkway", tag: "Popular" },
      { name: "INS Kursura Submarine Museum", meta: "0.8 km • Open till 8 PM" },
      { name: "Kailasagiri Hilltop", meta: "6 km • Ropeway available" },
      { name: "Tenneti Park", meta: "2.1 km • Sunset views" },
    ],
    food: [
      { name: "Sai Ram Parlour", meta: "0.3 km • Tiffins & dosa • ₹" },
      { name: "Dharani Restaurant", meta: "1.2 km • Andhra meals • ₹₹" },
      { name: "Bay of Bengal Café", meta: "0.5 km • Seafood • ₹₹₹" },
    ],
    hospital: [
      { name: "KGH Govt. Hospital", meta: "2.4 km • 24x7 Emergency" },
      { name: "Apollo Health City", meta: "8 km • Multi-specialty" },
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
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-foreground/40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-t-3xl bg-card pb-4 shadow-2xl animate-in slide-in-from-bottom-4"
      >
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-border" />
        <div className="flex items-start justify-between px-5 pt-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Surrounding Places
            </p>
            <h2 className="text-lg font-bold">{destination}</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex gap-1.5 overflow-x-auto px-5 pb-2">
          {tabs.map((t) => {
            const active = cat === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setCat(t.id)}
                className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                  active
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-border bg-card text-foreground"
                }`}
              >
                <Icon className="h-3 w-3" /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="max-h-[40vh] overflow-y-auto px-5">
          <ul className="space-y-2 pb-2">
            {data[cat].map((p) => (
              <li key={p.name} className="flex items-start gap-3 rounded-xl border border-border bg-background p-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    {p.tag && (
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        p.tag === "Live" ? "bg-emerald-100 text-emerald-700"
                        : p.tag === "Alert" ? "bg-rose-100 text-rose-700"
                        : "bg-indigo-100 text-indigo-700"
                      }`}>{p.tag}</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{p.meta}</p>
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
type RouteOpt = {
  label: string; tag: string; time: string; price: string;
  crowd: "Low" | "Medium" | "High";
  buses: string[]; stops: string[]; getOff: string;
};

function SmartRoutes() {
  const [from, setFrom] = useState("Srikakulam");
  const [to, setTo] = useState("Visakhapatnam");
  const [selected, setSelected] = useState<number | null>(0);

  const routes: RouteOpt[] = [
    {
      label: "Fastest Route", tag: "Recommended",
      time: "2h 15m", price: "₹140", crowd: "Medium",
      buses: ["111A Express"],
      stops: ["Srikakulam RTC Complex", "Narasannapeta", "Hanumanthawaka", "Vizag Complex"],
      getOff: "Hanumanthawaka",
    },
    {
      label: "Cheapest Route", tag: "Best Value",
      time: "2h 45m", price: "₹80", crowd: "High",
      buses: ["Palle Velugu 211"],
      stops: ["Srikakulam RTC Complex", "Amadalavalasa", "Vizianagaram", "Gajuwaka", "Vizag Complex"],
      getOff: "Vizag Complex",
    },
    {
      label: "Least Crowded", tag: "Comfortable",
      time: "2h 30m", price: "₹190", crowd: "Low",
      buses: ["APSRTC Ultra Deluxe"],
      stops: ["Srikakulam RTC Complex", "Tekkali Bypass", "Anakapalle", "Hanumanthawaka", "Vizag Complex"],
      getOff: "Vizag Complex",
    },
  ];

  return (
    <div className="px-4 pt-3">
      <div className="mb-3">
        <h2 className="text-base font-bold tracking-tight">Smart Routes</h2>
        <p className="text-[11px] text-muted-foreground">Crowd-aware terminal-to-terminal planning</p>
      </div>

      {/* From / To */}
      <div className="rounded-2xl border border-border bg-card p-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center pt-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="my-1 h-6 w-px bg-border" />
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">From Terminal</label>
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">To Destination</label>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
        <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 active:scale-[0.99]">
          <Search className="h-4 w-4" /> Find Routes
        </button>
      </div>

      <div className="mt-3 space-y-2.5">
        {routes.map((r, i) => (
          <RouteCard
            key={r.label}
            route={r}
            active={selected === i}
            onClick={() => setSelected(selected === i ? null : i)}
          />
        ))}
      </div>
    </div>
  );
}

function RouteCard({
  route, active, onClick,
}: { route: RouteOpt; active: boolean; onClick: () => void }) {
  const crowdColor =
    route.crowd === "Low" ? "bg-emerald-100 text-emerald-700"
    : route.crowd === "Medium" ? "bg-amber-100 text-amber-800"
    : "bg-rose-100 text-rose-700";

  return (
    <div className={`overflow-hidden rounded-2xl border bg-card transition ${active ? "border-indigo-600 shadow-md shadow-indigo-600/10" : "border-border"}`}>
      <button onClick={onClick} className="w-full p-3.5 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-600">{route.tag}</p>
            <h3 className="truncate text-sm font-bold">{route.label}</h3>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              <Bus className="mr-1 inline h-3 w-3" /> {route.buses[0]}
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${crowdColor}`}>
            {route.crowd} Crowd
          </span>
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 font-bold"><Clock className="h-3.5 w-3.5 text-muted-foreground" /> {route.time}</span>
          <span className="flex items-center gap-1 font-bold"><IndianRupee className="h-3.5 w-3.5 text-muted-foreground" /> {route.price.replace("₹", "")}</span>
          <span className="ml-auto text-[10px] font-semibold text-indigo-600">{active ? "Hide ▲" : "Details ▼"}</span>
        </div>
      </button>

      {active && (
        <div className="border-t border-border bg-indigo-50/30 px-3.5 py-3 animate-in fade-in slide-in-from-top-1">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            <Navigation className="h-3 w-3" /> Sequential Stops
          </div>
          <ol className="space-y-1">
            {route.stops.map((s, i) => {
              const isOff = s === route.getOff;
              return (
                <li key={s} className="flex items-center gap-2 text-xs">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                    isOff ? "bg-rose-500 text-white" : "bg-secondary text-secondary-foreground"
                  }`}>{i + 1}</span>
                  <span className={isOff ? "font-bold text-rose-600" : "font-medium"}>{s}</span>
                  {isOff && (
                    <span className="ml-auto rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      GET DOWN
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

/* ---------- 3. Safety ---------- */
function Safety() {
  const [sosState, setSosState] = useState<"idle" | "sending" | "sent">("idle");
  const [sharing, setSharing] = useState(false);
  const alerts = [
    { type: "good", text: "Maddilapalem Station: Well-lit platform with police checkpoint active", time: "5 min ago", by: "Priya" },
    { type: "warn", text: "Heavy crowd reported at RTC Complex Terminal", time: "12 min ago", by: "Anil" },
    { type: "good", text: "Police patrol seen at Jagadamba Junction", time: "32 min ago", by: "Lakshmi" },
    { type: "warn", text: "Avoid isolated stretch near NAD Kotha Road after 9 PM", time: "1 hr ago", by: "Community" },
  ];

  const triggerSOS = () => {
    setSosState("sending");
    setTimeout(() => {
      setSosState("sent");
      if (typeof window !== "undefined") {
        window.alert(
          "🚨 SOS BROADCAST SENT\n\nSMS dispatched to 3 family contacts:\n• Amma (+91 98XXX XX123)\n• Nanna (+91 98XXX XX456)\n• Bro (+91 99XXX XX789)\n\nLive coordinates: 17.6868° N, 83.2185° E\nNearest help: Maddilapalem Police Station (0.6 km)"
        );
      }
    }, 900);
  };

  return (
    <div className="space-y-3 px-4 pt-3">
      <div>
        <h2 className="text-base font-bold tracking-tight">Guardian Safety Hub</h2>
        <p className="text-[11px] text-muted-foreground">Always with you on the road</p>
      </div>

      {/* SOS */}
      <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-card p-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/40">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="mt-2 text-base font-bold">Emergency SOS Alert</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Broadcasts your live location via SMS to 3 saved family contacts.
        </p>
        <button
          onClick={triggerSOS}
          disabled={sosState !== "idle"}
          className={`mt-3 w-full rounded-xl py-3 text-sm font-bold text-white transition active:scale-[0.98] ${
            sosState === "sent"
              ? "bg-emerald-500"
              : sosState === "sending"
              ? "bg-rose-400 animate-pulse"
              : "bg-rose-500 shadow-lg shadow-rose-500/30"
          }`}
        >
          {sosState === "sent"
            ? "✓ SOS Sent — Help is on the way"
            : sosState === "sending"
            ? "Sending Urgent Coordinates..."
            : "TAP TO SEND SOS"}
        </button>
      </div>

      {/* Share Live Journey */}
      <div className="rounded-2xl border border-border bg-card p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Share Live Journey Link</p>
              <p className="text-[11px] text-muted-foreground">Lightweight tracking via SMS link</p>
            </div>
          </div>
          <button
            onClick={() => setSharing(!sharing)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${sharing ? "bg-emerald-500" : "bg-slate-300"}`}
          >
            <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${sharing ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </div>
        {sharing && (
          <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs">
            <span className="truncate font-mono text-emerald-800">naa.tr/j/9KX2P-vzg</span>
            <button className="shrink-0 font-bold text-emerald-700">Copy</button>
          </div>
        )}
      </div>

      {/* Quick contacts */}
      <div className="grid grid-cols-2 gap-2">
        <button className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-xs font-semibold">
          <PhoneCall className="h-4 w-4 text-emerald-600" /> Call 112
        </button>
        <button className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4 text-indigo-600" /> Women 181
        </button>
      </div>

      {/* Women Safety Alerts Feed */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold">Women Safety Alerts</h3>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
            <Bell className="h-3 w-3" /> Community Feed
          </span>
        </div>
        <ul className="space-y-2">
          {alerts.map((a, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card p-2.5">
              <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${a.type === "good" ? "bg-emerald-500" : "bg-amber-500"}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-snug">{a.text}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  <span className="font-semibold">{a.by}</span> • {a.time}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- 4. AI Assistant ---------- */
type Msg = { id: number; role: "user" | "bot"; text: string; rich?: boolean };

function AIAssistant({ setRouteLabel }: { setRouteLabel: (s: string) => void }) {
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

    const lower = text.toLowerCase();
    const isCarShed = lower.includes("car shed") || lower.includes("vizag car");

    if (isCarShed) setRouteLabel("Srikakulam → Vizag Car Shed");

    setTimeout(() => {
      const replyText = isCarShed
        ? "Take Bus 111A → Expected Arrival: 10 mins → Map route initialized → Get down at Hanumanthawaka Junction."
        : lower.includes("araku")
        ? "Cheapest: APSRTC Pallevelugu via Anantagiri → 4h 30m → ₹160 → Get down at Araku Bus Stand."
        : lower.includes("gajuwaka")
        ? "Last bus 28A departs RTC Complex at 22:45 → 35 mins → Get down at Gajuwaka Junction."
        : "Based on cached schedules: nearest bus departs in ~12 mins. Tap Smart Routes for alternates.";
      const reply: Msg = {
        id: Date.now() + 1,
        role: "bot",
        rich: isCarShed || lower.includes("vizag") || lower.includes("gajuwaka") || lower.includes("araku"),
        text: replyText,
      };
      setMessages((m) => [...m, reply]);
    }, 600);

  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-indigo-50/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-xs font-bold">AI Travel Assistant</p>
            <p className="text-[10px] text-emerald-600 font-semibold">● Online • Offline-capable</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto bg-slate-50/50 px-3 py-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "bot" && (
              <div className="mr-1.5 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                <Bot className="h-3.5 w-3.5" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs shadow-sm ${
                m.role === "user"
                  ? "rounded-br-sm bg-indigo-600 text-white"
                  : "rounded-bl-sm bg-card text-foreground"
              }`}
            >
              {m.rich ? <RichBotReply text={m.text} /> : m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Suggested chips */}
      <div className="border-t border-border bg-card px-3 pb-1.5 pt-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Composer */}
        <div className="flex items-center gap-2 pb-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask(input)}
            placeholder="Ask anything about transit…"
            className="flex-1 rounded-full border border-border bg-background px-3.5 py-2 text-xs outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => ask(input)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 active:scale-95"
          >
            <Send className="h-3.5 w-3.5" />
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
    <div className="space-y-1.5">
      {parts.map((p, i) => {
        const Icon = icons[i] ?? ArrowRight;
        return (
          <div key={i} className="flex items-start gap-1.5 rounded-lg bg-indigo-50 px-2 py-1.5">
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600" />
            <span className="text-[11px] font-medium leading-snug text-foreground">{p}</span>
          </div>
        );
      })}
    </div>
  );
}
