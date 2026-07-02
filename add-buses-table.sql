-- ============================================================
-- BUSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS buses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_number TEXT UNIQUE NOT NULL,
  route_id TEXT NOT NULL REFERENCES routes(id),
  conductor_id UUID REFERENCES conductors(id),
  bus_type TEXT NOT NULL DEFAULT 'intercity', -- 'local', 'intercity', 'deluxe', 'sleeper'
  capacity INTEGER NOT NULL DEFAULT 50,
  current_passengers INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available', -- 'available', 'on-duty', 'maintenance'
  registration_date DATE,
  last_service_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_buses_route ON buses(route_id);
CREATE INDEX idx_buses_conductor ON buses(conductor_id);
CREATE INDEX idx_buses_status ON buses(status);
CREATE INDEX idx_buses_number ON buses(bus_number);

-- ============================================================
-- ADD BUSES COLUMN TO CONDUCTOR_SESSIONS
-- ============================================================
ALTER TABLE conductor_sessions ADD COLUMN bus_id UUID REFERENCES buses(id) DEFAULT NULL;

-- ============================================================
-- SEED DATA - BUSES (30 sample buses)
-- ============================================================
INSERT INTO buses (bus_number, route_id, bus_type, capacity, status, registration_date, last_service_date) VALUES
-- VJA-VZG Express (6 buses)
('AP-29-AB-0001', 'vja-vzg-001', 'intercity', 52, 'available', '2023-01-15', '2026-06-28'),
('AP-29-AB-0002', 'vja-vzg-001', 'intercity', 52, 'available', '2023-02-20', '2026-06-27'),
('AP-29-AB-0003', 'vja-vzg-001', 'deluxe', 45, 'available', '2023-03-10', '2026-06-26'),
('AP-29-AB-0004', 'vja-vzg-001', 'intercity', 52, 'maintenance', '2022-11-05', '2026-06-20'),
('AP-29-AB-0005', 'vja-vzg-001', 'intercity', 52, 'available', '2023-05-12', '2026-06-25'),
('AP-29-AB-0006', 'vja-vzg-001', 'sleeper', 40, 'available', '2023-06-18', '2026-06-28'),

-- VJA-GNT Local (4 buses)
('AP-29-AC-0001', 'vja-gnt-001', 'local', 60, 'available', '2022-08-10', '2026-06-28'),
('AP-29-AC-0002', 'vja-gnt-001', 'local', 60, 'available', '2022-09-15', '2026-06-27'),
('AP-29-AC-0003', 'vja-gnt-001', 'local', 60, 'available', '2022-10-20', '2026-06-26'),
('AP-29-AC-0004', 'vja-gnt-001', 'local', 60, 'available', '2022-11-25', '2026-06-28'),

-- VJA-TPT Deluxe (3 buses)
('AP-29-AD-0001', 'vja-tpt-001', 'deluxe', 45, 'available', '2023-04-05', '2026-06-28'),
('AP-29-AD-0002', 'vja-tpt-001', 'deluxe', 45, 'available', '2023-05-10', '2026-06-27'),
('AP-29-AD-0003', 'vja-tpt-001', 'intercity', 52, 'available', '2023-06-15', '2026-06-26'),

-- VJA-RAJ City Link (3 buses)
('AP-29-AE-0001', 'vja-raj-001', 'intercity', 52, 'available', '2023-02-08', '2026-06-28'),
('AP-29-AE-0002', 'vja-raj-001', 'intercity', 52, 'available', '2023-03-12', '2026-06-27'),
('AP-29-AE-0003', 'vja-raj-001', 'local', 60, 'available', '2023-04-20', '2026-06-28'),

-- VSP-KKD Express (2 buses)
('AP-07-AK-0001', 'vzg-kkd-001', 'intercity', 52, 'available', '2023-01-25', '2026-06-28'),
('AP-07-AK-0002', 'vzg-kkd-001', 'intercity', 52, 'available', '2023-02-28', '2026-06-27'),

-- VSP-SKL Local (2 buses)
('AP-07-AL-0001', 'vzg-skl-001', 'local', 60, 'available', '2022-12-10', '2026-06-28'),
('AP-07-AL-0002', 'vzg-skl-001', 'local', 60, 'available', '2023-01-15', '2026-06-27'),

-- VSP-RAJ Shuttle (2 buses)
('AP-07-AM-0001', 'vzg-raj-001', 'local', 60, 'available', '2023-03-05', '2026-06-28'),
('AP-07-AM-0002', 'vzg-raj-001', 'local', 60, 'available', '2023-04-10', '2026-06-27'),

-- GNT-NLR Express (2 buses)
('AP-24-AN-0001', 'gnt-nlr-001', 'intercity', 52, 'available', '2023-02-14', '2026-06-28'),
('AP-24-AN-0002', 'gnt-nlr-001', 'intercity', 52, 'available', '2023-03-20', '2026-06-27'),

-- GNT-ONG Local (1 bus)
('AP-24-AO-0001', 'gnt-ong-001', 'local', 60, 'available', '2023-05-08', '2026-06-28'),

-- TPT-NLR Express (1 bus)
('AP-19-AP-0001', 'tpt-nlr-001', 'intercity', 52, 'available', '2023-04-12', '2026-06-28')

ON CONFLICT (bus_number) DO NOTHING;

-- ============================================================
-- UPDATE updated_at TRIGGER FOR BUSES
-- ============================================================
CREATE TRIGGER update_buses_updated_at BEFORE UPDATE ON buses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- UPDATE VIEWS
-- ============================================================
DROP VIEW IF EXISTS active_sessions_with_location CASCADE;

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
  l.timestamp as last_location_update,
  b.bus_type,
  b.capacity,
  b.current_passengers
FROM conductor_sessions s
JOIN routes r ON s.route_id = r.id
JOIN cities c_from ON s.origin_id = c_from.id
JOIN cities c_to ON s.destination_id = c_to.id
LEFT JOIN location_pings l ON s.id = l.session_id
LEFT JOIN buses b ON s.bus_id = b.id
WHERE s.is_active = TRUE
ORDER BY l.timestamp DESC;
