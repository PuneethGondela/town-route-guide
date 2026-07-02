-- ============================================================
-- NAA TRANSIT DATABASE SCHEMA
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- CITIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS cities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  aliases TEXT[] NOT NULL DEFAULT '{}',
  station TEXT NOT NULL,
  lat DECIMAL(10, 7) NOT NULL,
  lon DECIMAL(10, 7) NOT NULL,
  district TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'osm',
  verified_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ROUTES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS routes (
  id TEXT PRIMARY KEY,
  origin_id TEXT NOT NULL REFERENCES cities(id),
  destination_id TEXT NOT NULL REFERENCES cities(id),
  name TEXT NOT NULL,
  distance_km DECIMAL(6, 2) NOT NULL,
  duration TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'apsrtc-schedule',
  verified_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_routes_origin ON routes(origin_id);
CREATE INDEX idx_routes_destination ON routes(destination_id);

-- ============================================================
-- CONDUCTORS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS conductors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  bus_number TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conductors_employee_id ON conductors(employee_id);

-- ============================================================
-- CONDUCTOR SESSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS conductor_sessions (
  id TEXT PRIMARY KEY,
  conductor_id UUID NOT NULL REFERENCES conductors(id),
  conductor_name TEXT NOT NULL,
  bus_number TEXT NOT NULL,
  route_id TEXT NOT NULL REFERENCES routes(id),
  origin_id TEXT NOT NULL REFERENCES cities(id),
  destination_id TEXT NOT NULL REFERENCES cities(id),
  start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_conductor ON conductor_sessions(conductor_id);
CREATE INDEX idx_sessions_active ON conductor_sessions(is_active);
CREATE INDEX idx_sessions_bus ON conductor_sessions(bus_number);

-- ============================================================
-- LOCATION PINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS location_pings (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES conductor_sessions(id),
  lat DECIMAL(10, 7) NOT NULL,
  lon DECIMAL(10, 7) NOT NULL,
  accuracy DECIMAL(6, 2),
  crowd_status TEXT NOT NULL DEFAULT 'low' CHECK (crowd_status IN ('low', 'medium', 'full')),
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pings_session ON location_pings(session_id);
CREATE INDEX idx_pings_timestamp ON location_pings(timestamp);
-- Composite index for geographic queries (lat/lon proximity searches)
CREATE INDEX idx_pings_location ON location_pings(lat, lon);

-- ============================================================
-- TICKETS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES conductor_sessions(id),
  bus_number TEXT NOT NULL,
  route_id TEXT NOT NULL REFERENCES routes(id),
  passenger_name TEXT NOT NULL,
  seat_number TEXT,
  boarding_stop TEXT NOT NULL,
  alighting_stop TEXT NOT NULL,
  fare DECIMAL(8, 2) NOT NULL,
  issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tickets_session ON tickets(session_id);
CREATE INDEX idx_tickets_passenger ON tickets(passenger_name);
CREATE INDEX idx_tickets_valid_until ON tickets(valid_until);
CREATE INDEX idx_tickets_is_used ON tickets(is_used);

-- ============================================================
-- AUDIT LOG TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT REFERENCES conductor_sessions(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_session ON audit_logs(session_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE conductors ENABLE ROW LEVEL SECURITY;
ALTER TABLE conductor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_pings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Allow public read on cities and routes
ALTER TABLE cities DISABLE ROW LEVEL SECURITY;
ALTER TABLE routes DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE conductor_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE location_pings;
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;

-- ============================================================
-- SEED DATA - CONDUCTORS
-- ============================================================
INSERT INTO conductors (employee_id, password, name, verified) VALUES
('EMP-0001', 'password123', 'Ramakrishna Reddy', TRUE),
('EMP-0002', 'password123', 'Srinivas Kumar', TRUE),
('EMP-0003', 'password123', 'Venkateswaran', TRUE)
ON CONFLICT (employee_id) DO NOTHING;

-- ============================================================
-- SEED DATA - CITIES (AP)
-- ============================================================
INSERT INTO cities (id, name, aliases, station, lat, lon, district, source, verified_at) VALUES
('vja', 'Vijayawada', '{"vijayawada","bzv","bezawada","pnbs"}', 'Pandit Nehru Bus Station', 16.5087763, 80.6157130, 'NTR', 'osm', '2026-07-02'),
('tpt', 'Tirupati', '{"tirupati","tirumala","alipiri"}', 'APSRTC Bus Station, STV Nagar', 13.6294117, 79.4261708, 'Tirupati', 'osm', '2026-07-02'),
('vzg', 'Visakhapatnam', '{"vizag","vsp","visakhapatnam","vskp"}', 'APSRTC Dwaraka Bus Station', 17.7238639, 83.3068879, 'Visakhapatnam', 'osm', '2026-07-02'),
('gnt', 'Guntur', '{"guntur","gnt"}', 'NTR Bus Stand Guntur', 16.2960394, 80.4565729, 'Guntur', 'osm', '2026-07-02'),
('nlr', 'Nellore', '{"nellore","nlr"}', 'APSRTC P.S.R Bus Station', 14.4570626, 79.9896024, 'Nellore', 'osm', '2026-07-02'),
('krn', 'Kurnool', '{"kurnool","krn"}', 'APSRTC Kurnool Bus Station', 15.8240007, 78.0278284, 'Kurnool', 'osm', '2026-07-02'),
('kkd', 'Kakinada', '{"kakinada","kkd"}', 'APSRTC Kakinada Bus Station', 16.9657252, 82.2394027, 'Kakinada', 'osm', '2026-07-02'),
('skl', 'Srikakulam', '{"srikakulam","skl","ckl"}', 'APSRTC Srikakulam Bus Station', 18.3092485, 83.8932628, 'Srikakulam', 'osm', '2026-07-02'),
('elu', 'Eluru', '{"eluru"}', 'APSRTC New Bus Station Eluru', 16.7075172, 81.0900178, 'West Godavari', 'osm', '2026-07-02'),
('raj', 'Rajahmundry', '{"rajahmundry","rajamahendravaram"}', 'APSRTC Rajamahendravaram Bus Station', 17.0012369, 81.7897446, 'East Godavari', 'osm', '2026-07-02'),
('kdp', 'Kadapa', '{"kadapa","cuddapah"}', 'APSRTC Kadapa Bus Station', 14.4646919, 78.8313184, 'YSR Kadapa', 'osm', '2026-07-02'),
('ant', 'Anantapur', '{"anantapur"}', 'APSRTC Anantapur Bus Station', 14.6853003, 77.5999633, 'Anantapur', 'osm', '2026-07-02'),
('ong', 'Ongole', '{"ongole"}', 'APSRTC Ongole Bus Station', 15.5112042, 80.0418439, 'Prakasam', 'osm', '2026-07-02'),
('vzm', 'Vizianagaram', '{"vizianagaram"}', 'APSRTC Vizianagaram Bus Station', 18.1084074, 83.3984074, 'Vizianagaram', 'osm', '2026-07-02'),
('ctt', 'Chittoor', '{"chittoor"}', 'APSRTC Chittoor Bus Station', 13.2194990, 79.1053120, 'Chittoor', 'osm', '2026-07-02'),
('ndy', 'Nandyal', '{"nandyal"}', 'APSRTC Nandyal Bus Station', 15.4903444, 78.4794381, 'Nandyal', 'osm', '2026-07-02')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DATA - ROUTES (20 sample routes)
-- ============================================================
INSERT INTO routes (id, origin_id, destination_id, name, distance_km, duration, source, verified_at) VALUES
('vja-vzg-001', 'vja', 'vzg', 'VJA-VZG Express', 350, '6h 15m', 'apsrtc-schedule', '2026-06-28'),
('vja-gnt-001', 'vja', 'gnt', 'VJA-GNT Local', 65, '1h 45m', 'apsrtc-schedule', '2026-06-28'),
('vja-tpt-001', 'vja', 'tpt', 'VJA-TPT Deluxe', 410, '7h 30m', 'apsrtc-schedule', '2026-06-28'),
('vja-raj-001', 'vja', 'raj', 'VJA-RAJ City Link', 290, '5h 20m', 'apsrtc-schedule', '2026-06-28'),
('vzg-kkd-001', 'vzg', 'kkd', 'VSP-KKD Express', 140, '3h 00m', 'apsrtc-schedule', '2026-06-28'),
('vzg-skl-001', 'vzg', 'skl', 'VSP-SKL Local', 110, '2h 45m', 'apsrtc-schedule', '2026-06-28'),
('vzg-raj-001', 'vzg', 'raj', 'VSP-RAJ Shuttle', 180, '3h 30m', 'apsrtc-schedule', '2026-06-28'),
('gnt-nlr-001', 'gnt', 'nlr', 'GNT-NLR Express', 185, '3h 45m', 'apsrtc-schedule', '2026-06-28'),
('gnt-ong-001', 'gnt', 'ong', 'GNT-ONG Local', 95, '2h 15m', 'apsrtc-schedule', '2026-06-28'),
('tpt-nlr-001', 'tpt', 'nlr', 'TPT-NLR Express', 90, '2h 00m', 'apsrtc-schedule', '2026-06-28'),
('tpt-ctt-001', 'tpt', 'ctt', 'TPT-CTT Local', 85, '2h 15m', 'apsrtc-schedule', '2026-06-28'),
('tpt-kdp-001', 'tpt', 'kdp', 'TPT-KDP Express', 140, '3h 00m', 'apsrtc-schedule', '2026-06-28'),
('kkd-raj-001', 'kkd', 'raj', 'KKD-RAJ Local', 60, '1h 30m', 'apsrtc-schedule', '2026-06-28'),
('kkd-elu-001', 'kkd', 'elu', 'KKD-ELU Express', 225, '4h 30m', 'apsrtc-schedule', '2026-06-28'),
('nlr-kdp-001', 'nlr', 'kdp', 'NLR-KDP Local', 175, '3h 45m', 'apsrtc-schedule', '2026-06-28'),
('nlr-ctt-001', 'nlr', 'ctt', 'NLR-CTT Express', 130, '2h 45m', 'apsrtc-schedule', '2026-06-28'),
('krn-ant-001', 'krn', 'ant', 'KRN-ANT Local', 145, '3h 15m', 'apsrtc-schedule', '2026-06-28'),
('krn-ndy-001', 'krn', 'ndy', 'KRN-NDY Express', 105, '2h 30m', 'apsrtc-schedule', '2026-06-28'),
('skl-vzm-001', 'skl', 'vzm', 'SKL-VZM Local', 75, '1h 50m', 'apsrtc-schedule', '2026-06-28'),
('elu-raj-001', 'elu', 'raj', 'ELU-RAJ Express', 165, '3h 30m', 'apsrtc-schedule', '2026-06-28')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON cities
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conductors_updated_at BEFORE UPDATE ON conductors
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON conductor_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VIEWS FOR QUICK ACCESS
-- ============================================================

-- Active sessions with location details
CREATE OR REPLACE VIEW active_sessions_with_location AS
SELECT 
  s.id,
  s.conductor_name,
  s.bus_number,
  s.route_id,
  r.name as route_name,
  c_from.name as origin,
  c_to.name as destination,
  s.start_time,
  l.lat,
  l.lon,
  l.accuracy,
  l.crowd_status,
  l.timestamp as last_location_update
FROM conductor_sessions s
JOIN routes r ON s.route_id = r.id
JOIN cities c_from ON s.origin_id = c_from.id
JOIN cities c_to ON s.destination_id = c_to.id
LEFT JOIN location_pings l ON s.id = l.session_id
WHERE s.is_active = TRUE
ORDER BY l.timestamp DESC;

-- Ticket details with route info
CREATE OR REPLACE VIEW ticket_details AS
SELECT 
  t.id,
  t.passenger_name,
  t.bus_number,
  t.boarding_stop,
  t.alighting_stop,
  t.fare,
  t.issued_at,
  t.valid_until,
  t.is_used,
  s.conductor_name,
  r.name as route_name
FROM tickets t
JOIN conductor_sessions s ON t.session_id = s.id
JOIN routes r ON t.route_id = r.id;
