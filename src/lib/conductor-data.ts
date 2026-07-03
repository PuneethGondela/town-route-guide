/* ============================================================
   CONDUCTOR DATA MODELS
   ============================================================
   NOTE: The previous in-memory mock store (CONDUCTORS, findConductor,
   ACTIVE_SESSIONS, LOCATION_PINGS, ISSUED_TICKETS) has been removed.
   conductor.functions.ts talks to Supabase directly now — that mock
   data (including plaintext demo passwords) was dead code left over
   from before the DB migration. This file is now types + id helpers
   only.

   Before deleting the old version of this file from your working
   tree, grep the repo for `CONDUCTORS` and `findConductor` — if the
   conductor login screen still imports either of those to populate a
   "demo credentials" box, fix that call site first or it will break.
   ============================================================ */

export type Conductor = {
  id: string;
  employeeId: string;
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
  accuracy: number | null;
  crowdStatus: "low" | "medium" | "full";
  timestamp: string;
};

export type Ticket = {
  id: string;
  sessionId: string;
  busNumber: string;
  routeId: string;
  passengerName: string;
  seatNumber?: string | null;
  boardingStop: string;
  alightingStop: string;
  fare: number;
  issuedAt: string;
  validUntil: string;
  isUsed?: boolean;
};

export type TicketQR = {
  ticketId: string;
  sessionId: string;
  busNumber: string;
  passengerName: string;
  boardingStop: string;
  fare: number;
  issuedAt: string;
};

export const generateTicketId = (): string => {
  return `TKT-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`.toUpperCase();
};

export const generateSessionId = (): string => {
  return `SES-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`.toUpperCase();
};
