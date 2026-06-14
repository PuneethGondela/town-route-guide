import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Map as MapIcon, Route as RouteIcon, Shield, Bot, Search, Wifi, WifiOff,
  MapPin, Utensils, Hospital, Banknote, PartyPopper, Landmark, X,
  Clock, IndianRupee, Users, Bus, ArrowRight, AlertTriangle, PhoneCall,
  Share2, ShieldCheck, Send, Sparkles, Navigation, ChevronRight, Bell,
  Languages, Copy, Loader2, Check, Lightbulb, ShieldAlert, Crown, Zap, Wallet,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Naa Transit — APSRTC Smart Transit (AP)" },
      { name: "description", content: "Multi-language APSRTC bus network companion for Andhra Pradesh — live routes, safety hub and AI travel assistant." },
      { property: "og:title", content: "Naa Transit — APSRTC" },
      { property: "og:description", content: "Smart public transport for Andhra Pradesh." },
    ],
  }),
  component: App,
});

/* ============================================================
   i18n DICTIONARY
   ============================================================ */
type Lang = "en" | "te" | "hi";
const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "ENG" },
  { id: "te", label: "తెలుగు" },
  { id: "hi", label: "HIND" },
];

const DICT = {
  appName: { en: "Naa Transit", te: "నా ట్రాన్సిట్", hi: "ना ट्रांज़िट" },
  govTag: { en: "Govt. of Andhra Pradesh • APSRTC", te: "ఆంధ్రప్రదేశ్ ప్రభుత్వం • APSRTC", hi: "आंध्र प्रदेश सरकार • APSRTC" },
  online: { en: "Live", te: "లైవ్", hi: "लाइव" },
  offline: { en: "Cached", te: "క్యాష్", hi: "कैश" },
  cached: { en: "Using cached schedules • Last sync 4 min ago", te: "క్యాష్ చేసిన షెడ్యూల్‌లు • 4 నిమి క్రితం సింక్", hi: "कैश शेड्यूल का उपयोग • 4 मिनट पहले सिंक" },
  discover: { en: "Discover", te: "డిస్కవర్", hi: "खोजें" },
  routes: { en: "Routes", te: "రూట్లు", hi: "रूट्स" },
  safety: { en: "Safety", te: "రక్షణ", hi: "सुरक्षा" },
  assistant: { en: "Copilot", te: "సహాయకుడు", hi: "सहायक" },
  fastest: { en: "Fastest", te: "అతి వేగం", hi: "सबसे तेज़" },
  cheapest: { en: "Budget", te: "బడ్జెట్", hi: "बजट" },
  leastCrowd: { en: "Most Comfort", te: "ఎక్కువ సౌకర్యం", hi: "अधिक आराम" },
  crowdHigh: { en: "High Crowd", te: "ఎక్కువ రద్దీ", hi: "अधिक भीड़" },
  crowdMed: { en: "Medium Crowd", te: "మధ్యస్థం", hi: "मध्यम" },
  crowdLow: { en: "Low Crowd", te: "తక్కువ రద్దీ", hi: "कम भीड़" },
  getDown: { en: "Final stop", te: "చివరి స్టాప్", hi: "अंतिम स्टॉप" },
  changeBus: { en: "Transfer point", te: "మార్పు పాయింట్", hi: "बदलाव बिंदु" },
  from: { en: "From", te: "నుండి", hi: "से" },
  to: { en: "To", te: "వరకు", hi: "तक" },
  whereTo: { en: "Where to?", te: "ఎక్కడికి?", hi: "कहाँ जाना है?" },
  search: { en: "Search", te: "వెతకండి", hi: "खोजें" },
  surroundings: { en: "Nearby", te: "సమీపం", hi: "आस-पास" },
  tourist: { en: "Tourist", te: "పర్యాటక", hi: "पर्यटन" },
  food: { en: "Food", te: "ఆహారం", hi: "खाना" },
  medical: { en: "Medical", te: "వైద్యం", hi: "चिकित्सा" },
  atm: { en: "Bank", te: "బ్యాంక్", hi: "बैंक" },
  events: { en: "Events", te: "ఈవెంట్‌లు", hi: "इवेंट" },
  temples: { en: "Temples", te: "దేవాలయాలు", hi: "मंदिर" },
  quickDest: { en: "Quick Destinations", te: "త్వరిత గమ్యస్థానాలు", hi: "त्वरित गंतव्य" },
  sosTitle: { en: "Emergency SOS", te: "అత్యవసర SOS", hi: "आपातकालीन SOS" },
  sosHint: { en: "Tap to dispatch GPS to trusted contacts", te: "GPS పంపడానికి నొక్కండి", hi: "GPS भेजने के लिए दबाएँ" },
  sosSent: { en: "GPS + journey snapshot dispatched to your trusted contacts.", te: "GPS మరియు ప్రయాణ స్నాప్‌షాట్ మీ నమ్మకమైన పరిచయాలకు పంపబడింది.", hi: "GPS और यात्रा स्नैपशॉट आपके विश्वसनीय संपर्कों को भेजा गया।" },
  liveJourney: { en: "Share Live Journey", te: "లైవ్ ప్రయాణం షేర్", hi: "लाइव यात्रा साझा" },
  liveJourneyHint: { en: "Friends & family can follow your bus on a private link.", te: "మీ బస్సును స్నేహితులు ట్రాక్ చేయగలరు.", hi: "दोस्त आपकी बस को ट्रैक कर सकते हैं।" },
  linkCopiedToast: { en: "Live tracking link copied to clipboard", te: "లైవ్ ట్రాకింగ్ లింక్ కాపీ అయింది", hi: "लाइव ट्रैकिंग लिंक कॉपी हो गया" },
  copy: { en: "Copy link", te: "లింక్ కాపీ", hi: "लिंक कॉपी" },
  copied: { en: "Copied", te: "కాపీ", hi: "कॉपी" },
  womenSafety: { en: "Corridor Safety Feed", te: "కారిడార్ భద్రతా ఫీడ్", hi: "कॉरिडोर सुरक्षा फ़ीड" },
  aiTitle: { en: "AI Travel Copilot", te: "AI ప్రయాణ సహాయకుడు", hi: "AI यात्रा सहायक" },
  aiSubtitle: { en: "Powered by APSRTC live data", te: "APSRTC లైవ్ డేటాతో", hi: "APSRTC लाइव डेटा द्वारा" },
  aiPlaceholder: { en: "Ask anything about APSRTC buses…", te: "APSRTC బస్సుల గురించి అడగండి…", hi: "APSRTC बसों के बारे में पूछें…" },
  suggested: { en: "Try asking", te: "సూచనలు", hi: "सुझाव" },
  busArrives: { en: "Arrival", te: "రాక", hi: "आगमन" },
  platform: { en: "Platform", te: "ప్లాట్‌ఫారం", hi: "प्लेटफ़ॉर्म" },
  destinationStop: { en: "Final stop", te: "చివరి స్టాప్", hi: "अंतिम स्टॉप" },
  mapInit: { en: "Route plotted. Here's your best APSRTC option:", te: "మార్గం సిద్ధం. మీ ఉత్తమ APSRTC ఎంపిక:", hi: "मार्ग तैयार। आपका सर्वोत्तम APSRTC विकल्प:" },
  showRoutes: { en: "View Smart Routes", te: "స్మార్ట్ రూట్లు చూడండి", hi: "स्मार्ट रूट देखें" },
  expand: { en: "View timeline", te: "టైమ్‌లైన్", hi: "टाइमलाइन" },
  fleetSL: { en: "Super Luxury", te: "సూపర్ లగ్జరీ", hi: "सुपर लग्ज़री" },
  fleetPV: { en: "Palle Velugu Express", te: "పల్లె వెలుగు ఎక్స్‌ప్రెస్", hi: "पल्ले वेलुगु एक्सप्रेस" },
  fleetAC: { en: "Amaravati AC / Garuda", te: "అమరావతి AC / గరుడ", hi: "अमरावती AC / गरुड़" },
  greeting: { en: "Namaste! Where are we heading today?", te: "నమస్తే! ఈరోజు ఎక్కడికి?", hi: "नमस्ते! आज कहाँ जा रहे हैं?" },
} as const;

