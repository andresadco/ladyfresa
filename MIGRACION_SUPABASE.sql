-- 🍓 Lady Fresa — Migración para Apolo
-- Ejecuta esto en Supabase → SQL Editor → New Query

-- Agrega columna de aprobación a la tabla recolecciones
ALTER TABLE recolecciones 
  ADD COLUMN IF NOT EXISTS aprobada BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS aprobada_por TEXT DEFAULT 'auto';

-- Las recolecciones existentes se marcan como aprobadas automáticamente
UPDATE recolecciones SET aprobada = TRUE, aprobada_por = 'auto' WHERE aprobada IS NULL;

-- Listo ✅
