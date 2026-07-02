import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/lib/supabase.server";
import { generateSessionId, generateTicketId, type ConductorSession, type LocationPing, type Ticket, type TicketQR } from "@/lib/conductor-data";

/* ============================================================
   CONDUCTOR AUTHENTICATION
   ============================================================ */

export const conductorLogin = createServerFn({ method: "POST" }, async (employeeId: string, password: string) => {
  try {
    const { data: conductor, error } = await supabase
      .from("conductors")
      .select("*")
      .eq("employee_id", employeeId)
      .single();

    if (error || !conductor) {
      return { success: false, error: "Employee ID not found" };
    }

    if (conductor.password !== password) {
      return { success: false, error: "Invalid password" };
    }

    return {
      success: true,
      conductorId: conductor.id,
      conductorName: conductor.name,
      employeeId: conductor.employee_id,
      token: `token-${conductor.id}-${Date.now()}`,
    };
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, error: "Server error" };
  }
});

/* ============================================================
   TRIP MANAGEMENT
   ============================================================ */

export const conductorStartTrip = createServerFn(
  { method: "POST" },
  async (conductorId: string, busNumber: string, routeId: string, originId: string, destinationId: string) => {
    try {
      // Get conductor details
      const { data: conductor, error: condError } = await supabase
        .from("conductors")
        .select("*")
        .eq("id", conductorId)
        .single();

      if (condError || !conductor) {
        return { success: false, error: "Conductor not found" };
      }

      const sessionId = generateSessionId();

      // Create session in database
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

      // Log to audit
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
        },
        message: `Trip started for ${busNumber} on route ${routeId}`,
      };
    } catch (err) {
      console.error("Start trip error:", err);
      return { success: false, error: "Failed to start trip" };
    }
  }
);

export const conductorEndTrip = createServerFn({ method: "POST" }, async (sessionId: string) => {
  try {
    const { data: session, error: selectError } = await supabase
      .from("conductor_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (selectError || !session) {
      return { success: false, error: "Session not found" };
    }

    // Update session
    const { data: updatedSession, error: updateError } = await supabase
      .from("conductor_sessions")
      .update({ is_active: false, end_time: new Date().toISOString() })
      .eq("id", sessionId)
      .select()
      .single();

    if (updateError || !updatedSession) {
      return { success: false, error: "Failed to end trip" };
    }

    // Log to audit
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
      },
      message: "Trip ended",
    };
  } catch (err) {
    console.error("End trip error:", err);
    return { success: false, error: "Failed to end trip" };
  }
});

export const conductorGetActiveSession = createServerFn({ method: "GET" }, async (conductorId: string) => {
  try {
    const { data: session, error } = await supabase
      .from("conductor_sessions")
      .select("*")
      .eq("conductor_id", conductorId)
      .eq("is_active", true)
      .single();

    if (error?.code === "PGRST116") {
      // No rows found
      return { success: true, session: null };
    }

    if (error) {
      console.error("Get session error:", error);
      return { success: true, session: null };
    }

    return {
      success: true,
      session: session
        ? {
            id: session.id,
            conductorId: session.conductor_id,
            conductorName: session.conductor_name,
            busNumber: session.bus_number,
            routeId: session.route_id,
            originId: session.origin_id,
            destinationId: session.destination_id,
            startTime: session.start_time,
            isActive: session.is_active,
          }
        : null,
    };
  } catch (err) {
    console.error("Get session error:", err);
    return { success: false, error: "Server error" };
  }
});

/* ============================================================
   LOCATION TRACKING
   ============================================================ */

export const conductorPushLocation = createServerFn(
  { method: "POST" },
  async (sessionId: string, lat: number, lon: number, accuracy: number, crowdStatus: "low" | "medium" | "full") => {
    try {
      const { data: session, error: sessionError } = await supabase
        .from("conductor_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionError || !session) {
        return { success: false, error: "Session not found" };
      }

      const pingId = `ping-${Date.now()}`;

      const { data: ping, error: pingError } = await supabase
        .from("location_pings")
        .insert({
          id: pingId,
          session_id: sessionId,
          lat,
          lon,
          accuracy,
          crowd_status: crowdStatus,
        })
        .select()
        .single();

      if (pingError || !ping) {
        return { success: false, error: "Failed to record location" };
      }

      return {
        success: true,
        ping: {
          id: ping.id,
          sessionId: ping.session_id,
          lat: ping.lat,
          lon: ping.lon,
          accuracy: ping.accuracy,
          crowdStatus: ping.crowd_status,
          timestamp: ping.timestamp,
        },
      };
    } catch (err) {
      console.error("Push location error:", err);
      return { success: false, error: "Failed to record location" };
    }
  }
);

