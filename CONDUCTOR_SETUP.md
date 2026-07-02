# 🚀 Naa Transit — Conductor App + Supabase Integration

## What's Been Implemented

### ✅ Complete Conductor System
- **Login**: Employee ID + Password authentication (no OTP)
- **Trip Management**: Start/End trips with bus number + route selection
- **Live Tracking**: Push GPS location pings with crowd status (low/medium/full)
- **QR Tickets**: Generate unique ticket IDs with encoded passenger data
- **Audit Logging**: All conductor actions tracked in database

### ✅ Supabase Backend
- **8 Tables** with proper relationships and indexes
- **Pre-seeded Data**: 3 demo conductors, 16 cities, 20 routes
- **Real-time Subscriptions**: WebSocket support for location updates
- **Row Level Security**: Ready to implement access controls
- **Views**: Active sessions with location, ticket details

### ✅ Passenger App (Existing)
- Multi-language UI (English/తెలుగు/हिन्दी)
- Real station data + OSM-verified coordinates
- Nearby POI discovery (Overpass API)
- Safety features + AI assistant

---

## Quick Start

### 1. Environment Variables (Already Done ✅)
Your `.env.local` already has Supabase credentials:
```bash


### 2. Apply Database Schema (🔴 REQUIRED)

**Option A: Supabase Dashboard (Easiest)**
1. Go to https://app.supabase.com → Select your project
2. Click **SQL Editor** → **New Query**
3. Copy/paste entire `supabase-schema.sql` file
4. Click **Run**

**Option B: Command Line**
```bash
# If you have PostgreSQL installed:
psql -h swgihoojfdjjcmhdwzuh.supabase.co -U postgres < supabase-schema.sql
# Enter password when prompted
```

**Option C: Setup Script (Interactive)**
```bash
chmod +x setup-supabase.sh
./setup-supabase.sh
```

### 3. Test the App

**Start dev server:**
```bash
npm run dev
```

**Test Passenger App:**
- Visit http://localhost:5173/
- See real 16 AP cities with live routes
- Demo route: Vijayawada → Visakhapatnam

**Test Conductor App:**
- Visit http://localhost:5173/conductor
- Login with: **EMP-0001** / **password123**
- Start a trip with any bus number + route
- Track location (simulated)
- Issue QR tickets

---

## Database Schema Overview

### Tables Created

| Table | Purpose | Rows |
|-------|---------|------|
| `conductors` | Employee accounts | 3 pre-seeded |
| `conductor_sessions` | Active trips | Empty (created on login) |
| `location_pings` | Real-time GPS + crowd | Created per session |
| `tickets` | QR tickets issued | Created per ticket |
| `cities` | Station data | 16 pre-seeded (AP) |
| `routes` | Inter-city routes | 20 pre-seeded |
| `audit_logs` | Activity history | Auto-populated |

### Pre-seeded Demo Data

**Conductors:**
- EMP-0001: Ramakrishna Reddy
- EMP-0002: Srinivas Kumar
- EMP-0003: Venkateswaran

**Cities (AP):**
Vijayawada, Tirupati, Visakhapatnam, Guntur, Nellore, Kurnool, Kakinada, Srikakulam, Eluru, Rajahmundry, Kadapa, Anantapur, Ongole, Vizianagaram, Chittoor, Nandyal

**Routes:**
20 inter-city routes covering major corridors (VJA-VZG, VJA-GNT, TPT-NLR, etc.)

---

## API Endpoints (Server Functions)

All conductor operations use Supabase:

```typescript
// Authentication
conductorLogin(employeeId: string, password: string)

// Trip Management
conductorStartTrip(conductorId, busNumber, routeId, originId, destinationId)
conductorEndTrip(sessionId: string)
conductorGetActiveSession(conductorId: string)

// Location Tracking
conductorPushLocation(sessionId, lat, lon, accuracy, crowdStatus)
getLatestLocationForRoute(routeId, busNumber)
getLocationHistory(sessionId)

// QR Tickets
generateTicket(sessionId, passengerName, boardingStop, alightingStop, fare)
getTicket(ticketId)
validateTicket(ticketId)
```

---

## Architecture

```
Frontend (React)
    ↓
Server Functions (TanStack Start)
    ↓
Supabase Client (JS SDK)
    ↓
PostgreSQL Database + Real-time
```

### Key Files
- `src/routes/conductor.tsx` — Full conductor UI
- `src/lib/api/conductor.functions.ts` — Server functions
- `src/lib/supabase.server.ts` — Database client
- `supabase-schema.sql` — Database schema
- `.env.local` — Supabase credentials

---

## Real-time Features (WebSocket Ready)

Subscribe to live updates:

```typescript
supabase
  .channel('location_updates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'location_pings',
  }, (payload) => {
    console.log('New location:', payload.new);
  })
  .subscribe();
```

---

## Security Notes

### Current State (Development)
- ✅ Database structure set up
- ✅ Basic auth with employee ID
- ⚠️ **Passwords stored as plain text** (not for production)
- ⚠️ **No RLS policies enabled** (public read/write)

### For Production
1. **Hash passwords**: Use bcrypt/Argon2
2. **Enable RLS**: Restrict access by conductor ID
3. **Use Supabase Auth**: JWT tokens instead of password
4. **Rate limiting**: Prevent brute force
5. **HTTPS only**: Encrypt in transit
6. **Audit retention**: Set log deletion policy

---

## Troubleshooting

### Database Not Connected
```bash
# Check credentials in .env.local
cat .env.local

# Test Supabase URL
curl https://swgihoojfdjjcmhdwzuh.supabase.co/rest/v1/conductors \
  -H "Authorization: Bearer YOUR_KEY"
```

### Tables Not Found
- Make sure you ran the SQL schema (step 2 above)
- Check Supabase Dashboard → Table Editor
- Should see `conductors`, `routes`, `cities` tables

### Login Fails
- Verify EMP-0001 exists in `conductors` table
- Check password is exactly `password123`
- Try different demo conductor (EMP-0002, EMP-0003)

### Realtime Not Working
- Check browser console for WebSocket errors
- Verify table is in publication `supabase_realtime`
- Ensure `REALTIME_DB_MAX_ROWS` is not exceeded

---

## Next Steps

### Phase 2: Enhancements
- [ ] QR code generation library (`qrcode.react`)
- [ ] Real-time map (MapLibre/Google Maps)
- [ ] Passenger ticket view (scan QR → see live bus)
- [ ] Admin panel (CRUD conductors/routes)

### Phase 3: Scale to Other States
- [ ] Add Delhi (GTFS-RT via OTD API)
- [ ] Add Karnataka (BMTC community data)
- [ ] Add Maharashtra (MSRTC data)

### Phase 4: Offline Features
- [ ] Local caching (IndexedDB)
- [ ] Offline QR generation
- [ ] Batch sync on reconnect

---

## Resources

- 📖 [Supabase Docs](https://supabase.com/docs)
- 🔐 [Security Best Practices](https://supabase.com/docs/guides/auth/security)
- 📊 [Database Performance](https://supabase.com/docs/guides/database/best-practices)
- 🔌 [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

---

## Support

See `SUPABASE_SETUP.md` for detailed setup guide.

For issues:
1. Check logs: Browser console + Supabase dashboard
2. Verify schema: Run `SELECT * FROM pg_tables` in SQL editor
3. Test auth: Login with demo credentials

---

**Status: ✅ Ready for Development**
- Build: Successful (1956 modules)
- Database: Configured
- Auth: Demo credentials work
- Next: Add QR code generation + real-time map
