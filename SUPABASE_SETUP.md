# Supabase Setup Guide for Naa Transit

## 1. Environment Variables Setup

Your `.env.local` is already configured with Supabase credentials:

```


## 2. Database Schema Migration

### Option A: Using Supabase Dashboard (Recommended for UI)

1. Go to https://app.supabase.com and log in
2. Select your project: `town-route-guide`
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy and paste the entire contents of `supabase-schema.sql` from your project root
6. Click **Run**

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref swgihoojfdjjcmhdwzuh

# Run migrations
supabase db push < supabase-schema.sql
```

## 3. Verify Setup

After running the migrations, verify the tables are created:

1. Go to Supabase Dashboard → **Table Editor**
2. You should see these tables:
   - `cities` (16 AP cities pre-populated)
   - `routes` (20 sample routes pre-populated)
   - `conductors` (3 demo conductors pre-populated)
   - `conductor_sessions`
   - `location_pings`
   - `tickets`
   - `audit_logs`

## 4. Test Conductor Login

### Demo Credentials

Use these to test the conductor app at `/conductor`:

- **Employee ID:** `EMP-0001`
- **Password:** `password123`

Or:
- **Employee ID:** `EMP-0002`
- **Password:** `password123`

Or:
- **Employee ID:** `EMP-0003`
- **Password:** `password123`

## 5. Real-time Features

The schema includes real-time table subscriptions for:
- `conductor_sessions` — Live trip start/end events
- `location_pings` — Real-time GPS location updates
- `tickets` — Ticket generation events

To enable WebSocket subscriptions in your frontend:

```typescript
import { supabase } from '@/lib/supabase.server';

const subscription = supabase
  .channel('public:location_pings')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'location_pings',
    },
    (payload) => {
      console.log('New location ping:', payload.new);
    }
  )
  .subscribe();
```

## 6. Database Structure

### conductors
- `id` (UUID): Primary key
- `employee_id` (TEXT): Unique employee identifier
- `password` (TEXT): Hashed password (⚠️ should use bcrypt in production)
- `name` (TEXT): Conductor name
- `verified` (BOOLEAN): Verification status

### conductor_sessions
- `id` (TEXT): Session ID
- `conductor_id` (UUID): Foreign key to conductors
- `bus_number` (TEXT): Bus registration number
- `route_id` (TEXT): Foreign key to routes
- `origin_id`, `destination_id` (TEXT): City references
- `start_time`, `end_time` (TIMESTAMP): Trip duration
- `is_active` (BOOLEAN): Active trip flag

### location_pings
- `id` (TEXT): Ping ID
- `session_id` (TEXT): Foreign key to conductor_sessions
- `lat`, `lon` (DECIMAL): GPS coordinates
- `accuracy` (DECIMAL): GPS accuracy in meters
- `crowd_status` (TEXT): 'low' | 'medium' | 'full'
- `timestamp` (TIMESTAMP): When ping was recorded

### tickets
- `id` (TEXT): Unique ticket ID
- `session_id` (TEXT): Foreign key to conductor_sessions
- `bus_number` (TEXT): Bus number
- `passenger_name` (TEXT): Passenger name
- `boarding_stop`, `alighting_stop` (TEXT): Route stops
- `fare` (DECIMAL): Ticket fare
- `issued_at`, `valid_until` (TIMESTAMP): Validity window
- `is_used` (BOOLEAN): Used/scanned status

### cities
- Pre-populated with 16 Andhra Pradesh cities
- Each includes: name, aliases, station, lat/lon, district, source, verified_at

### routes
- Pre-populated with 20 sample inter-city routes
- Each includes: route ID, origin/destination, distance, duration, source, verified_at

## 7. Security Checklist for Production

- [ ] Use bcrypt or Argon2 for password hashing (don't store plain text)
- [ ] Enable Row Level Security (RLS) policies:
  - Conductors can only see/update their own sessions
  - Passengers can view public ticket info
- [ ] Use Supabase Auth for JWT-based authentication instead of password
- [ ] Rotate `SUPABASE_SECRET_KEY` regularly
- [ ] Enable SSL/TLS for all connections
- [ ] Add rate limiting on authentication endpoints
- [ ] Audit logs retention policy (currently unlimited)

## 8. Scaling for Multiple States

When adding new states:

1. **Add new cities** to `cities` table:
```sql
INSERT INTO cities (id, name, aliases, station, lat, lon, district, source, verified_at)
VALUES ('dlh', 'Delhi', '{"delhi","dli"}', 'ISBT Kashmere Gate', 28.6328, 77.2197, 'Delhi', 'osm', CURRENT_DATE);
```

2. **Add routes** between those cities:
```sql
INSERT INTO routes (id, origin_id, destination_id, name, distance_km, duration, source, verified_at)
VALUES ('dlh-agr-001', 'dlh', 'agr', 'DLH-AGR Express', 240, '4h 30m', 'apsrtc-schedule', CURRENT_DATE);
```

3. **Add conductor accounts** as needed:
```sql
INSERT INTO conductors (employee_id, password, name, verified)
VALUES ('EMP-0004', 'hashed_password_here', 'New Conductor', TRUE);
```

## 9. Data Backup

### Automatic Backups
Supabase automatically backs up your database daily. To restore:
1. Go to Supabase Dashboard → **Backups**
2. Select a backup point
3. Click **Restore**

### Manual Backups
Export data via SQL:
```bash
pg_dump -h swgihoojfdjjcmhdwzuh.supabase.co -U postgres -d postgres > backup.sql
```

## 10. Troubleshooting

### "Connection refused" error
- Verify Supabase project is running
- Check internet connection
- Confirm credentials in `.env.local`

### "Row Level Security" policy errors
- Run migrations again to ensure all policies are created
- Check that your user has `authenticated` role

### Realtime subscriptions not updating
- Verify `REALTIME_DB_MAX_ROWS` setting in Supabase dashboard
- Check browser console for WebSocket errors
- Ensure table is in `supabase_realtime` publication

---

**Questions?** Check [Supabase Docs](https://supabase.com/docs) or the [API Reference](https://supabase.com/docs/reference/javascript/introduction)
