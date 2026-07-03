import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createHmac, timingSafeEqual } from "node:crypto";
import { supabase } from "@/lib/supabase.server";
import {
  generateSessionId,
  generateTicketId,
  type ConductorSession,
  type LocationPing,
  type Ticket,
  type TicketQR,
} from "@/lib/conductor-data";

/* ============================================================
   Session token signing (HMAC — no extra infra required)
   ============================================================
   This is a minimal, real fix for "the client can just say who it
   is" — it is NOT a replacement for migrating to Supabase Auth
   (still recommended for Phase 3: proper session expiry, refresh,
   revocation, etc). Set CONDUCTOR_TOKEN_SECRET in your environment;
   the app should refuse to start without it in production.
   ============================================================ */

const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12h shift-length session

function getTokenSecret(): string {
  const secret = process.env.CONDUCTOR_TOKEN_SECRET;
  if (!secret) {
    throw new Error(
      "CONDUCTOR_TOKEN_SECRET is not set. Refusing to sign/verify conductor tokens without it.",
    );
  }
  return secret;
}

function signConductorToken(conductorId: string): string {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `${conductorId}.${expiresAt}`;
  const sig = createHmac("sha256", getTokenSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

function verifyConductorToken(conductorId: string, token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [tokenConductorId, expiresAtStr, sig] = parts;
  if (tokenConductorId !== conductorId) return false;

  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const expectedSig = createHmac("sha256", getTokenSecret())
    .update(`${tokenConductorId}.${expiresAtStr}`)
    .digest("hex");

  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/* ============================================================
   Zod inputs
   ============================================================ */

const ConductorLoginInput = z.object({
  employeeId: z.string().min(1),
  password: z.string().min(1),
});

const ConductorStartTripInput = z.object({
  conductorId: z.string().min(1),
  token: z.string().min(1),
  busNumber: z.string().min(1),
  routeId: z.string().min(1),
  originId: z.string().min(1),
  destinationId: z.string().min(1),
});

const ConductorEndTripInput = z.object({
  sessionId: z.string().min(1),
  token: z.string().min(1),
});

const ConductorGetActiveSessionInput = z.object({
  conductorId: z.string().min(1),
});

const ConductorPushLocationInput = z.object({
  sessionId: z.string().min(1),
  token: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().optional(),
  crowdStatus: z.enum(["low", "medium", "full"]),
});

const GetLatestLocationForRouteInput = z.object({
  routeId: z.string().min(1),
  busNumber: z.string().min(1),
});

const GetLocationHistoryInput = z.object({
  sessionId: z.string().min(1),
});

const GenerateTicketInput = z.object({
  sessionId: z.string().min(1),
  token: z.string().min(1),
  passengerName: z.string().min(1),
  boardingStop: z.string().min(1),
  alightingStop: z.string().min(1),
  fare: z.number().positive(),
});

const GetTicketInput = z.object({
  ticketId: z.string().min(1),
});

const ValidateTicketInput = z.object({
  ticketId: z.string().min(1),
  token: z.string().min(1),
});

/* ============================================================
   CONDUCTOR AUTH
   ============================================================ */

export const conductorLogin = createServerFn({ method: "POST" })
  .inputValidator(ConductorLoginInput)
  .handler(async ({ data }) => {
    const { employeeId, password } = data;

    const { data: conductor, error } = await supabase
      .from("conductors")
      .select("*")
      .eq("employee_id", employeeId)
      .single();

    if (error || !conductor) {
      return { success: false, error: "Employee ID not found" };
    }

    const passwordOk = await bcrypt.compare(password, conductor.password);
    if (!passwordOk) {
      return { success: false, error: "Invalid password" };
    }

    return {
      success: true,
      conductorId: conductor.id,
      conductorName: conductor.name,
      employeeId: conductor.employee_id,
      token: signConductorToken(conductor.id),
    };
  });

/* ============================================================
   TRIP MANAGEMENT
   ============================================================ */

export const conductorStartTrip = createServerFn({ method: "POST" })
  .inputValidator(ConductorStartTripInput)
  .handler(async ({ data }) => {
    const { conductorId, token, busNumber, routeId, originId, destinationId } = data;

    if (!verifyConductorToken(conductorId, token)) {
      return { success: false, error: "Not authorized" };
    }

    const { data: conductor, error: condError } = await supabase
      .from("conductors")
      .select("*")
      .eq("id", conductorId)
      .single();

    if (condError || !conductor) {
      return { success: false, error: "Conductor not found" };
    }

    const sessionId = generateSessionId();

    const { data: session, error: sessionError } = await supabase
      .from("conductor_sessions")
      .insert({
        id: sessionId,
        conductor_id: conductorId,
        conductor_name: conductor.name,
        bus_number: busNumber,
        route_id: routeId,
        origin_id: originId,
        destination_id: destinationId,
        is_active: true,
      })
      .select()
      .single();

    if (sessionError || !session) {
      return { success: false, error: "Failed to create session" };
    }

    await supabase.from("audit_logs").insert({
      session_id: sessionId,
      action: "trip_started",
      details: { bus_number: busNumber, route_id: routeId },
    });

    return {
      success: true,
      session: {
        id: session.id,
        conductorId: session.conductor_id,
        conductorName: session.conductor_name,
        busNumber: session.bus_number,
        routeId: session.route_id,
        originId: session.origin_id,
        destinationId: session.destination_id,
        startTime: session.start_time,
        isActive: session.is_active,
      } satisfies ConductorSession,
      message: `Trip started for ${busNumber} on route ${routeId}`,
    };
  });

export const conductorEndTrip = createServerFn({ method: "POST" })
  .inputValidator(ConductorEndTripInput)
  .handler(async ({ data }) => {
    const { sessionId, token } = data;

    const { data: session, error: selectError } = await supabase
      .from("conductor_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (selectError || !session) {
      return { success: false, error: "Session not found" };
    }

    if (!verifyConductorToken(session.conductor_id, token)) {
      return { success: false, error: "Not authorized to end this trip" };
    }

    const { data: updatedSession, error: updateError } = await supabase
      .from("conductor_sessions")
      .update({ is_active: false, end_time: new Date().toISOString() })
      .eq("id", sessionId)
      .select()
      .single();

    if (updateError || !updatedSession) {
      return { success: false, error: "Failed to end trip" };
    }

    await supabase.from("audit_logs").insert({
      session_id: sessionId,
      action: "trip_ended",
      details: { end_time: updatedSession.end_time },
    });

    return {
      success: true,
      session: {
        id: updatedSession.id,
        conductorId: updatedSession.conductor_id,
        conductorName: updatedSession.conductor_name,
        busNumber: updatedSession.bus_number,
        routeId: updatedSession.route_id,
        originId: updatedSession.origin_id,
        destinationId: updatedSession.destination_id,
        startTime: updatedSession.start_time,
        endTime: updatedSession.end_time,
        isActive: updatedSession.is_active,
      } satisfies ConductorSession,
      message: "Trip ended",
    };
  });

export const conductorGetActiveSession = createServerFn({ method: "GET" })
  .inputValidator(ConductorGetActiveSessionInput)
  .handler(async ({ data }) => {
    const { conductorId } = data;

    const { data: session, error } = await supabase
      .from("conductor_sessions")
      .select("*")
      .eq("conductor_id", conductorId)
      .eq("is_active", true)
      .single();

    if (error) {
      return { success: true, session: null as ConductorSession | null };
    }

    return {
      success: true,
      session: session
        ? ({
            id: session.id,
            conductorId: session.conductor_id,
            conductorName: session.conductor_name,
            busNumber: session.bus_number,
            routeId: session.route_id,
            originId: session.origin_id,
            destinationId: session.destination_id,
            startTime: session.start_time,
            isActive: session.is_active,
          } satisfies ConductorSession)
        : null,
    };
  });

/* ============================================================
   LOCATION TRACKING
   ============================================================ */

export const conductorPushLocation = createServerFn({ method: "POST" })
  .inputValidator(ConductorPushLocationInput)
  .handler(async ({ data }) => {
    const { sessionId, token, lat, lon, accuracy, crowdStatus } = data;

    const { data: session, error: sessionError } = await supabase
      .from("conductor_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return { success: false, error: "Session not found" };
    }

    if (!verifyConductorToken(session.conductor_id, token)) {
      return { success: false, error: "Not authorized to push location for this session" };
    }

    if (!session.is_active) {
      return { success: false, error: "Session has ended — ping rejected" };
    }

    const ping = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      lat,
      lon,
      accuracy: accuracy ?? null,
      crowd_status: crowdStatus,
      timestamp: new Date().toISOString(),
    };

    const { data: inserted, error: pingError } = await supabase
      .from("location_pings")
      .insert(ping)
      .select()
      .single();

    if (pingError || !inserted) {
      return { success: false, error: "Failed to record location" };
    }

    return {
      success: true,
      ping: {
        id: inserted.id,
        sessionId: inserted.session_id,
        lat: inserted.lat,
        lon: inserted.lon,
        accuracy: inserted.accuracy ?? null,
        crowdStatus: inserted.crowd_status,
        timestamp: inserted.timestamp,
      } satisfies LocationPing,
    };
  });

export const getLatestLocationForRoute = createServerFn({ method: "GET" })
  .inputValidator(GetLatestLocationForRouteInput)
  .handler(async ({ data }) => {
    const { routeId, busNumber } = data;

    const { data: session, error: sessionError } = await supabase
      .from("conductor_sessions")
      .select("*")
      .eq("route_id", routeId)
      .eq("bus_number", busNumber)
      .eq("is_active", true)
      .single();

    if (sessionError || !session) {
      return { success: true, ping: null, message: "No active bus for this route" };
    }

    const { data: pings, error: pingsError } = await supabase
      .from("location_pings")
      .select("*")
      .eq("session_id", session.id)
      .order("timestamp", { ascending: false })
      .limit(1);

    if (pingsError) {
      return { success: false, error: "Failed to load latest location" };
    }

    const latest = pings && pings.length > 0 ? pings[0] : null;

    return {
      success: true,
      ping: latest
        ? ({
            id: latest.id,
            sessionId: latest.session_id,
            lat: latest.lat,
            lon: latest.lon,
            accuracy: latest.accuracy ?? null,
            crowdStatus: latest.crowd_status,
            timestamp: latest.timestamp,
          } satisfies LocationPing)
        : null,
      sessionId: session.id,
      busNumber: session.bus_number,
      conductorName: session.conductor_name,
      lastUpdated: latest?.timestamp ?? null,
    };
  });

export const getLocationHistory = createServerFn({ method: "GET" })
  .inputValidator(GetLocationHistoryInput)
  .handler(async ({ data }) => {
    const { sessionId } = data;

    const { data: pings, error } = await supabase
      .from("location_pings")
      .select("*")
      .eq("session_id", sessionId)
      .order("timestamp", { ascending: true });

    if (error) {
      return { success: false, error: "Server error" };
    }

    return {
      success: true,
      pings: (pings ?? []).map((p) => ({
        id: p.id,
        sessionId: p.session_id,
        lat: p.lat,
        lon: p.lon,
        accuracy: p.accuracy ?? null,
        crowdStatus: p.crowd_status,
        timestamp: p.timestamp,
      })) satisfies LocationPing[],
    };
  });

/* ============================================================
   TICKETING
   ============================================================ */

export const generateTicket = createServerFn({ method: "POST" })
  .inputValidator(GenerateTicketInput)
  .handler(async ({ data }) => {
    const { sessionId, token, passengerName, boardingStop, alightingStop, fare } = data;

    try {
      const { data: session, error: sessionError } = await supabase
        .from("conductor_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionError || !session) {
        return { success: false, error: "Session not found" };
      }

      if (!verifyConductorToken(session.conductor_id, token)) {
        return { success: false, error: "Not authorized to issue tickets for this session" };
      }

      const ticketId = generateTicketId();
      const issuedAt = new Date().toISOString();
      const validUntil = new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString();

      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .insert({
          id: ticketId,
          session_id: sessionId,
          bus_number: session.bus_number,
          route_id: session.route_id,
          passenger_name: passengerName,
          seat_number: null,
          boarding_stop: boardingStop,
          alighting_stop: alightingStop,
          fare,
          valid_until: validUntil,
          issued_at: issuedAt,
          is_used: false,
        })
        .select()
        .single();

      if (ticketError || !ticket) {
        return { success: false, error: "Failed to generate ticket" };
      }

      await supabase.from("audit_logs").insert({
        session_id: sessionId,
        action: "ticket_issued",
        details: { ticket_id: ticketId, passenger_name: passengerName },
      });

      const qrUrl = `/ticket/${ticketId}`;

      return {
        success: true,
        ticket: {
          id: ticket.id,
          sessionId: ticket.session_id,
          busNumber: ticket.bus_number,
          routeId: ticket.route_id,
          passengerName: ticket.passenger_name,
          seatNumber: ticket.seat_number ?? null,
          boardingStop: ticket.boarding_stop,
          alightingStop: ticket.alighting_stop,
          fare: ticket.fare,
          issuedAt: ticket.issued_at,
          validUntil: ticket.valid_until,
        } satisfies Ticket,
        qrData: {
          ticketId: ticket.id,
          sessionId: ticket.session_id,
          busNumber: ticket.bus_number,
          passengerName: ticket.passenger_name,
          boardingStop: ticket.boarding_stop,
          fare: ticket.fare,
          issuedAt: ticket.issued_at,
        } satisfies TicketQR,
        qrUrl,
      };
    } catch (err) {
      console.error("Generate ticket error:", err);
      return { success: false, error: "Failed to generate ticket" };
    }
  });

export const getTicket = createServerFn({ method: "GET" })
  .inputValidator(GetTicketInput)
  .handler(async ({ data }) => {
    const { ticketId } = data;

    try {
      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", ticketId)
        .single();

      if (ticketError || !ticket) {
        return { success: false, error: "Ticket not found" };
      }

      const { data: session } = await supabase
        .from("conductor_sessions")
        .select("*")
        .eq("id", ticket.session_id)
        .single();

      return {
        success: true,
        ticket: {
          id: ticket.id,
          sessionId: ticket.session_id,
          passengerName: ticket.passenger_name,
          busNumber: ticket.bus_number,
          routeId: ticket.route_id,
          seatNumber: ticket.seat_number ?? null,
          boardingStop: ticket.boarding_stop,
          alightingStop: ticket.alighting_stop,
          fare: ticket.fare,
          issuedAt: ticket.issued_at,
          validUntil: ticket.valid_until,
          isUsed: ticket.is_used,
        } satisfies Ticket,
        liveLocation: null,
        busStatus: session?.is_active ? "active" : "completed",
      };
    } catch (err) {
      console.error("Get ticket error:", err);
      return { success: false, error: "Server error" };
    }
  });

/**
 * Validates AND consumes a ticket in one atomic step: a ticket that is
 * already used or expired is rejected. This requires a conductor token
 * because it's a scanning/consuming action, not a passenger self-lookup
 * (use getTicket for that). If you have a separate passenger-facing
 * "check my ticket" flow that isn't conductor-initiated, don't point it
 * at this function — it will now consume the ticket.
 */
export const validateTicket = createServerFn({ method: "POST" })
  .inputValidator(ValidateTicketInput)
  .handler(async ({ data }) => {
    const { ticketId, token } = data;

    try {
      const { data: ticket, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", ticketId)
        .single();

      if (error || !ticket) {
        return { success: false, valid: false, error: "Ticket not found" };
      }

      const { data: session } = await supabase
        .from("conductor_sessions")
        .select("conductor_id")
        .eq("id", ticket.session_id)
        .single();

      if (!session || !verifyConductorToken(session.conductor_id, token)) {
        return { success: false, valid: false, error: "Not authorized to validate this ticket" };
      }

      if (ticket.is_used) {
        return { success: true, valid: false, message: "Ticket has already been used" };
      }

      const validUntilMs = new Date(ticket.valid_until).getTime();
      if (Date.now() >= validUntilMs) {
        return { success: true, valid: false, message: "Ticket has expired" };
      }

      const { error: updateError } = await supabase
        .from("tickets")
        .update({ is_used: true })
        .eq("id", ticketId);

      if (updateError) {
        return { success: false, valid: false, error: "Failed to mark ticket used" };
      }

      await supabase.from("audit_logs").insert({
        session_id: ticket.session_id,
        action: "ticket_validated",
        details: { ticket_id: ticketId },
      });

      return {
        success: true,
        valid: true,
        ticket: {
          id: ticket.id,
          passengerName: ticket.passenger_name,
          busNumber: ticket.bus_number,
          boardingStop: ticket.boarding_stop,
          fare: ticket.fare,
          issuedAt: ticket.issued_at,
          validUntil: ticket.valid_until,
        } as Ticket,
        message: "Ticket is valid",
      };
    } catch (err) {
      console.error("Validate ticket error:", err);
      return { success: false, valid: false, error: "Server error" };
    }
  });
