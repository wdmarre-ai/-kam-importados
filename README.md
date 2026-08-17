# KAM Importados - Sistema de Gestión

**App de Gestión: Venta y Reparación de Telefonía Celular**

Aplicación web para gestionar ventas, reparaciones, inventario, gastos y reportes.

## Setup Inicial

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar .env.local
```bash
cp .env.example .env.local
```

Llenar con credenciales de Supabase.

### 3. Setup de Supabase
- Crear proyecto en supabase.com
- Ejecutar `supabase/schema.sql` en SQL Editor
- Crear storage buckets: `reparacion-fotos`, `producto-imagenes`

### 4. Ejecutar
```bash
npm run dev
```

## Comandos

```bash
npm run dev       # Desarrollo
npm run build     # Build producción
npx tsc -b        # Verificar tipos
```

## Arquitectura

- `src/domain/` - Lógica pura
- `src/data/` - Supabase (repo.ts es la única puerta)
- `src/services/` - Servicios
- `src/presentation/` - UI

## Módulos

1. **Dashboard** 📊 - Resumen del día
2. **Ventas** 💳 - POS
3. **Reparaciones** 🔧 - Seguimiento
4. **Mercadería** 📦 - Inventario
5. **Gastos** 💰 - Operacionales
6. **Admin** ⚙️ - Usuarios y config

## Stack

React 18 + Vite + TypeScript + Tailwind + Supabase + TanStack Query + Zustand + Recharts

## Licencia

Privado - KAM Importados 2026
