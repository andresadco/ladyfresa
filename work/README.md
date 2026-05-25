# 🍓 Lady Fresa — App de Gastos

App móvil PWA para control de gastos del negocio.

---

## 🚀 Cómo subir a Vercel (5 minutos)

### Paso 1 — Crear cuenta en Vercel
1. Ve a **vercel.com**
2. Clic en **"Sign Up"**
3. Elige **"Continue with GitHub"** (créate una cuenta en GitHub si no tienes)

### Paso 2 — Subir el proyecto
1. Ve a **github.com** → clic en **"New repository"**
2. Ponle de nombre: `ladyfresa-app`
3. Clic en **"Create repository"**
4. En la página siguiente, clic en **"uploading an existing file"**
5. Sube TODOS los archivos de esta carpeta (arrastra la carpeta completa)
6. Clic en **"Commit changes"**

### Paso 3 — Conectar con Vercel
1. Ve a **vercel.com** → **"Add New Project"**
2. Selecciona el repositorio `ladyfresa-app`
3. Vercel detecta Vite automáticamente — no cambies nada
4. Clic en **"Deploy"**
5. En ~2 minutos tendrás tu link: `ladyfresa-app.vercel.app`

---

## 📱 Cómo instalar en el celular

### iPhone (iOS)
1. Abre Safari y entra al link de la app
2. Toca el ícono de **compartir** (cuadrado con flecha ↑)
3. Baja y toca **"Agregar a pantalla de inicio"**
4. Toca **"Agregar"**
5. ¡Listo! Aparece el ícono rosa en tu pantalla

### Android
1. Abre Chrome y entra al link
2. Toca los **3 puntos** (⋮) arriba a la derecha
3. Toca **"Agregar a pantalla de inicio"**  
   *(o aparece automáticamente un banner que dice "Instalar")*
4. Toca **"Instalar"**
5. ¡Listo!

---

## 💡 Cómo usar

- **Registrar Gasto** → botón rosa grande en la pantalla de inicio
- **Resumen** → ve totales y desglose del mes actual
- **Historial** → todos los meses anteriores
- **Exportar Excel** → botón verde 📥 en Resumen o Historial

---

## ⚠️ Importante sobre los datos

Los datos se guardan en el teléfono de cada persona (localStorage).  
Si quieres que todos compartan los mismos datos en tiempo real,  
necesitarías agregar una base de datos (Supabase, Firebase — gratis).  
Avísale a Andres si quieres eso como siguiente paso.

---

## 📁 Archivos del proyecto

```
ladyfresa-app/
├── index.html          ← página principal
├── vite.config.js      ← configuración
├── package.json        ← dependencias
├── src/
│   ├── main.jsx        ← entrada
│   └── App.jsx         ← toda la app
└── public/
    ├── manifest.json   ← configuración PWA
    ├── icon-192.png    ← ícono app
    └── icon-512.png    ← ícono app (grande)
```
