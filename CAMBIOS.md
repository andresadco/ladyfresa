# 🍓 Lady Fresa — v6.1: Categorías personalizables (HOTFIX)

## Cambio crítico (v6.1)
Arreglado bug donde la vista de "detalle de un mes" (Historial → tocar mes) tenía una variable local `cats` que ocultaba el estado global, rompiendo el render. Ahora se llama `catTot` (totales por categoría).

## v6.0: Categorías personalizables

Las **11 categorías hardcoded** ahora viven en una tabla de Supabase y se administran desde la app.

### En la barra superior (sólo admins)
- **⚙️ Sucursales** (antes era "Admin")
- **📂 Categorías** (nuevo)

### Panel de Categorías
- Lista por sucursal (Todas / 🌐 Globales / cada sucursal)
- Cada categoría muestra: emoji, nombre, color, ámbito (Global o sucursal), cuántos gastos usa
- ✏️ Editar | ⏸ Desactivar | 🗑 Eliminar (sólo si no tiene gastos)

### Crear nueva categoría
- Nombre + clave técnica autogenerada
- 50+ emojis, 24 colores
- Ámbito: 🌐 Global o sólo una sucursal

### Migración aplicada por mí en Supabase
- Tabla `categorias` con 22 entradas (11 originales + 11 nuevas: Nómina, Renta, Mobiliario, Servicios Pro, Servicios, Permisos, Transporte, Compras varias, Ferretería, Consumo empleados, Caja chica)
- 114 gastos reclasificados de "Otros" a sus categorías reales

### Implementación técnica
- `CATS` (constante) → `cats` (estado de Supabase, con `CATS_DEFAULT` como fallback)
- `exportExcel` y `GastoRow` reciben `cats` como prop
- Realtime: canal "c-*" escucha cambios en `categorias`

## ✅ Verificado
- `vite build` compila sin errores
- Renderiza el splash inicial en entorno JSDOM sin errores de runtime
