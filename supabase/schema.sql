-- KAM Importados - Schema PostgreSQL
-- Sistema de Gestión de Venta y Reparación de Telefonía Celular

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "moddatetime";

-- Enum types
CREATE TYPE user_role AS ENUM ('admin', 'gerente', 'vendedor', 'tecnico', 'empleado');
CREATE TYPE medio_pago AS ENUM ('efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia', 'otro');
CREATE TYPE tipo_cliente AS ENUM ('minorista', 'mayorista');
CREATE TYPE estado_producto AS ENUM ('en_stock', 'en_reparacion', 'vendido', 'rechazado');
CREATE TYPE estado_reparacion AS ENUM ('ingresado', 'en_reparacion', 'pendiente_entrega', 'entregado', 'rechazado');
CREATE TYPE categoria_gasto AS ENUM ('alquiler', 'servicios', 'sueldos', 'impuestos', 'otro');

-- SUCURSALES
CREATE TABLE sucursales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  ciudad VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- PERFILES (User metadata)
CREATE TABLE perfiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  rol user_role NOT NULL DEFAULT 'empleado',
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- CATEGORÍAS DE PRODUCTOS
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- PRODUCTOS (Inventario)
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  imei VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  color VARCHAR(100),
  modelo VARCHAR(100),
  marca VARCHAR(100),
  bateria_porcentaje INT DEFAULT 0,
  categoria_id UUID REFERENCES categorias(id),
  estado estado_producto DEFAULT 'en_stock',
  precio_minorista DECIMAL(15,2) NOT NULL,
  precio_mayorista DECIMAL(15,2) NOT NULL,
  costo_unitario DECIMAL(15,2) NOT NULL,
  imagen_url TEXT,
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(imei, sucursal_id)
);

-- STOCK
CREATE TABLE stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  cantidad INT NOT NULL DEFAULT 0,
  ubicacion VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(producto_id, sucursal_id)
);

-- CLIENTES
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  direccion TEXT,
  tipo tipo_cliente DEFAULT 'minorista',
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- VENTAS
CREATE TABLE ventas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha DATE NOT NULL DEFAULT now(),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  medio_pago medio_pago NOT NULL,
  tipo tipo_cliente NOT NULL,
  total_pesos DECIMAL(15,2) NOT NULL,
  total_usd DECIMAL(15,2),
  precio_dolar_usado DECIMAL(15,2),
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  conformidad BOOLEAN DEFAULT true,
  info_garantia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- VENTA ITEMS
CREATE TABLE venta_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id),
  precio_venta DECIMAL(15,2) NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  subtotal DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- DEVOLUCIONES
CREATE TABLE devoluciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT now(),
  motivo TEXT NOT NULL,
  reembolso DECIMAL(15,2) NOT NULL,
  items_devueltos JSONB NOT NULL, -- [{producto_id, cantidad}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- COMPRAS
CREATE TABLE compras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha DATE NOT NULL DEFAULT now(),
  proveedor VARCHAR(255) NOT NULL,
  total_costo DECIMAL(15,2) NOT NULL,
  costo_envio DECIMAL(15,2) NOT NULL,
  costo_total DECIMAL(15,2) NOT NULL,
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- COMPRA ITEMS
CREATE TABLE compra_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  compra_id UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id),
  cantidad INT NOT NULL,
  costo_unitario DECIMAL(15,2) NOT NULL,
  costo_envio_prorrateo DECIMAL(15,2) NOT NULL DEFAULT 0,
  costo_final DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- REPARACIONES
CREATE TABLE reparaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  remito_id VARCHAR(50) NOT NULL UNIQUE, -- N° de remito único generado
  fecha_ingreso DATE NOT NULL DEFAULT now(),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  imei VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  color VARCHAR(100),
  bateria_porcentaje INT,
  detalles TEXT,
  estado estado_reparacion DEFAULT 'ingresado',
  fecha_estimada_entrega DATE,
  fecha_real_entrega DATE,
  presupuesto DECIMAL(15,2),
  foto_url TEXT,
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- REPARACIÓN REMITO
CREATE TABLE reparacion_remitos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reparacion_id UUID NOT NULL REFERENCES reparaciones(id) ON DELETE CASCADE,
  constancia_pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- REPARACIÓN TÉCNICO
CREATE TABLE reparacion_tecnicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reparacion_id UUID NOT NULL REFERENCES reparaciones(id) ON DELETE CASCADE,
  tecnico_id UUID NOT NULL REFERENCES auth.users(id),
  costo_trabajo DECIMAL(15,2) NOT NULL,
  fecha_inicio DATE NOT NULL DEFAULT now(),
  fecha_fin DATE,
  detalles TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- GASTOS OPERACIONALES