type DictKey = keyof typeof DICT;
const T = (lang: Lang, key: DictKey) => DICT[key][lang];

/* ============================================================
   AP-WIDE LOCATION GRAPH
   ============================================================ */
type City = {
  id: string; name: string; aliases: string[]; station: string;
  x: number; y: number; district: string;
  places: { tourist: string[]; food: string[]; medical: string[]; atm: string[]; events: string[]; temples: string[] };
  safety: string[];
};

const CITIES: City[] = [
  { id: "vja", name: "Vijayawada", aliases: ["vijayawada", "bzv", "bezawada", "pnbs"], station: "Pundit Nehru Bus Station (PNBS)", x: 42, y: 50, district: "NTR",
    places: {
      tourist: ["Kanaka Durga Temple View", "Prakasam Barrage", "Bhavani Island"],
      food: ["Babai Hotel (Andhra Meals)", "RR Durbar Biryani", "Minerva Coffee Shop"],
      medical: ["Government General Hospital", "Manipal Hospitals Vijayawada"],
      atm: ["SBI PNBS Branch", "Andhra Bank One Town"],
      events: ["Krishna Pushkaralu Drill", "Kanaka Durga Brahmotsavam"],
      temples: ["Kanaka Durga Devasthanam", "Hinkar Thirtha Jain Temple"],
    },
    safety: ["Well-lit Platform 4", "Police patrolling near Bay 7", "CCTV active at exit gate"] },
  { id: "tpt", name: "Tirupati", aliases: ["tirupati", "tirumala", "alipiri"], station: "Sri Venkateswara Central Bus Station", x: 55, y: 88, district: "Tirupati",
    places: {
      tourist: ["Sri Venkateswara Museum", "Silathoranam Rock", "Chandragiri Fort"],
      food: ["Maya Hotel (Pure Veg)", "Bhimas Deluxe", "Aaha Tiffins"],
      medical: ["SVIMS Hospital", "BIRRD Hospital"],
      atm: ["SBI Alipiri Branch", "Indian Bank Tirumala"],
      events: ["Brahmotsavam Procession", "Vaikunta Ekadasi Queue Drill"],
      temples: ["Sri Venkateswara Temple", "Govindaraja Swamy Temple", "Kapila Theertham"],
    },
    safety: ["Devasthanam police active", "Women help desk near Q-complex", "Free shuttle till 11 PM"] },
  { id: "vzg", name: "Visakhapatnam", aliases: ["vizag", "vsp", "visakhapatnam", "vskp"], station: "Dwaraka Bus Station (RTC Complex)", x: 78, y: 25, district: "Visakhapatnam",
    places: {
      tourist: ["RK Beach", "Kailasagiri", "Submarine Museum"],
      food: ["Sea Inn Beachside", "Dharani Restaurant", "Bay Of Bengal Cafe"],
      medical: ["KGH Hospital", "Apollo Health City"],
      atm: ["SBI RTC Complex", "Canara Bank Dwaraka Nagar"],
      events: ["Visakha Utsav", "Navy Day Air Show"],
      temples: ["Simhachalam Temple", "ISKCON Vizag"],
    },
    safety: ["Beach patrol till midnight", "Well-lit Dwaraka platform", "Pink auto stand active"] },
  { id: "skl", name: "Srikakulam", aliases: ["srikakulam", "skl", "ckl"], station: "Srikakulam RTC Complex", x: 88, y: 15, district: "Srikakulam",
    places: {
      tourist: ["Salihundam Buddhist Site", "Kalingapatnam Beach", "Telineelapuram Bird Sanctuary"],
      food: ["Hotel Maurya", "Sri Krishna Tiffins", "Konaseema Mess"],
      medical: ["RIMS Srikakulam", "Government District Hospital"],
      atm: ["SBI Main Branch", "Union Bank Town"],
      events: ["Srikakulam Utsavalu", "Arasavalli Ratha Yatra"],
      temples: ["Arasavalli Sun Temple", "Srikurmam Temple"],
    },
    safety: ["RTC night patrol", "Helpline kiosk active", "Women coach in 8841"] },
  { id: "gnt", name: "Guntur", aliases: ["guntur", "gnt"], station: "NTR Bus Stand Guntur", x: 40, y: 56, district: "Guntur",
    places: {
      tourist: ["Amaravati Stupa", "Undavalli Caves", "Kondaveedu Fort"],
      food: ["RR Hotel (Guntur Karam)", "Nellore Ruchulu", "Sangam Sweets"],
      medical: ["Government General Hospital Guntur", "Lalitha Super Speciality"],
      atm: ["Andhra Bank Brodipet", "SBI Arundelpet"],
      events: ["Mirchi Yard Festival", "Amaravati Heritage Walk"],
      temples: ["Kotappakonda", "Mangalagiri Narasimha Swamy"],
    },
    safety: ["Bus stand pink booth", "Bay 3 CCTV active", "Patrol from 5 AM"] },
  { id: "nlr", name: "Nellore", aliases: ["nellore", "nlr"], station: "Nellore RTC Complex", x: 50, y: 76, district: "Nellore",
    places: {
      tourist: ["Pulicat Lake", "Mypadu Beach", "Nelapattu Bird Sanctuary"],
      food: ["Nellore Ruchulu", "Sri Anjaneya Tiffins", "Hotel Bahar"],
      medical: ["ACSR Govt Hospital", "Narayana Medical College"],
      atm: ["SBI Trunk Road", "Andhra Bank Stonehousepet"],
      events: ["Rottela Panduga", "Mypadu Beach Fest"],
      temples: ["Ranganathaswamy Temple", "Jonnawada Kamakshi"],
    },
    safety: ["Late-night patrol active", "Well-lit RTC bays", "Help desk till 11 PM"] },
  { id: "krn", name: "Kurnool", aliases: ["kurnool", "krn"], station: "Kurnool Bus Station", x: 22, y: 60, district: "Kurnool",
    places: {
      tourist: ["Belum Caves", "Oravakallu Rock Garden", "Konda Reddy Fort"],
      food: ["Hotel Geetha", "Tunga Restaurant", "Sapthagiri Tiffins"],
      medical: ["Kurnool Government Hospital", "Viswabharathi Hospital"],
      atm: ["SBI Park Road", "Canara Bank Main"],
      events: ["Mahanandi Brahmotsavam", "Banaganapalle Mango Fest"],
      temples: ["Mahanandi Temple", "Yaganti Uma Maheswara"],
    },
    safety: ["RTC night marshals", "Women bay near platform 2", "Pink auto stand"] },
  { id: "kkd", name: "Kakinada", aliases: ["kakinada", "kkd"], station: "Kakinada Bus Complex", x: 62, y: 42, district: "Kakinada",
    places: {
      tourist: ["Hope Island", "Coringa Mangroves", "Uppada Beach"],
      food: ["Subbayya Gari Hotel", "Kakinada Kaja House", "Hotel Sarovar"],
      medical: ["GGH Kakinada", "Apollo Speciality"],
      atm: ["SBI Main Road", "Indian Bank Bhanugudi"],
      events: ["Sarpavaram Jatara", "Coringa Bird Festival"],
      temples: ["Sri Bhavanarayana Temple", "Pithapuram Kukkuteswara"],
    },
    safety: ["Coastal patrol active", "Bay 5 well-lit", "Women help desk 24/7"] },
];

