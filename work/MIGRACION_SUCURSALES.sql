-- 🍓 Lady Fresa — Migración multi-sucursal
-- Ejecuta esto en Supabase → SQL Editor → New Query
-- Una sola vez.

-- ─────────────────────────────────────────────────────────────
-- 1) Tabla de sucursales (catálogo)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sucursales (
  id          BIGSERIAL PRIMARY KEY,
  nombre      TEXT NOT NULL UNIQUE,
  emoji       TEXT DEFAULT '🍓',
  color       TEXT DEFAULT '#E8175D',
  activa      BOOLEAN DEFAULT TRUE,
  orden       INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Permitir lectura/escritura (anon role) — sigue el mismo modelo que las otras tablas
ALTER TABLE sucursales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sucursales_all ON sucursales;
CREATE POLICY sucursales_all ON sucursales FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Sembrar las dos sucursales actuales si la tabla está vacía
INSERT INTO sucursales (nombre, emoji, color, orden)
SELECT 'Balbuena', '🍓', '#E8175D', 1
WHERE NOT EXISTS (SELECT 1 FROM sucursales);

INSERT INTO sucursales (nombre, emoji, color, orden)
SELECT 'Del Valle', '🍦', '#1565C0', 2
WHERE NOT EXISTS (SELECT 1 FROM sucursales WHERE nombre = 'Del Valle');

-- ─────────────────────────────────────────────────────────────
-- 2) Agregar sucursal_id a las 3 tablas de movimientos
-- ─────────────────────────────────────────────────────────────
ALTER TABLE gastos         ADD COLUMN IF NOT EXISTS sucursal_id BIGINT REFERENCES sucursales(id);
ALTER TABLE ventas         ADD COLUMN IF NOT EXISTS sucursal_id BIGINT REFERENCES sucursales(id);
ALTER TABLE recolecciones  ADD COLUMN IF NOT EXISTS sucursal_id BIGINT REFERENCES sucursales(id);

-- ─────────────────────────────────────────────────────────────
-- 3) Backfill: los movimientos existentes quedan asignados
--    a la primera sucursal (Balbuena). Si necesitás moverlos
--    después, lo hacés desde la app (función futura) o por SQL.
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  default_id BIGINT;
BEGIN
  SELECT id INTO default_id FROM sucursales ORDER BY orden, id LIMIT 1;
  IF default_id IS NOT NULL THEN
    UPDATE gastos        SET sucursal_id = default_id WHERE sucursal_id IS NULL;
    UPDATE ventas        SET sucursal_id = default_id WHERE sucursal_id IS NULL;
    UPDATE recolecciones SET sucursal_id = default_id WHERE sucursal_id IS NULL;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 4) Constraint UNIQUE en ventas: ahora (fecha, sucursal_id)
--    en lugar de solo fecha. Cada sucursal puede tener su
--    venta diaria sin pisar la de otra.
-- ─────────────────────────────────────────────────────────────
-- Quitar constraint vieja si existe (probamos los nombres más comunes)
DO $$
BEGIN
  -- Quitar unique constraint que solo usa "fecha"
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'ventas' AND c.contype = 'u'
      AND pg_get_constraintdef(c.oid) ILIKE '%(fecha)%'
      AND pg_get_constraintdef(c.oid) NOT ILIKE '%sucursal%'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE ventas DROP CONSTRAINT ' || c.conname
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      WHERE t.relname = 'ventas' AND c.contype = 'u'
        AND pg_get_constraintdef(c.oid) ILIKE '%(fecha)%'
        AND pg_get_constraintdef(c.oid) NOT ILIKE '%sucursal%'
      LIMIT 1
    );
  END IF;

  -- Quitar UNIQUE INDEX que solo usa "fecha"
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'ventas' AND indexdef ILIKE '%UNIQUE%'
      AND indexdef ILIKE '%(fecha)%'
      AND indexdef NOT ILIKE '%sucursal%'
  ) THEN
    EXECUTE (
      SELECT 'DROP INDEX IF EXISTS ' || indexname
      FROM pg_indexes
      WHERE tablename = 'ventas' AND indexdef ILIKE '%UNIQUE%'
        AND indexdef ILIKE '%(fecha)%'
        AND indexdef NOT ILIKE '%sucursal%'
      LIMIT 1
    );
  END IF;
END $$;

-- Crear el nuevo unique compuesto
CREATE UNIQUE INDEX IF NOT EXISTS ventas_fecha_sucursal_uq
  ON ventas (fecha, sucursal_id);

-- ─────────────────────────────────────────────────────────────
-- 5) Índices para acelerar filtros por sucursal
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS gastos_sucursal_idx        ON gastos(sucursal_id);
CREATE INDEX IF NOT EXISTS ventas_sucursal_idx        ON ventas(sucursal_id);
CREATE INDEX IF NOT EXISTS recolecciones_sucursal_idx ON recolecciones(sucursal_id);

-- Listo ✅
-- Verifica con:
--   SELECT * FROM sucursales ORDER BY orden;
--   SELECT count(*) FROM gastos WHERE sucursal_id IS NULL;  -- debe ser 0
