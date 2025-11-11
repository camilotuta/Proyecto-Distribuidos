# Sistema de Ventas - Frontend (Node.js + React)

Sistema de gestión de ventas con validaciones robustas de entrada de datos.

## 🚀 Características

- ✅ **CRUD Completo** para Personas, Productos, Ubicaciones, Puntos de Venta y Ventas
- ✅ **Validaciones en Tiempo Real** con mensajes descriptivos
- ✅ **Validación de Stock** al crear ventas
- ✅ **Interfaz Intuitiva** con indicadores visuales de errores
- ✅ **Paginación y Búsqueda** en todas las tablas

## 📋 Validaciones Implementadas

Este frontend incluye validaciones completas para todos los campos de entrada. Para ver la documentación detallada de validaciones, consulta [VALIDACIONES.md](./VALIDACIONES.md).

### Resumen de Validaciones

- **Nombres**: Solo letras y espacios, 2-100 caracteres
- **Email**: Formato válido (usuario@dominio.com), máx. 100 caracteres
- **Precio**: Número positivo con máximo 2 decimales
- **Stock**: Número entero no negativo
- **Ventas**: Validación de cliente, punto de venta, productos y stock disponible

## 🛠️ Instalación

```bash
npm install
```

## ▶️ Ejecutar

```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## 🌐 Configuración del Backend

El frontend se conecta al backend en: `http://localhost:3000/api`

Para cambiar la URL del backend, edita la constante `API` en `src/App.jsx`:

```javascript
const API = "http://localhost:3000/api";
```

## 📦 Tecnologías

- React 19
- Vite
- Axios
- React Compiler

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

```

```