const findCity = (q: string): City | null => {
  const s = q.trim().toLowerCase();
  if (!s) return null;
  return CITIES.find(c => c.name.toLowerCase() === s || c.aliases.some(a => s.includes(a) || a.includes(s))) || null;
};

/* ============================================================
   APP SHELL
   ============================================================ */
type Tab = "home" | "routes" | "safety" | "ai";

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [online, setOnline] = useState(true);
  const [lang, setLang] = useState<Lang>("en");
  const [from, setFrom] = useState<City>(CITIES[0]);
  const [to, setTo] = useState<City>(CITIES[1]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-200 via-slate-100 to-indigo-100/50 py-0 sm:py-6">
      <div
        className="relative mx-auto flex w-full max-w-md flex-col overflow-hidden border border-slate-200/80 bg-slate-50 shadow-2xl shadow-indigo-900/15 sm:rounded-[2.25rem] sm:border-[6px] sm:border-slate-900"
        style={{ height: "min(880px, 100vh)" }}
      >
        <GlobalHeader from={from} to={to} online={online} setOnline={setOnline} lang={lang} setLang={setLang} />

        <main className="flex-1 overflow-y-auto pb-24">
          <div key={tab} className="animate-fade-in">
            {tab === "home" && <HomeMap lang={lang} from={from} to={to} setFrom={setFrom} setTo={setTo} setTab={setTab} />}
            {tab === "routes" && <SmartRoutes lang={lang} from={from} to={to} />}
            {tab === "safety" && <Safety lang={lang} to={to} />}
            {tab === "ai" && <AIAssistant lang={lang} from={from} to={to} setFrom={setFrom} setTo={setTo} />}
          </div>
        </main>

        <BottomNav tab={tab} setTab={setTab} lang={lang} />
      </div>
    </div>
  );
}

