/* ============================================================
   CONDUCTOR DATA MODELS
   ============================================================ */

export type Conductor = {
  id: string;
  employeeId: string;
  password: string;
  name: string;
  busNumber?: string;
  verified: boolean;
  createdAt: string;
};

export type ConductorSession = {
  id: string;
  conductorId: string;
  conductorName: string;
  busNumber: string;
  routeId: string;
  originId: string;
  destinationId: string;
  startTime: string;
  endTime?: string;
  isActive: boolean;
};

export type LocationPing = {
  id: string;
  sessionId: string;
  lat: number;
  lon: number;
  accuracy: number;
  crowdStatus: "low" | "medium" | "full";
  timestamp: string;
};

export type Ticket = {
  id: string;
  sessionId: string;
  busNumber: string;
  routeId: string;
  passengerName: string;
  seatNumber?: string;
  boardingStop: string;
  alightingStop: string;
  fare: number;
  issuedAt: string;
  validUntil: string;
};

export type TicketQR = {
  ticketId: string;
  sessionId: string;
  busNumber: string;
  passportName: string;
  boardingStop: string;
  fare: number;
  issuedAt: string;
};

/* Mock store for demo (replace with real DB in production) */
export const CONDUCTORS: Conductor[] = [
  {
    id: "cond-001",
    employeeId: "EMP-0001",
    password: "password123",
    name: "Ramakrishna Reddy",
    verified: true,
    createdAt: "2026-06-01",
  },
  {
    id: "cond-002",
    employeeId: "EMP-0002",
    password: "password123",
    name: "Srinivas Kumar",
    verified: true,
    createdAt: "2026-06-01",
  },
  {
    id: "cond-003",
    employeeId: "EMP-0003",
    password: "password123",
    name: "Venkateswaran",
    verified: true,
    createdAt: "2026-06-01",
  },
];

/* In-memory store for active sessions (would be DB in production) */
export let ACTIVE_SESSIONS: ConductorSession[] = [];
export let LOCATION_PINGS: LocationPing[] = [];
export let ISSUED_TICKETS: Ticket[] = [];

export const findConductor = (employeeId: string): Conductor | null => {
  const normalized = employeeId.trim().toUpperCase();
  return CONDUCTORS.find((c) => c.employeeId === normalized) ?? null;
};

export const generateTicketId = (): string => {
  return `TKT-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`.toUpperCase();
};

export const generateSessionId = (): string => {
  return `SES-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`.toUpperCase();
};
