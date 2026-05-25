-- 🍓 Lady Fresa — Migración: Categorías personalizables
-- YA APLICADA en producción el 2026-05-25.
-- Este archivo queda como referencia/documentación.

CREATE TABLE IF NOT EXISTS categorias (
  id          BIGSERIAL PRIMARY KEY,
  cat_key     TEXT NOT NULL,
  nombre      TEXT NOT NULL,
  emoji       TEXT DEFAULT '📦',
  color       TEXT DEFAULT '#546E7A',
  activa      BOOLEAN DEFAULT TRUE,
  orden       INTEGER DEFAULT 0,
  sucursal_id BIGINT REFERENCES sucursales(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS categorias_global_uq
  ON categorias (cat_key) WHERE sucursal_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS categorias_sucursal_uq
  ON categorias (cat_key, sucursal_id) WHERE sucursal_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS categorias_sucursal_idx ON categorias(sucursal_id);

ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS categorias_all ON categorias;
CREATE POLICY categorias_all ON categorias FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Las 11 categorías globales por defecto (ya sembradas)
INSERT INTO categorias (cat_key, nombre, emoji, color, orden, sucursal_id) VALUES
  ('fruta',       'Fruta Fresca',     '🍓', '#E8175D', 1,  NULL),
  ('lacteos',     'Lácteos y Cremas', '🥛', '#1565C0', 2,  NULL),
  ('chocolate',   'Chocolate',        '🍫', '#4E342E', 3,  NULL),
  ('toppings',    'Toppings / Compl.','🍯', '#E65100', 4,  NULL),
  ('torani',      'Jarabes Torani',   '🧃', '#00796B', 5,  NULL),
  ('azucar',      'Azúcar / Endulz.', '🍬', '#F57F17', 6,  NULL),
  ('bebidas',     'Bebidas y Varios', '☕', '#5D4037', 7,  NULL),
  ('desechables', 'Desechables',      '🥤', '#6A1B9A', 8,  NULL),
  ('publicidad',  'Publicidad',       '📢', '#C62828', 9,  NULL),
  ('limpieza',    'Limpieza',         '🧹', '#2E7D32', 10, NULL),
  ('otros',       'Otros',            '📦', '#546E7A', 11, NULL)
ON CONFLICT DO NOTHING;