CREATE TABLE gastos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha DATE NOT NULL DEFAULT now(),
  categoria categoria_gasto NOT NULL,
  descripcion TEXT NOT NULL,
  monto DECIMAL(15,2) NOT NULL,
  sucursal_id UUID NOT NULL REFERENCES sucursales(id),
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ÍNDICES
CREATE INDEX idx_productos_sucursal ON productos(sucursal_id);
CREATE INDEX idx_productos_imei ON productos(imei);
CREATE INDEX idx_stock_producto ON stock(producto_id);
CREATE INDEX idx_stock_sucursal ON stock(sucursal_id);
CREATE INDEX idx_clientes_sucursal ON clientes(sucursal_id);
CREATE INDEX idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX idx_ventas_usuario ON ventas(usuario_id);
CREATE INDEX idx_ventas_sucursal ON ventas(sucursal_id);
CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_venta_items_venta ON venta_items(venta_id);
CREATE INDEX idx_compras_sucursal ON compras(sucursal_id);
CREATE INDEX idx_compras_fecha ON compras(fecha);
CREATE INDEX idx_reparaciones_cliente ON reparaciones(cliente_id);
CREATE INDEX idx_reparaciones_sucursal ON reparaciones(sucursal_id);
CREATE INDEX idx_reparaciones_estado ON reparaciones(estado);
CREATE INDEX idx_reparaciones_fecha ON reparaciones(fecha_ingreso);
CREATE INDEX idx_reparacion_tecnicos_reparacion ON reparacion_tecnicos(reparacion_id);
CREATE INDEX idx_gastos_sucursal ON gastos(sucursal_id);
CREATE INDEX idx_gastos_fecha ON gastos(fecha);
CREATE INDEX idx_perfiles_user ON perfiles(user_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE devoluciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE compra_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reparaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE reparacion_remitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reparacion_tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES - Perfiles
CREATE POLICY "users_can_view_own_profile" ON perfiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "admin_can_view_all_profiles" ON perfiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.user_id = auth.uid() AND p.rol = 'admin'
    )
  );

-- RLS POLICIES - Sucursales (accessible by admin and users from that branch)
CREATE POLICY "users_can_view_their_branch" ON sucursales FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.user_id = auth.uid() AND p.sucursal_id = id
    ) OR
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.user_id = auth.uid() AND p.rol = 'admin'
    )
  );

-- RLS POLICIES - Productos (by sucursal)
CREATE POLICY "users_can_view_branch_products" ON productos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.user_id = auth.uid() AND p.sucursal_id = sucursal_id
    ) OR
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.user_id = auth.uid() AND p.rol = 'admin'
    )
  );

-- RLS POLICIES - Stock
CREATE POLICY "users_can_view_branch_stock" ON stock FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.user_id = auth.uid() AND p.sucursal_id = sucursal_id
    ) OR
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.user_id = auth.uid() AND p.rol = 'admin'
    )
  );

-- RLS POLICIES - Clientes
CREATE POLICY "users_can_view_branch_clients" ON clientes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.user_id = auth.uid() AND p.sucursal_id = sucursal_id
    ) OR
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.user_id = auth.uid() AND p.rol = 'admin'
    )
  );

-- RLS POLICIES - Ventas
CREATE POLICY "users_can_view_branch_sales" ON ventas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.user_id = auth.uid() AND p.sucursal_id = sucursal_id
    ) OR
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.user_id = auth.uid() AND p.rol = 'admin'
    )
  );

-- RLS POLICIES - Reparaciones
CREATE POLICY "users_can_view_branch_repairs" ON reparaciones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.user_id = auth.uid() AND p.sucursal_id = sucursal_id
    ) OR
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.user_id = auth.uid() AND p.rol = 'admin'
    )
  );

-- RLS POLICIES - Gastos
CREATE POLICY "users_can_view_branch_expenses" ON gastos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.user_id = auth.uid() AND p.sucursal_id = sucursal_id
    ) OR
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.user_id = auth.uid() AND p.rol = 'admin'
    )
  );

-- STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('reparacion-fotos', 'reparacion-fotos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('producto-imagenes', 'producto-imagenes', true);

-- Comentarios
COMMENT ON TABLE reparaciones IS 'Registro de reparaciones con seguimiento por técnico y costo de trabajo';
COMMENT ON COLUMN reparaciones.remito_id IS 'Número de remito único generado automáticamente';
COMMENT ON COLUMN compra_items.costo_envio_prorrateo IS 'Costo de envío prorratеado por producto';