export const getLatestLocationForRoute = createServerFn(
  { method: "GET" },
  async (routeId: string, busNumber: string) => {
    try {
      const { data: session, error: sessionError } = await supabase
        .from("conductor_sessions")
        .select("*")
        .eq("route_id", routeId)
        .eq("bus_number", busNumber)
        .eq("is_active", true)
        .single();

      if (sessionError?.code === "PGRST116") {
        // No active session
        return { success: true, ping: null, message: "No active bus for this route" };
      }

      if (sessionError || !session) {
        return { success: true, ping: null, message: "No active bus for this route" };
      }

      const { data: pings, error: pingsError } = await supabase
        .from("location_pings")
        .select("*")
        .eq("session_id", session.id)
        .order("timestamp", { ascending: false })
        .limit(1);

      const latest = pings && pings.length > 0 ? pings[0] : null;

      return {
        success: true,
        ping: latest
          ? {
              id: latest.id,
              sessionId: latest.session_id,
              lat: latest.lat,
              lon: latest.lon,
              accuracy: latest.accuracy,
              crowdStatus: latest.crowd_status,
              timestamp: latest.timestamp,
            }
          : null,
        sessionId: session.id,
        busNumber: session.bus_number,
        conductorName: session.conductor_name,
        lastUpdated: latest?.timestamp ?? null,
      };
    } catch (err) {
      console.error("Get location error:", err);
      return { success: false, error: "Server error" };
    }
  }
);

export const getLocationHistory = createServerFn({ method: "GET" }, async (sessionId: string) => {
  try {
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
      pings: pings
        ? pings.map((p) => ({
            id: p.id,
            sessionId: p.session_id,
            lat: p.lat,
            lon: p.lon,
            accuracy: p.accuracy,
            crowdStatus: p.crowd_status,
            timestamp: p.timestamp,
          }))
        : [],
    };
  } catch (err) {
    console.error("Get history error:", err);
    return { success: false, error: "Server error" };
  }
});

/* ============================================================
   QR TICKET GENERATION & VALIDATION
   ============================================================ */

export const generateTicket = createServerFn(
  { method: "POST" },
  async (sessionId: string, passengerName: string, boardingStop: string, alightingStop: string, fare: number) => {
    try {
      const { data: session, error: sessionError } = await supabase
        .from("conductor_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionError || !session) {
        return { success: false, error: "Session not found" };
      }

      const ticketId = generateTicketId();
      const validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .insert({
          id: ticketId,
          session_id: sessionId,
          bus_number: session.bus_number,
          route_id: session.route_id,
          passenger_name: passengerName,
          boarding_stop: boardingStop,
          alighting_stop: alightingStop,
          fare,
          valid_until: validUntil,
        })
        .select()
        .single();

      if (ticketError || !ticket) {
        return { success: false, error: "Failed to generate ticket" };
      }

      // Log to audit
      await supabase.from("audit_logs").insert({
        session_id: sessionId,
        action: "ticket_issued",
        details: { passenger: passengerName, fare },
      });

      const qrData: TicketQR = {
        ticketId: ticket.id,
        sessionId,
        busNumber: session.bus_number,
        passportName: passengerName,
        boardingStop,
        fare,
        issuedAt: ticket.issued_at,
      };

      return {
        success: true,
        ticket: {
          id: ticket.id,
          sessionId: ticket.session_id,
          busNumber: ticket.bus_number,
          routeId: ticket.route_id,
          passengerName: ticket.passenger_name,
          boardingStop: ticket.boarding_stop,
          alightingStop: ticket.alighting_stop,
          fare: ticket.fare,
          issuedAt: ticket.issued_at,
          validUntil: ticket.valid_until,
        },
        qrData: JSON.stringify(qrData),
        qrUrl: `/ticket/${ticket.id}`,
      };
    } catch (err) {
      console.error("Generate ticket error:", err);
      return { success: false, error: "Failed to generate ticket" };
    }
  }
);

export const getTicket = createServerFn({ method: "GET" }, async (ticketId: string) => {
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

    const { data: pings } = await supabase
      .from("location_pings")
      .select("*")
      .eq("session_id", ticket.session_id)
      .order("timestamp", { ascending: false })
      .limit(1);

    const latestPing = pings && pings.length > 0 ? pings[0] : null;

    return {
      success: true,
      ticket: {
        id: ticket.id,
        sessionId: ticket.session_id,
        busNumber: ticket.bus_number,
        routeId: ticket.route_id,
        passengerName: ticket.passenger_name,
        boardingStop: ticket.boarding_stop,
        alightingStop: ticket.alighting_stop,
        fare: ticket.fare,
        issuedAt: ticket.issued_at,
        validUntil: ticket.valid_until,
      },
      liveLocation: latestPing
        ? { lat: latestPing.lat, lon: latestPing.lon, timestamp: latestPing.timestamp }
        : null,
      busStatus: session?.is_active ? "active" : "completed",
    };
  } catch (err) {
    console.error("Get ticket error:", err);
    return { success: false, error: "Server error" };
  }
});

export const validateTicket = createServerFn({ method: "POST" }, async (ticketId: string) => {
  try {
    const { data: ticket, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (error || !ticket) {
      return { success: false, valid: false, error: "Ticket not found" };
    }

    const now = new Date();
    const validUntil = new Date(ticket.valid_until);
    const isValid = now < validUntil;

    return {
      success: true,
      valid: isValid,
      ticket: {
        id: ticket.id,
        passengerName: ticket.passenger_name,
        busNumber: ticket.bus_number,
        boardingStop: ticket.boarding_stop,
        fare: ticket.fare,
        issuedAt: ticket.issued_at,
        validUntil: ticket.valid_until,
      },
      message: isValid ? "Ticket is valid" : "Ticket has expired",
    };
  } catch (err) {
    console.error("Validate ticket error:", err);
    return { success: false, valid: false, error: "Server error" };
  }
});
