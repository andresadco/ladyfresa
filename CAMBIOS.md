# 🍓 Lady Fresa — Cambios en esta versión

## 🏗️ Reestructura: Resumen con 3 tabs (v4)

El Resumen ya no es un scroll infinito con 11 secciones revueltas. Ahora se separa en 3 pestañas y la pantalla "Dashboard" se eliminó (estaba duplicada).

### Tab 1 · 📊 Resumen
La vista de un vistazo. Solo lo importante:
- Balances grandes (Total + En caja) y mini-cards (Ventas/Recolectado/Efectivo/Otros) siempre arriba
- Alertas (créditos pendientes, efectivo sin recolectar, faltantes)
- **NUEVO: Comparación con mes anterior** (ventas y gastos con ▲▼ %)
- **NUEVO: Top 3 categorías** con barras
- Botones de acceso rápido a los otros tabs

### Tab 2 · 💸 Gastos
Todo el detalle de gastos en un solo lugar:
- Desglose por método de pago (efectivo / mercado pago / tarjeta / etc) con barras
- Buscador
- Filtros: categoría, persona, rango de fechas (colapsable)
- Indicador de filtros activos con botón "Limpiar"
- Lista completa de gastos

### Tab 3 · 💰 Cobranza
Toda la parte de recolecciones:
- Resumen del efectivo recolectado del mes + faltantes
- Desglose por persona con barras
- **NUEVO: Card de pendiente de recolectar** (cuántos días, cuánto efectivo)
- Notas de ventas (sin límite de 3, ahora muestra todas)
- **NUEVO: Lista de todas las recolecciones del mes** (tocable para ver detalle)

## 🗑️ Pantalla Dashboard eliminada

Era info duplicada de Resumen y Tendencias. Lo único único era la comparación con el mes anterior, que **se rescató** y ahora vive en el tab de Resumen.

Menú inferior pasó de 5 botones a 4:
- 📊 Resumen (con 3 tabs)
- 📉 Tendencias (gráficas de 6 meses)
- 📅 Historial (otros meses)
- 💰 Recolectar

## 💳 Separación efectivo vs tarjeta (sigue igual)

Tanto en Resumen como en Tendencias y el Excel.

## 📥 Excel

Sigue exportando todo: gastos completos, ventas, recolecciones — nada se pierde.

## ✅ Verificado

`vite build` compila sin errores.
