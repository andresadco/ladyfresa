# 🍓 Lady Fresa — Cambios en esta versión

## 💳 Separación efectivo vs tarjeta

Ahora todos los gastos se cuentan en el balance, pero **ves los dos números por separado** para saber qué está en caja y qué fue por tarjeta/transferencia.

### En la pantalla de **Resumen**:

- **Balance del mes** (grande, arriba) → sigue siendo Ventas − Todos los gastos
- **💵 Solo efectivo** (chip debajo del balance) → Ventas − Gastos en efectivo. Esto es lo que realmente queda en la caja.
- **Bloque de abajo del hero** → ya no muestra Ventas/Gastos/Recolect; ahora muestra **Ventas / Gastos Efectivo / Gastos Otros**.
- **Nueva sección "💳 Gastos por método de pago"** → desglose visual con barras de cada forma (Efectivo, Mercado Pago, Transfer BBVA, Tarjeta Santander, Otro) con su monto y porcentaje.

### En **Tendencias** (Dashboard):

- Las KPIs ahora muestran 6 tarjetas: Ventas, Promedio/día, Gastos efectivo, Gastos otros, **Balance total**, **Balance efectivo**.
- En el "Resumen ejecutivo (inversores)" se agregaron las filas "Gastos en efectivo", "Gastos con tarjeta / otros" y "Balance efectivo (caja)".

## 🧹 Estructura limpia

Borré 7 archivos que no se usaban:

- `App.jsx` duplicado en la raíz (Vite usa `src/App.jsx`) — **el bueno se conservó**, ese era el más nuevo y se movió a `src/App.jsx`. Los cambios del Apolo flow (auto-asignación universal, mensajes de error claros) ahora sí están corriendo.
- `main.jsx` duplicado en la raíz
- `icon-192.png`, `icon-512.png`, `manifest.json` en la raíz (Vite los sirve desde `public/`)
- `ladyfresa-apolo (2).zip`, `(3).zip`, `(4).zip` — backups viejos

Estructura final:

```
ladyfresa/
├── index.html
├── vite.config.js
├── package.json
├── README.md
├── INSTRUCCIONES.md
├── MIGRACION_SUPABASE.sql   ← ejecuta esto en Supabase si aún no lo hiciste
├── CAMBIOS.md               ← este archivo
├── src/
│   ├── main.jsx
│   └── App.jsx
└── public/
    ├── icon-192.png
    ├── icon-512.png
    └── manifest.json
```

## ✅ Verificado

Hice `vite build` y compila sin errores. Cuando subas a GitHub, Vercel va a hacer el deploy automáticamente.
