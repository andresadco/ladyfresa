# 🍓 Lady Fresa — Multi-sucursal (v5)

## 🎯 Resumen

La app ahora maneja **varias sucursales**. Cada gasto, venta y recolección está ligado a una sucursal. Hay panel admin para crear/editar/desactivar, filtro global, formularios con selector y comparación entre sucursales en el Resumen.

## 🗄️ Migración de base de datos (HACER UNA VEZ)

Antes de subir el código nuevo, ejecuta en **Supabase → SQL Editor**:
```
MIGRACION_SUCURSALES.sql
```
Esto crea la tabla `sucursales`, agrega `sucursal_id` a `gastos` / `ventas` / `recolecciones`, hace backfill (todo lo existente queda en "Balbuena") y cambia el UNIQUE de ventas a `(fecha, sucursal_id)` para que cada sucursal pueda registrar su venta diaria sin pisarse.

Verifica con:
```sql
SELECT * FROM sucursales ORDER BY orden;
SELECT count(*) FROM gastos WHERE sucursal_id IS NULL;  -- debe ser 0
```

## 🆕 Qué cambia en la app

### Pantalla de inicio
Aparece una **barra de sucursales** debajo del header con chips: `🌐 Todas | 🍓 Balbuena | 🍦 Del Valle | … | ⚙️ Admin`. El chip seleccionado se persiste en localStorage. En el hero del usuario admin se muestra un badge con la sucursal activa.

### Formularios (Gasto / Venta / Recolección)
Cada formulario tiene arriba un selector **"📍 Sucursal"** con chips de colores. El botón "Guardar" se deshabilita hasta que elijas una. Si tienes una sucursal activa global, el formulario llega ya rellenado con ella; siempre la puedes cambiar.

### Recolección
Ahora **requiere elegir sucursal primero**. Solo se muestran los días pendientes de **esa** sucursal. Cada sucursal lleva su propio efectivo: la pantalla calcula pendientes según `(fecha, sucursal)`, no por fecha sola.

### Resumen
- Las cards y barras siguen funcionando, pero filtran por la sucursal activa.
- Cuando estás en "🌐 Todas" y hay 2+ sucursales con movimientos, aparece una nueva sección **"🏪 Comparativa entre sucursales"** con barras de Ventas/Gastos/Balance/Recolectado/Pendiente por sucursal. Cada fila es clickeable para entrar al detalle de esa sucursal.

### Tendencias e Historial
También respetan el filtro de sucursal activa.

### Listados
- Cada `GastoRow` muestra un badge con la sucursal cuando estás viendo "Todas" (no aparece cuando ya estás filtrado a una).
- Lo mismo aplica a las recolecciones en el Resumen y en la pantalla de Recolección.

### Excel
Cada hoja del Excel (Gastos / Ventas / Recolecciones) ahora tiene la columna **Sucursal**. Cuando estás viendo "Todas", el archivo incluye una hoja extra **"Por Sucursal"** con totales de gastos por sucursal y porcentajes. El nombre del archivo incluye el sufijo de la sucursal cuando filtras una específica.

### Panel admin (solo Andres y José Luis)
Botón **⚙️ Admin** al final de la barra de sucursales. Permite:
- ➕ Crear nuevas sucursales (nombre, emoji, color, orden, estado)
- ✏️ Editar las existentes
- ⏸ Desactivar (siguen apareciendo en reportes pero no en formularios de captura nuevos)
- 🗑 Eliminar (solo si no tiene movimientos asociados)

## ⚙️ Detalle técnico de la lógica de pendientes

El cálculo del efectivo pendiente cambió de forma sutil: antes era "cualquier fecha con venta que no esté en `fechas_cubiertas` de alguna recolección". Ahora es **por (fecha, sucursal_id)**, es decir: una venta del 5 de mayo en Balbuena está pendiente solo si no hay una recolección de Balbuena que cubra ese 5 de mayo. Si en Del Valle hay una recolección del 5 de mayo no afecta a Balbuena.

## ✅ Verificado

`vite build` compila sin errores.
