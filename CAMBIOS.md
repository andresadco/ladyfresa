# 🍓 Lady Fresa — v6: Categorías personalizables

## Qué hay nuevo

Las **11 categorías hardcoded** ahora viven en una tabla de Supabase y se administran desde la app.

## Cambios visibles

### En la barra superior (sólo admins)
La sucursal-bar ahora tiene dos botones:
- **⚙️ Sucursales** (antes era sólo "Admin")
- **📂 Categorías** (nuevo)

### Panel de Categorías
- Lista todas las categorías con buscador por sucursal (Todas / 🌐 Globales / cada sucursal)
- Cada categoría muestra: emoji, nombre, color, ámbito (🌐 Global o sucursal específica), cuántos gastos la usan
- ✏️ Editar: cambiar nombre, emoji, color, orden, ámbito y activación
- ⏸ Desactivar: deja de aparecer en formularios nuevos pero queda en reportes históricos
- 🗑 Eliminar: sólo si no tiene ningún gasto vinculado

### Crear nueva categoría
- Nombre y "clave técnica" (autogenerada del nombre)
- 50+ emojis a elegir
- 24 colores
- **Ámbito:** 🌐 Todas las sucursales (global) o sólo una específica
- Ejemplo: "Renta" como categoría sólo para Balbuena (porque sólo Balbuena paga renta)

### Formulario de gasto
- El selector de categoría ahora muestra:
  - Todas las globales
  - Las específicas de la sucursal seleccionada en ese gasto
- Las categorías inactivas no aparecen (excepto si ya está seleccionada en el gasto que estás editando)

## Migración de base de datos

YA APLICADA en producción el 2026-05-25. El archivo `MIGRACION_CATEGORIAS.sql` queda como referencia.

Lo que hace:
- Crea tabla `categorias` con `cat_key` único (global o por sucursal)
- Carga las 11 categorías originales como globales
- Los 369 gastos existentes siguen funcionando (los `cat_key` viejos coinciden con los nuevos)

## Implementación técnica

- `CATS` (constante) → `cats` (estado de Supabase, con `CATS_DEFAULT` como fallback)
- Nuevos helpers: `catRowToObj` para convertir filas de BD al shape interno
- `exportExcel` ahora recibe `cats` como argumento (default = `CATS_DEFAULT`)
- `GastoRow` recibe `cats` como prop
- Realtime: el canal "c-*" escucha cambios en `categorias` y refresca todos los dispositivos

## Por qué "otros" sigue siendo el #1 de gasto

Tienes $210K en "Otros" (31% del total). Ahora puedes empezar a categorizarlo mejor: por ejemplo crear "Renta", "Sueldos", "Servicios" globales, o categorías específicas como "Mantenimiento Balbuena". Los gastos viejos se pueden editar uno por uno para reclasificarlos.

## ✅ Verificado

`vite build` compila sin errores.