/* ---------- Global Header ---------- */
function GlobalHeader({
  from, to, online, setOnline, lang, setLang,
}: { from: City; to: City; online: boolean; setOnline: (b: boolean) => void; lang: Lang; setLang: (l: Lang) => void }) {
  const activeIdx = LANGS.findIndex(l => l.id === lang);
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 px-3.5 pb-2.5 pt-3 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-600/30">
            <Bus className="h-5 w-5" strokeWidth={2.5} />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[14px] font-bold leading-tight tracking-tight text-slate-900">
              {T(lang, "appName")}
            </h1>
            <p className="truncate text-[9.5px] font-semibold uppercase tracking-wider text-slate-500">{T(lang, "govTag")}</p>
          </div>
        </div>
        <button
          onClick={() => setOnline(!online)}
          className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all duration-300 active:scale-95 ${
            online
              ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/30"
              : "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/30"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
          {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {online ? T(lang, "online") : T(lang, "offline")}
        </button>
      </div>

      {/* Route status strip */}
      <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-slate-200/70 bg-gradient-to-r from-slate-50 to-indigo-50/40 px-2.5 py-1.5">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-white">A</div>
        <p className="min-w-0 flex-1 truncate text-[10.5px] font-semibold text-slate-800">{from.station}</p>
        <ArrowRight className="h-3 w-3 shrink-0 text-indigo-600" />
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">B</div>
        <p className="min-w-0 max-w-[42%] truncate text-[10.5px] font-semibold text-slate-800">{to.station}</p>
      </div>

      {/* Sliding language pill */}
      <div className="mt-2.5 flex items-center gap-2">
        <Languages className="h-3.5 w-3.5 text-slate-400" />
        <div className="relative flex flex-1 items-center rounded-full border border-slate-200/80 bg-slate-100/80 p-0.5 shadow-inner">
          <div
            className="absolute top-0.5 bottom-0.5 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-md shadow-indigo-600/30 transition-all duration-300 ease-out"
            style={{ left: `calc(${(activeIdx * 100) / LANGS.length}% + 2px)`, width: `calc(${100 / LANGS.length}% - 4px)` }}
          />
          {LANGS.map(l => {
            const active = lang === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`relative z-10 flex-1 rounded-full py-1 text-[10.5px] font-bold transition-colors duration-300 ${
                  active ? "text-white" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </div>

      {!online && (
        <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-800 ring-1 ring-amber-200/70">
          {T(lang, "cached")}
        </p>
      )}
    </header>
  );
}

/* ---------- Bottom Nav ---------- */
function BottomNav({ tab, setTab, lang }: { tab: Tab; setTab: (t: Tab) => void; lang: Lang }) {
  const items: { id: Tab; label: string; icon: typeof MapIcon }[] = [
    { id: "home", label: T(lang, "discover"), icon: MapIcon },
    { id: "routes", label: T(lang, "routes"), icon: RouteIcon },
    { id: "safety", label: T(lang, "safety"), icon: Shield },
    { id: "ai", label: T(lang, "assistant"), icon: Bot },
  ];
  return (
    <nav className="absolute bottom-0 left-0 right-0 z-40 border-t border-slate-200/70 bg-white/90 px-2 pb-3 pt-1.5 backdrop-blur-xl">
      <div className="grid grid-cols-4 gap-1">
        {items.map((it) => {
          const active = tab === it.id;
          const Icon = it.icon;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className={`group flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[9.5px] font-semibold leading-tight transition-all duration-300 active:scale-95 ${
                active ? "text-indigo-700" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <div
                className={`flex h-8 w-12 items-center justify-center rounded-2xl transition-all duration-300 ${
                  active ? "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-600/30" : "text-slate-500"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={`truncate ${active ? "font-bold text-indigo-700" : ""}`}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ============================================================
   HOME / MAP
   ============================================================ */
function HomeMap({
  lang, from, to, setFrom, setTo, setTab,
}: { lang: Lang; from: City; to: City; setFrom: (c: City) => void; setTo: (c: City) => void; setTab: (t: Tab) => void }) {
  const [fromQ, setFromQ] = useState(from.name);
  const [toQ, setToQ] = useState(to.name);
  const [sheetOpen, setSheetOpen] = useState(true);

  useEffect(() => { setFromQ(from.name); setToQ(to.name); }, [from.name, to.name]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const f = findCity(fromQ) ?? from;
    const t = findCity(toQ) ?? to;
    setFrom(f); setTo(t);
    setFromQ(f.name); setToQ(t.name);
    setSheetOpen(true);
  };

  return (
    <div className="flex flex-col gap-3 px-3 py-3">
      {/* Search */}
      <form onSubmit={submit} className="space-y-1.5 rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2 rounded-xl bg-slate-100/80 px-2.5 py-2 ring-1 ring-slate-200/60 focus-within:ring-indigo-400/60 transition">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-white shadow-sm shadow-emerald-500/40">A</div>
          <input value={fromQ} onChange={e => setFromQ(e.target.value)} placeholder={T(lang, "from")}
            className="w-full bg-transparent text-[12.5px] font-semibold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400" />
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-slate-100/80 px-2.5 py-2 ring-1 ring-slate-200/60 focus-within:ring-indigo-400/60 transition">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-sm shadow-rose-500/40">B</div>
          <input value={toQ} onChange={e => setToQ(e.target.value)} placeholder={T(lang, "whereTo")}
            className="w-full bg-transparent text-[12.5px] font-semibold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400" />
          <button type="submit" className="rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 px-2 py-1 text-white shadow-sm shadow-indigo-600/30 transition-all duration-300 active:scale-95">
            <Search className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>
      </form>

      {/* Quick destinations */}
      <div>
        <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{T(lang, "quickDest")}</p>
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 -mx-3 px-3 scrollbar-none">
          {CITIES.map(c => {
            const active = c.id === to.id;
            return (
              <button key={c.id}
                onClick={() => { setTo(c); setToQ(c.name); setSheetOpen(true); }}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[10.5px] font-bold transition-all duration-300 active:scale-95 ${
                  active
                    ? "border-indigo-600 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-600/30"
                    : "border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 hover:border-indigo-300"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      <MapMock from={from} to={to} />

      <button onClick={() => setTab("routes")}
        className="flex items-center justify-between rounded-2xl border border-indigo-200/70 bg-gradient-to-r from-indigo-50 to-indigo-100/50 px-3.5 py-2.5 text-[12px] font-bold text-indigo-700 shadow-sm transition-all duration-300 active:scale-[0.98] hover:from-indigo-100 hover:to-indigo-100">
        <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> {T(lang, "showRoutes")}</span>
        <ChevronRight className="h-4 w-4" />
      </button>

      {sheetOpen && <PlacesSheet lang={lang} city={to} onClose={() => setSheetOpen(false)} />}
    </div>
  );
}

function MapMock({ from, to }: { from: City; to: City }) {
  // smooth curved bezier with control point offset
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.max(Math.hypot(dx, dy), 1);
  // perpendicular offset for curve
  const cx = midX + (-dy / len) * 12;
  const cy = midY + (dx / len) * 12;
  const path = `M ${from.x} ${from.y} Q ${cx} ${cy}, ${to.x} ${to.y}`;

  return (
    <div className="relative h-52 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 shadow-sm">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M 6 0 L 0 0 0 6" fill="none" stroke="oklch(0.92 0.01 250)" strokeWidth="0.2" />
          </pattern>
          <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.65 0.18 150)" />
            <stop offset="55%" stopColor="oklch(0.55 0.22 270)" />
            <stop offset="100%" stopColor="oklch(0.62 0.22 20)" />
          </linearGradient>
          <radialGradient id="halo" cx="50%" cy="50%">
            <stop offset="0%" stopColor="oklch(0.55 0.22 270 / 0.25)" />
            <stop offset="100%" stopColor="oklch(0.55 0.22 270 / 0)" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        <circle cx={midX} cy={midY} r="22" fill="url(#halo)" />
        {/* glow path */}
        <path d={path} fill="none" stroke="url(#pathGrad)" strokeWidth="2.4" strokeLinecap="round" opacity="0.25" />
        {/* main dotted path */}
        <path d={path} fill="none" stroke="url(#pathGrad)" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1.6 1.4">
          <animate attributeName="stroke-dashoffset" values="0;-12" dur="6s" repeatCount="indefinite" />
        </path>
        {/* nodes */}
        <g>
          <circle cx={from.x} cy={from.y} r="3.4" fill="white" />
          <circle cx={from.x} cy={from.y} r="2.2" fill="oklch(0.65 0.18 150)" />
          <circle cx={to.x} cy={to.y} r="3.4" fill="white" />
          <circle cx={to.x} cy={to.y} r="2.2" fill="oklch(0.62 0.22 20)" />
        </g>
      </svg>

      {/* Floating labels */}
      <div className="absolute left-2.5 top-2.5 max-w-[55%] rounded-xl border border-emerald-200/70 bg-white/90 px-2 py-1 shadow-sm backdrop-blur">
        <p className="text-[8.5px] font-bold uppercase tracking-wider text-emerald-600">From · A</p>
        <p className="truncate text-[10.5px] font-bold text-slate-800">{from.name}</p>
      </div>
      <div className="absolute bottom-2.5 right-2.5 max-w-[55%] rounded-xl border border-rose-200/70 bg-white/90 px-2 py-1 text-right shadow-sm backdrop-blur">
        <p className="text-[8.5px] font-bold uppercase tracking-wider text-rose-600">To · B</p>
        <p className="truncate text-[10.5px] font-bold text-slate-800">{to.name}</p>
      </div>
      <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 px-2 py-1 text-[9px] font-bold text-white shadow-md shadow-indigo-600/40">
        <Navigation className="h-2.5 w-2.5" /> APSRTC LIVE
      </div>
    </div>
  );
}

function PlacesSheet({ lang, city, onClose }: { lang: Lang; city: City; onClose: () => void }) {
  type Cat = "tourist" | "food" | "medical" | "atm" | "events" | "temples";
  const [cat, setCat] = useState<Cat>("tourist");
  const cats: { id: Cat; label: string; icon: typeof MapPin }[] = [
    { id: "tourist", label: T(lang, "tourist"), icon: Landmark },
    { id: "food", label: T(lang, "food"), icon: Utensils },
    { id: "temples", label: T(lang, "temples"), icon: Sparkles },
    { id: "medical", label: T(lang, "medical"), icon: Hospital },
    { id: "atm", label: T(lang, "atm"), icon: Banknote },
    { id: "events", label: T(lang, "events"), icon: PartyPopper },
  ];
  const items = city.places[cat];

  return (
    <div className="animate-fade-in rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
            <MapPin className="h-3.5 w-3.5" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-[12px] font-bold leading-none text-slate-900">{T(lang, "surroundings")}</h3>
            <p className="mt-0.5 text-[9.5px] font-semibold text-slate-500">{city.name} · {city.district}</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:scale-90">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mb-2 flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {cats.map(c => {
          const active = cat === c.id;
          const I = c.icon;
          return (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all duration-300 active:scale-95 ${
                active ? "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}>
              <I className="h-3 w-3" /> {c.label}
            </button>
          );
        })}
      </div>
      <ul className="space-y-1.5">
        {items.map((p, i) => (
          <li key={i} className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-2.5 py-2 text-[11.5px] font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50/40">
            <span className="truncate">{p}</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-600" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================
   SMART ROUTES
   ============================================================ */
function SmartRoutes({ lang, from, to }: { lang: Lang; from: City; to: City }) {
  const junctions = useMemo(() => {
    const others = CITIES.filter(c => c.id !== from.id && c.id !== to.id);
    const between = others
      .filter(c => Math.min(from.x, to.x) <= c.x + 8 && c.x - 8 <= Math.max(from.x, to.x))
      .sort((a, b) => Math.hypot(a.x - from.x, a.y - from.y) - Math.hypot(b.x - from.x, b.y - from.y))
      .slice(0, 3);
    return [from.station, ...between.map(c => `${c.name} Junction`), to.station];
  }, [from, to]);

  const changeIdx = Math.max(1, Math.floor(junctions.length / 2));
  const seed = (from.id + to.id).split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const busNo = (offset: number) => 1000 + ((seed * (offset + 7)) % 8999);

  // tiered fleet per spec
  const opts = [
    { kind: "ac", label: T(lang, "fleetAC"), tag: T(lang, "leastCrowd"),
      bus: `APSRTC ${busNo(1)}`, time: "4h 35m", price: 720, crowd: "low" as const, tier: "ac" as const,
      perks: ["Reclining seats", "Charging port", "GPS tracked"] },
    { kind: "sl", label: T(lang, "fleetSL"), tag: T(lang, "fastest"),
      bus: `APSRTC ${busNo(2)}`, time: "5h 05m", price: 480, crowd: "medium" as const, tier: "sl" as const,
      perks: ["2x2 seating", "Express stops"] },
    { kind: "pv", label: T(lang, "fleetPV"), tag: T(lang, "cheapest"),
      bus: `APSRTC ${busNo(3)}`, time: "6h 10m", price: 285, crowd: "high" as const, tier: "pv" as const,
      perks: ["All village stops", "Budget fare"] },
  ];
  const [open, setOpen] = useState<string>("ac");

  return (
    <div className="space-y-3 px-3 py-3">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-3.5 text-white shadow-lg shadow-indigo-700/30">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-indigo-400/20 blur-2xl" />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">{T(lang, "routes")} · APSRTC</p>
          <p className="mt-1 text-[15px] font-bold leading-tight">{from.name} → {to.name}</p>
          <p className="mt-0.5 text-[10.5px] font-medium text-indigo-200/90">{from.station} → {to.station}</p>
        </div>
      </div>

      {opts.map(o => (
        <RouteCard key={o.kind} lang={lang} opt={o} open={open === o.kind} onToggle={() => setOpen(open === o.kind ? "" : o.kind)}
          junctions={junctions} changeIdx={changeIdx} />
      ))}
    </div>
  );
}

type RouteOpt = {
  kind: string; label: string; tag: string; bus: string; time: string; price: number;
  crowd: "low" | "medium" | "high"; tier: "ac" | "sl" | "pv"; perks: string[];
};

function RouteCard({ lang, opt, open, onToggle, junctions, changeIdx }: {
  lang: Lang; open: boolean; onToggle: () => void; junctions: string[]; changeIdx: number; opt: RouteOpt;
}) {
  const crowdMap = {
    low: { txt: T(lang, "crowdLow"), dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 ring-emerald-200/70" },
    medium: { txt: T(lang, "crowdMed"), dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700 ring-amber-200/70" },
    high: { txt: T(lang, "crowdHigh"), dot: "bg-rose-500", chip: "bg-rose-50 text-rose-700 ring-rose-200/70" },
  }[opt.crowd];

  const tierMap = {
    ac: { Icon: Crown, ring: "ring-emerald-200/60", iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-700", tagChip: "bg-emerald-600 text-white" },
    sl: { Icon: Zap, ring: "ring-amber-200/60", iconBg: "bg-gradient-to-br from-amber-500 to-orange-600", tagChip: "bg-amber-500 text-white" },
    pv: { Icon: Wallet, ring: "ring-rose-200/60", iconBg: "bg-gradient-to-br from-rose-500 to-rose-700", tagChip: "bg-rose-600 text-white" },
  }[opt.tier];
  const TierIcon = tierMap.Icon;

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ${tierMap.ring} transition-all duration-300 ${open ? "shadow-md" : ""}`}>
      <button onClick={onToggle} className="flex w-full items-start gap-3 p-3 text-left transition active:scale-[0.99]">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tierMap.iconBg} text-white shadow-sm`}>
          <TierIcon className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold ${tierMap.tagChip}`}>{opt.tag}</span>
            <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold ring-1 ${crowdMap.chip}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${crowdMap.dot}`} /> {crowdMap.txt}
            </span>
          </div>
          <p className="mt-1.5 truncate text-[12.5px] font-bold text-slate-900">{opt.bus}</p>
          <p className="truncate text-[10.5px] font-semibold text-slate-500">{opt.label}</p>
          <div className="mt-1.5 flex items-center gap-3 text-[11px] font-bold text-slate-700">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-indigo-500" /> {opt.time}</span>
            <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3 text-emerald-600" />{opt.price}</span>
            <span className="ml-auto text-[9.5px] font-semibold text-slate-400">{open ? "—" : T(lang, "expand")}</span>
          </div>
        </div>
        <ChevronRight className={`mt-2 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${open ? "rotate-90 text-indigo-600" : ""}`} />
      </button>

      <div className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 bg-slate-50/60 px-3 py-3">
            <div className="mb-2 flex flex-wrap gap-1">
              {opt.perks.map((p, i) => (
                <span key={i} className="rounded-full bg-white px-2 py-0.5 text-[9.5px] font-semibold text-slate-600 ring-1 ring-slate-200">{p}</span>
              ))}
            </div>
            <ol className="space-y-0">
              {junctions.map((j, i) => {
                const isStart = i === 0;
                const isEnd = i === junctions.length - 1;
                const isChange = i === changeIdx && !isStart && !isEnd;
                return (
                  <li key={i} className="relative flex gap-2.5">
                    <div className="flex flex-col items-center">
                      <div className={`relative z-10 h-3.5 w-3.5 rounded-full border-[2.5px] bg-white shadow-sm ${
                        isEnd ? "border-rose-500" : isStart ? "border-emerald-500" : isChange ? "border-amber-500" : "border-indigo-400"
                      }`}>
                        {(isStart || isEnd) && <div className={`absolute inset-0.5 rounded-full ${isEnd ? "bg-rose-500" : "bg-emerald-500"}`} />}
                      </div>
                      {!isEnd && <div className="w-0.5 flex-1 bg-gradient-to-b from-indigo-300 to-indigo-200" style={{ minHeight: 22 }} />}
                    </div>
                    <div className="flex-1 pb-3 pt-0">
                      <p className="text-[11.5px] font-bold leading-tight text-slate-800">{j}</p>
                      {isEnd && <span className="mt-1 inline-block rounded-md bg-rose-100 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-rose-700">{T(lang, "getDown")}</span>}
                      {isChange && <span className="mt-1 inline-block rounded-md bg-amber-100 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-amber-700">{T(lang, "changeBus")}</span>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SAFETY HUB
   ============================================================ */
function Safety({ lang, to }: { lang: Lang; to: City }) {
  const [sosState, setSosState] = useState<"idle" | "loading" | "sent">("idle");
  const [liveShared, setLiveShared] = useState(false);
  const link = "naatransit.ap.gov.in/live/track-391";

  const triggerSOS = () => {
    if (sosState !== "idle") return;
    setSosState("loading");
    setTimeout(() => setSosState("sent"), 1400);
  };

  const shareLive = () => {
    const next = !liveShared;
    setLiveShared(next);
    if (next) {
      try { navigator.clipboard?.writeText(`https://${link}`); } catch {}
      toast.success(T(lang, "linkCopiedToast"), {
        description: link,
        icon: <Share2 className="h-4 w-4 text-indigo-600" />,
      });
    }
  };

  return (
    <div className="space-y-3 px-3 py-3">
      {/* SOS card */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-200/70 bg-gradient-to-br from-rose-50 via-white to-rose-100/50 p-5 text-center shadow-sm">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-rose-400/20 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-rose-300/20 blur-3xl" />
        <div className="relative">
          <div className="relative mx-auto h-32 w-32">
            {sosState === "idle" && (
              <>
                <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/30" />
                <span className="absolute inset-2 animate-pulse rounded-full bg-rose-500/20" />
              </>
            )}
            <button
              onClick={triggerSOS}
              disabled={sosState !== "idle"}
              className={`relative z-10 flex h-32 w-32 items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 active:scale-95 ${
                sosState === "idle"
                  ? "bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-600/40 hover:from-rose-600 hover:to-rose-800"
                  : sosState === "loading"
                  ? "bg-gradient-to-br from-rose-400 to-rose-600"
                  : "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-600/40"
              }`}
            >
              {sosState === "loading" ? <Loader2 className="h-12 w-12 animate-spin" strokeWidth={2.5} /> :
               sosState === "sent" ? <Check className="h-12 w-12" strokeWidth={3} /> :
               <ShieldAlert className="h-12 w-12" strokeWidth={2.5} />}
            </button>
          </div>
          <p className="mt-3 text-[14px] font-bold tracking-tight text-rose-700">{T(lang, "sosTitle")}</p>
          <p className="mt-0.5 text-[10.5px] font-medium text-slate-500">{T(lang, "sosHint")}</p>
          {sosState === "sent" && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200/70 bg-emerald-50 px-3 py-2 text-left text-[10.5px] font-semibold text-emerald-800 animate-fade-in">
              <PhoneCall className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {T(lang, "sosSent")}
            </div>
          )}
        </div>
      </div>

      {/* Live Journey */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Share2 className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-slate-900">{T(lang, "liveJourney")}</p>
              <p className="truncate text-[10px] font-medium text-slate-500">{T(lang, "liveJourneyHint")}</p>
            </div>
          </div>
          <button
            onClick={shareLive}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${liveShared ? "bg-gradient-to-r from-indigo-500 to-indigo-700" : "bg-slate-200"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${liveShared ? "left-[1.375rem]" : "left-0.5"}`} />
          </button>
        </div>
        {liveShared && (
          <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-indigo-200/70 bg-indigo-50/60 px-2.5 py-2 animate-fade-in">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600">Live link</p>
              <p className="truncate text-[11px] font-bold text-indigo-900">{link}</p>
            </div>
            <button
              onClick={() => { try { navigator.clipboard?.writeText(`https://${link}`); } catch {}; toast.success(T(lang, "copied")); }}
              className="flex items-center gap-1 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-sm transition active:scale-95"
            >
              <Copy className="h-3 w-3" /> {T(lang, "copy")}
            </button>
          </div>
        )}
      </div>

      {/* Women safety feed */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <ShieldCheck className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[12px] font-bold leading-none text-slate-900">{T(lang, "womenSafety")}</p>
            <p className="mt-0.5 text-[9.5px] font-semibold text-slate-500">{to.name} · {to.district}</p>
          </div>
        </div>
        <ul className="space-y-1.5">
          {to.safety.map((s, i) => (
            <li key={i} className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-2.5 py-2">
              <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <p className="text-[11px] font-semibold text-emerald-900">{s}</p>
            </li>
          ))}
          <li className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50/60 px-2.5 py-2">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
            <p className="text-[11px] font-semibold text-amber-900">Avoid unlit alley behind Bay 9 after 10 PM</p>
          </li>
        </ul>
      </div>
    </div>
  );
}

/* ============================================================
   AI ASSISTANT
   ============================================================ */
type Msg = { who: "user" | "bot"; text: string; rich?: { bus: string; eta: string; platform: string; stop: string } };

function AIAssistant({ lang, from, to, setFrom, setTo }: { lang: Lang; from: City; to: City; setFrom: (c: City) => void; setTo: (c: City) => void }) {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { who: "bot", text: T(lang, "greeting") },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const suggestions = [
    lang === "te" ? `${from.name} నుండి ${to.name}కి?` : lang === "hi" ? `${from.name} से ${to.name}?` : `${from.name} → ${to.name}?`,
    lang === "te" ? "విజయవాడ → తిరుపతి" : lang === "hi" ? "विजयवाड़ा → तिरुपति" : "Vijayawada → Tirupati",
    lang === "te" ? "విశాఖ → కాకినాడ" : lang === "hi" ? "विशाखा → काकीनाडा" : "Vizag → Kakinada fastest",
  ];

  const respond = (q: string) => {
    const lower = q.toLowerCase();
    const matched = CITIES.filter(c => c.aliases.some(a => lower.includes(a)) || lower.includes(c.name.toLowerCase()));
    let f = from, t = to;
    if (matched.length >= 2) { f = matched[0]; t = matched[1]; setFrom(f); setTo(t); }
    else if (matched.length === 1) { t = matched[0]; setTo(t); }

    const seed = (f.id + t.id).split("").reduce((s, c) => s + c.charCodeAt(0), 0);
    const bus = `APSRTC ${1000 + (seed * 13) % 8999} — ${T(lang, "fleetAC")}`;
    const eta = `${8 + (seed % 12)} ${lang === "te" ? "నిమి" : lang === "hi" ? "मिनट" : "mins"}`;
    const platform = `${(seed % 9) + 1}`;
    const stop = t.station;
    return { bus, eta, platform, stop };
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    const rich = respond(text);
    setMsgs(m => [...m, { who: "user", text }, { who: "bot", text: T(lang, "mapInit"), rich }]);
    setInput("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-slate-200/70 bg-white/80 px-3 py-2.5 backdrop-blur-xl">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-600/30">
          <Bot className="h-4.5 w-4.5" strokeWidth={2.5} />
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
        </div>
        <div className="min-w-0">
          <p className="text-[12.5px] font-bold leading-tight text-slate-900">{T(lang, "aiTitle")}</p>
          <p className="text-[9.5px] font-semibold text-emerald-600">● {T(lang, "aiSubtitle")}</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto bg-gradient-to-b from-slate-50/50 to-white px-3 py-3">
        {msgs.map((m, i) =>
          m.who === "user" ? (
            <div key={i} className="flex justify-end animate-fade-in">
              <div className="max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-br from-indigo-500 to-indigo-700 px-3 py-2 text-[12px] font-semibold text-white shadow-sm shadow-indigo-600/20">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex gap-1.5 animate-fade-in">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-sm">
                <Bot className="h-3.5 w-3.5" strokeWidth={2.5} />
              </div>
              <div className="max-w-[85%] space-y-1.5">
                <div className="rounded-2xl rounded-tl-md border border-slate-200/70 bg-white px-3 py-2 text-[12px] font-medium text-slate-700 shadow-sm">
                  {m.text}
                </div>
                {m.rich && <RichBotReply lang={lang} {...m.rich} />}
              </div>
            </div>
          )
        )}
      </div>

      {/* Suggestions + composer */}
      <div className="border-t border-slate-200/70 bg-white/90 px-3 pb-3 pt-2 backdrop-blur-xl">
        <p className="mb-1.5 px-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-500">{T(lang, "suggested")}</p>
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5 -mx-3 px-3 scrollbar-none">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => send(s)}
              className="flex shrink-0 items-center gap-1 rounded-full border border-indigo-200/70 bg-gradient-to-br from-indigo-50 to-white px-2.5 py-1 text-[10.5px] font-bold text-indigo-700 shadow-sm transition-all duration-300 active:scale-95 hover:from-indigo-100">
              <Lightbulb className="h-3 w-3" /> {s}
            </button>
          ))}
        </div>
        <form onSubmit={e => { e.preventDefault(); send(input); }}
          className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-200/60 transition">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder={T(lang, "aiPlaceholder")}
            className="flex-1 bg-transparent text-[12px] font-medium text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400" />
          <button type="submit" className="rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 p-1.5 text-white shadow-sm shadow-indigo-600/30 transition active:scale-90">
            <Send className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}

function RichBotReply({ lang, bus, eta, platform, stop }: { lang: Lang; bus: string; eta: string; platform: string; stop: string }) {
  const rows = [
    { icon: Bus, label: bus, k: "indigo" as const },
    { icon: Clock, label: `${T(lang, "busArrives")}: ${eta}`, k: "emerald" as const },
    { icon: MapPin, label: `${T(lang, "platform")}: ${platform}`, k: "amber" as const },
    { icon: ArrowRight, label: `${T(lang, "destinationStop")}: ${stop}`, k: "rose" as const },
  ];
  const colorMap = {
    indigo: { bg: "bg-indigo-50/70", text: "text-indigo-800", icon: "bg-indigo-500 text-white" },
    emerald: { bg: "bg-emerald-50/70", text: "text-emerald-800", icon: "bg-emerald-500 text-white" },
    amber: { bg: "bg-amber-50/70", text: "text-amber-800", icon: "bg-amber-500 text-white" },
    rose: { bg: "bg-rose-50/70", text: "text-rose-800", icon: "bg-rose-500 text-white" },
  };
  return (
    <div className="space-y-1.5 rounded-2xl rounded-tl-md border border-slate-200/70 bg-white p-2 shadow-sm">
      {rows.map((r, i) => {
        const I = r.icon;
        const c = colorMap[r.k];
        return (
          <div key={i} className={`flex items-center gap-2 rounded-xl px-2 py-1.5 ${c.bg}`}>
            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${c.icon}`}>
              <I className="h-3 w-3" strokeWidth={2.5} />
            </div>
            <p className={`text-[11px] font-bold ${c.text}`}>{r.label}</p>
          </div>
        );
      })}
    </div>
  );
}
