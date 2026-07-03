import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  LogOut, Zap, LogIn, MapPin, Users, QrCode, Check, Loader2, AlertCircle,
} from "lucide-react";
import { conductorLogin, conductorStartTrip, conductorEndTrip, conductorGetActiveSession, conductorPushLocation, generateTicket } from "@/lib/api/conductor.functions";
import { CITIES, ROUTES } from "@/lib/transit-data";
import type { ConductorSession } from "@/lib/conductor-data";

export const Route = createFileRoute("/conductor")({
  component: ConductorApp,
});

type ConductorState = {
  isLoggedIn: boolean;
  conductorId: string | null;
  conductorName: string | null;
  employeeId: string | null;
  token: string | null;
};

function ConductorApp() {
  const [state, setState] = useState<ConductorState>({
    isLoggedIn: false,
    conductorId: null,
    conductorName: null,
    employeeId: null,
    token: null,
  });

  const logout = () => {
    setState({
      isLoggedIn: false,
      conductorId: null,
      conductorName: null,
      employeeId: null,
      token: null,
    });
    toast.success("Logged out successfully");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-0 sm:py-6">
      <div
        className="relative mx-auto flex w-full max-w-md flex-col overflow-hidden border border-slate-700/50 bg-slate-950 shadow-2xl shadow-blue-900/20 sm:rounded-[2.25rem] sm:border-[6px] sm:border-slate-700"
        style={{ height: "min(880px, 100vh)" }}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-700/50 bg-slate-900/80 px-4 py-3 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
              <Zap className="h-4 w-4 text-white" strokeWidth={3} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">APSRTC</p>
              <p className="text-[12px] font-bold text-white">Conductor Ops</p>
            </div>
          </div>
          {state.isLoggedIn && (
            <button
              onClick={logout}
              className="flex items-center gap-1 rounded-lg bg-red-500/20 px-2.5 py-1.5 text-[10px] font-bold text-red-400 transition hover:bg-red-500/30"
            >
              <LogOut className="h-3 w-3" /> Logout
            </button>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20">
          {!state.isLoggedIn ? (
            <ConductorLogin setState={setState} />
          ) : (
            <ConductorDashboard
              conductorId={state.conductorId!}
              conductorName={state.conductorName!}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   LOGIN SCREEN
   ============================================================ */

function ConductorLogin({
  setState,
}: {
  setState: (state: ConductorState) => void;
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await conductorLogin({
        data: { employeeId, password },
      });

      if (result.success) {
        setState({
          isLoggedIn: true,
          conductorId: result.conductorId,
          conductorName: result.conductorName,
          employeeId: result.employeeId,
          token: result.token,
        });
        toast.success(`Welcome, ${result.conductorName}!`);
      } else {
        setError(result.error || "Login failed");
        toast.error(result.error || "Login failed");
      }
    } catch (err) {
      setError("Server error");
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-4 rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-lg">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">Conductor Login</h2>
          <p className="mt-1 text-[12px] text-slate-400">Enter your credentials</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 text-red-400 shrink-0" />
            <p className="text-[12px] font-semibold text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">
              Employee ID
            </label>
            <input
              type="text"
              placeholder="e.g., EMP-0001"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-slate-600/50 bg-slate-950 px-3.5 py-2.5 text-[13px] font-medium text-white placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-600/50 bg-slate-950 px-3.5 py-2.5 text-[13px] font-medium text-white placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !employeeId || !password}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-[12px] font-bold text-white transition disabled:opacity-50 active:scale-95 hover:from-blue-700 hover:to-cyan-700 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Logging in...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" /> Login
              </>
            )}
          </button>
        </form>

        <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-3">
          <p className="text-[11px] font-semibold text-slate-300">Demo Credentials:</p>
          <p className="mt-1 text-[11px] text-slate-400">
            <strong>ID:</strong> EMP-0001 | <strong>Pass:</strong> password123
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CONDUCTOR DASHBOARD
   ============================================================ */

function ConductorDashboard({
  conductorId,
  conductorName,
}: {
  conductorId: string;
  conductorName: string;
}) {
  const [activeSession, setActiveSession] = useState<ConductorSession | null>(null);
  const [showTripForm, setShowTripForm] = useState(!activeSession);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const startTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const route = ROUTES.find((r) => r.id === selectedRoute);
      if (!route) {
        toast.error("Route not found");
        return;
      }

      const result = await conductorStartTrip({
        data: {
          conductorId,
          busNumber,
          routeId: route.id,
          originId: route.originId,
          destinationId: route.destinationId,
        },
      });

      if (result.success) {
        setActiveSession(result.session);
        setShowTripForm(false);
        toast.success(`Trip started: ${busNumber}`);
      } else {
        toast.error(result.error || "Failed to start trip");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const endTrip = async () => {
    if (!activeSession) return;
    setLoading(true);

    try {
      const result = await conductorEndTrip({ data: { sessionId: activeSession.id } });

      if (result.success) {
        setActiveSession(null);
        setShowTripForm(true);
        toast.success("Trip ended successfully");
      } else {
        toast.error(result.error || "Failed to end trip");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 p-3">
      {/* Welcome Card */}
      <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-blue-900/40 to-cyan-900/40 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-300">Conductor</p>
        <p className="mt-0.5 text-[14px] font-bold text-white">{conductorName}</p>
      </div>

      {!activeSession ? (
        <TripForm
          busNumber={busNumber}
          setBusNumber={setBusNumber}
          selectedRoute={selectedRoute}
          setSelectedRoute={setSelectedRoute}
          loading={loading}
          onSubmit={startTrip}
        />
      ) : (
        <TripPanel
          session={activeSession}
          conductorName={conductorName}
          onEndTrip={endTrip}
          loading={loading}
        />
      )}
    </div>
  );
}

/* ============================================================
   TRIP FORM
   ============================================================ */

function TripForm({
  busNumber,
  setBusNumber,
  selectedRoute,
  setSelectedRoute,
  loading,
  onSubmit,
}: {
  busNumber: string;
  setBusNumber: (value: string) => void;
  selectedRoute: string;
  setSelectedRoute: (value: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 space-y-3">
        <h3 className="text-[12px] font-bold text-white">Start New Trip</h3>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">
            Bus Number
          </label>
          <input
            type="text"
            placeholder="e.g., AP-07-AB-1234"
            value={busNumber}
            onChange={(e) => setBusNumber(e.target.value)}
            className="w-full rounded-lg border border-slate-600/50 bg-slate-950 px-3 py-2 text-[12px] font-medium text-white placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">
            Select Route
          </label>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="w-full rounded-lg border border-slate-600/50 bg-slate-950 px-3 py-2 text-[12px] font-medium text-white transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            required
          >
            <option value="">Select a route...</option>
            {ROUTES.map((route) => {
              const from = CITIES.find((c) => c.id === route.originId);
              const to = CITIES.find((c) => c.id === route.destinationId);
              return (
                <option key={route.id} value={route.id}>
                  {from?.name} → {to?.name} ({route.distanceKm} km)
                </option>
              );
            })}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !busNumber || !selectedRoute}
          className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-[12px] font-bold text-white transition disabled:opacity-50 active:scale-95 hover:from-blue-700 hover:to-cyan-700 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Starting...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" /> Start Trip
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/* ============================================================
   ACTIVE TRIP PANEL
   ============================================================ */

function TripPanel({
  session,
  conductorName,
  onEndTrip,
  loading,
}: {
  session: ConductorSession;
  conductorName: string;
  onEndTrip: () => void;
  loading: boolean;
}) {
  const from = CITIES.find((c) => c.id === session.originId);
  const to = CITIES.find((c) => c.id === session.destinationId);
  const [crowdStatus, setCrowdStatus] = useState<"low" | "medium" | "full">("low");

  return (
    <div className="space-y-3">
      {/* Trip Info Card */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 p-4">
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
              <Zap className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Active Trip</p>
              <p className="text-[13px] font-bold text-white">{session.busNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <MapPin className="h-3.5 w-3.5 text-blue-400" />
            {from?.name} → {to?.name}
          </div>
          <div className="text-[10px] font-semibold text-slate-400">
            Started at {new Date(session.startTime).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Crowd Status Control */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-slate-400" />
          <p className="text-[11px] font-bold text-white">Crowd Status</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["low", "medium", "full"].map((status) => (
            <button
              key={status}
              onClick={() => setCrowdStatus(status as "low" | "medium" | "full")}
              className={`rounded-lg px-3 py-2 text-[11px] font-bold uppercase transition ${
                crowdStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2.5 text-[11px] font-bold text-slate-300 transition hover:bg-slate-800/50">
          <MapPin className="h-4 w-4" /> Location
        </button>
        <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2.5 text-[11px] font-bold text-slate-300 transition hover:bg-slate-800/50">
          <QrCode className="h-4 w-4" /> Issue QR
        </button>
      </div>

      {/* End Trip Button */}
      <button
        onClick={onEndTrip}
        disabled={loading}
        className="w-full rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-[12px] font-bold text-white transition disabled:opacity-50 active:scale-95 hover:from-red-700 hover:to-red-800 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Ending...
          </>
        ) : (
          <>
            <Check className="h-4 w-4" /> End Trip
          </>
        )}
      </button>
    </div>
  );
}
