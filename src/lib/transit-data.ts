export type City = {
  id: string;
  name: string;
  aliases: string[];
  station: string;
  lat: number;
  lon: number;
  district: string;
  source: string;
  verifiedAt: string;
};

export const CITIES: City[] = [
  {
    id: "vja",
    name: "Vijayawada",
    aliases: ["vijayawada", "bzv", "bezawada", "pnbs"],
    station: "Pandit Nehru Bus Station",
    lat: 16.5087763,
    lon: 80.6157130,
    district: "NTR",
    source: "osm",
    verifiedAt: "2026-07-02",
  },
  {
    id: "tpt",
    name: "Tirupati",
    aliases: ["tirupati", "tirumala", "alipiri"],
    station: "APSRTC Bus Station, STV Nagar",
    lat: 13.6294117,
    lon: 79.4261708,
    district: "Tirupati",
    source: "osm",
    verifiedAt: "2026-07-02",
  },
  {
    id: "vzg",
    name: "Visakhapatnam",
    aliases: ["vizag", "vsp", "visakhapatnam", "vskp"],
    station: "APSRTC Dwaraka Bus Station",
    lat: 17.7238639,
    lon: 83.3068879,
    district: "Visakhapatnam",
    source: "osm",
    verifiedAt: "2026-07-02",
  },
  {
    id: "gnt",
    name: "Guntur",
    aliases: ["guntur", "gnt"],
    station: "NTR Bus Stand Guntur",
    lat: 16.2960394,
    lon: 80.4565729,
    district: "Guntur",
    source: "osm",
    verifiedAt: "2026-07-02",
  },
  {
    id: "nlr",
    name: "Nellore",
    aliases: ["nellore", "nlr"],
    station: "APSRTC P.S.R Bus Station",
    lat: 14.4570626,
    lon: 79.9896024,
    district: "Nellore",
    source: "osm",
    verifiedAt: "2026-07-02",
  },
  {
    id: "krn",
    name: "Kurnool",
    aliases: ["kurnool", "krn"],
    station: "APSRTC Kurnool Bus Station",
    lat: 15.8240007,
    lon: 78.0278284,
    district: "Kurnool",
    source: "osm",
    verifiedAt: "2026-07-02",
  },
  {
    id: "kkd",
    name: "Kakinada",
    aliases: ["kakinada", "kkd"],
    station: "APSRTC Kakinada Bus Station",
    lat: 16.9657252,
    lon: 82.2394027,
    district: "Kakinada",
    source: "osm",
    verifiedAt: "2026-07-02",
  },
  {
    id: "skl",
    name: "Srikakulam",
    aliases: ["srikakulam", "skl", "ckl"],
    station: "APSRTC Srikakulam Bus Station",
    lat: 18.3092485,
    lon: 83.8932628,
    district: "Srikakulam",
    source: "osm",
    verifiedAt: "2026-07-02",
  },
  {
    id: "elu",
    name: "Eluru",
    aliases: ["eluru"],
    station: "APSRTC New Bus Station Eluru",
    lat: 16.7075172,
    lon: 81.0900178,
    district: "West Godavari",
    source: "osm",
    verifiedAt: "2026-07-02",
  },
  {
    id: "raj",
    name: "Rajahmundry",
    aliases: ["rajahmundry", "rajamahendravaram"],
    station: "APSRTC Rajamahendravaram Bus Station",
    lat: 17.0012369,
    lon: 81.7897446,
    district: "East Godavari",
    source: "osm",
    verifiedAt: "2026-07-02",
  },
  {
    id: "kdp",
    name: "Kadapa",
    aliases: ["kadapa", "cuddapah"],
    station: "APSRTC Kadapa Bus Station",
    lat: 14.4646919,
    lon: 78.8313184,
    district: "YSR Kadapa",
    source: "osm",
    verifiedAt: "2026-07-02",
  },
  {
    id: "ant",
    name: "Anantapur",
    aliases: ["anantapur"],
    station: "APSRTC Anantapur Bus Station",
    lat: 14.6853003,
    lon: 77.5999633,
    district: "Anantapur",
    source: "osm",
    verifiedAt: "2026-07-02",
  },
  {
    id: "ong",
    name: "Ongole",
    aliases: ["ongole"],
    station: "APSRTC Ongole Bus Station",
    lat: 15.5112042,
    lon: 80.0418439,
    district: "Prakasam",
    source: "osm",
    verifiedAt: "2026-07-02",
  },
  {
    id: "vzm",
    name: "Vizianagaram",
    aliases: ["vizianagaram"],
    station: "APSRTC Vizianagaram Bus Station",
    lat: 18.1084074,
    lon: 83.3984074,
    district: "Vizianagaram",
    source: "osm",
    verifiedAt: "2026-07-02",
  },
  {
    id: "ctt",
    name: "Chittoor",
    aliases: ["chittoor"],
    station: "APSRTC Chittoor Bus Station",
    lat: 13.2194990,
    lon: 79.1053120,
    district: "Chittoor",
    source: "osm",
    verifiedAt: "2026-07-02",
  },
  {
    id: "ndy",
    name: "Nandyal",
    aliases: ["nandyal"],
    station: "APSRTC Nandyal Bus Station",
    lat: 15.4903444,
    lon: 78.4794381,
    district: "Nandyal",
    source: "osm",
    verifiedAt: "2026-07-02",
  },
];

export const findCity = (query: string): City | null => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;
  return CITIES.find((city) =>
    city.name.toLowerCase() === normalized
    || city.aliases.some((alias) => alias === normalized || normalized.includes(alias) || alias.includes(normalized)),
  ) ?? null;
};

export type NearbyCategory = "tourist" | "food" | "medical" | "atm" | "temples" | "events";

export type RouteStatic = {
  id: string;
  originId: string;
  destinationId: string;
  name: string;
  distanceKm: number;
  duration: string;
  source: string;
  verifiedAt: string;
};

export const ROUTES: RouteStatic[] = [
  // Vijayawada routes
  {
    id: "vja-vzg-001",
    originId: "vja",
    destinationId: "vzg",
    name: "VJA-VZG Express",
    distanceKm: 350,
    duration: "6h 15m",
    source: "apsrtc-schedule",
    verifiedAt: "2026-06-28",
  },
  {
    id: "vja-gnt-001",
    originId: "vja",
    destinationId: "gnt",
    name: "VJA-GNT Local",
    distanceKm: 65,
    duration: "1h 45m",
    source: "apsrtc-schedule",
    verifiedAt: "2026-06-28",
  },
  {
    id: "vja-tpt-001",
    originId: "vja",
    destinationId: "tpt",
    name: "VJA-TPT Deluxe",
    distanceKm: 410,
    duration: "7h 30m",
    source: "apsrtc-schedule",
    verifiedAt: "2026-06-28",
  },
  {
    id: "vja-raj-001",
    originId: "vja",
    destinationId: "raj",
    name: "VJA-RAJ City Link",
    distanceKm: 290,
    duration: "5h 20m",
    source: "apsrtc-schedule",
    verifiedAt: "2026-06-28",
  },

  // Visakhapatnam routes
  {
    id: "vzg-kkd-001",
    originId: "vzg",
    destinationId: "kkd",
    name: "VSP-KKD Express",
    distanceKm: 140,
    duration: "3h 00m",
    source: "apsrtc-schedule",
    verifiedAt: "2026-06-28",
  },
  {
    id: "vzg-skl-001",
    originId: "vzg",
    destinationId: "skl",
    name: "VSP-SKL Local",
    distanceKm: 110,
    duration: "2h 45m",
    source: "apsrtc-schedule",
    verifiedAt: "2026-06-28",
  },
  {
    id: "vzg-raj-001",
    originId: "vzg",
    destinationId: "raj",
    name: "VSP-RAJ Shuttle",
    distanceKm: 180,
    duration: "3h 30m",
    source: "apsrtc-schedule",
    verifiedAt: "2026-06-28",
  },

  // Guntur routes
  {
    id: "gnt-nlr-001",
    originId: "gnt",
    destinationId: "nlr",
    name: "GNT-NLR Express",
    distanceKm: 185,
    duration: "3h 45m",
    source: "apsrtc-schedule",
    verifiedAt: "2026-06-28",
  },
  {
    id: "gnt-ong-001",
    originId: "gnt",
    destinationId: "ong",
    name: "GNT-ONG Local",
    distanceKm: 95,
    duration: "2h 15m",
    source: "apsrtc-schedule",
    verifiedAt: "2026-06-28",
  },

  // Tirupati routes
  {
    id: "tpt-nlr-001",
    originId: "tpt",
    destinationId: "nlr",
    name: "TPT-NLR Express",
    distanceKm: 90,
    duration: "2h 00m",
    source: "apsrtc-schedule",
    verifiedAt: "2026-06-28",
  },
  {
    id: "tpt-ctt-001",
    originId: "tpt",
    destinationId: "ctt",
    name: "TPT-CTT Local",
    distanceKm: 85,
    duration: "2h 15m",
    source: "apsrtc-schedule",
    verifiedAt: "2026-06-28",
  },
  {
    id: "tpt-kdp-001",
    originId: "tpt",
    destinationId: "kdp",
    name: "TPT-KDP Express",
    distanceKm: 140,
    duration: "3h 00m",
    source: "apsrtc-schedule",
    verifiedAt: "2026-06-28",
  },

  // Kakinada routes
  {
    id: "kkd-raj-001",
    originId: "kkd",
    destinationId: "raj",
    name: "KKD-RAJ Local",
    distanceKm: 60,
    duration: "1h 30m",
    source: "apsrtc-schedule",
    verifiedAt: "2026-06-28",
  },
  {
    id: "kkd-elu-001",
    originId: "kkd",
    destinationId: "elu",
    name: "KKD-ELU Express",
    distanceKm: 225,
    duration: "4h 30m",
    source: "apsrtc-schedule",
    verifiedAt: "2026-06-28",
  },

  // Nellore routes
  {
    id: "nlr-kdp-001",
    originId: "nlr",
    destinationId: "kdp",
    name: "NLR-KDP Local",
    distanceKm: 175,
    duration: "3h 45m",
    source: "apsrtc-schedule",
    verifiedAt: "2026-06-28",
  },
  {
    id: "nlr-ctt-001",
    originId: "nlr",
    destinationId: "ctt",
    name: "NLR-CTT Express",
    distanceKm: 130,
    duration: "2h 45m",
    source: "apsrtc-schedule",
    verifiedAt: "2026-06-28",
  },

  // Kurnool routes
  {
    id: "krn-ant-001",
    originId: "krn",
    destinationId: "ant",
    name: "KRN-ANT Local",
    distanceKm: 145,
    duration: "3h 15m",
    source: "apsrtc-schedule",
    verifiedAt: "2026-06-28",
  },
  {
    id: "krn-ndy-001",
    originId: "krn",
    destinationId: "ndy",
    name: "KRN-NDY Express",
    distanceKm: 105,
    duration: "2h 30m",
    source: "apsrtc-schedule",
    verifiedAt: "2026-06-28",
  },

  // Srikakulam routes
  {
    id: "skl-vzm-001",
    originId: "skl",
    destinationId: "vzm",
    name: "SKL-VZM Local",
    distanceKm: 75,
    duration: "1h 50m",
    source: "apsrtc-schedule",
    verifiedAt: "2026-06-28",
  },

  // Eluru routes
  {
    id: "elu-raj-001",
    originId: "elu",
    destinationId: "raj",
    name: "ELU-RAJ Express",
    distanceKm: 165,
    duration: "3h 30m",
    source: "apsrtc-schedule",
    verifiedAt: "2026-06-28",
  },
];
