// Tipos de usuario y roles
export type UserRole = 'admin' | 'gerente' | 'vendedor' | 'tecnico' | 'empleado';

export interface Perfil {
  id: string;
  user_id: string;
  nombre: string;
  rol: UserRole;
  sucursal_id: string;
  activo: boolean;
  created_at: string;
}

// Sucursal
export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono?: string;
  cuit?: string;
  created_at: string;
}

// Productos
export type EstadoProducto = 'en_stock' | 'en_reparacion' | 'vendido' | 'rechazado';

export interface Producto {
  id: string;
  imei: string;
  descripcion: string;
  color: string;
  modelo: string;
  marca: string;
  bateria_porcentaje: number;
  categoria_id: string;
  estado: EstadoProducto;
  precio_minorista: number;
  precio_mayorista: number;
  costo_unitario: number;
  imagen_url?: string;
  sucursal_id: string;
  created_at: string;
  updated_at: string;
  cantidad_stock?: number;
}

export interface Categoria {
  id: string;
  nombre: string; // iPhone, Samsung, Accesorios, etc
  descripcion?: string;
}

// Stock
export interface Stock {
  id: string;
  producto_id: string;
  sucursal_id: string;
  cantidad: number;
  ubicacion?: string;
}

// Clientes
export type TipoCliente = 'minorista' | 'mayorista';

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
  direccion?: string;
  tipo: TipoCliente;
  created_at: string;
}

// Ventas
export type MedioPago = 'efectivo' | 'tarjeta_credito' | 'tarjeta_debito' | 'transferencia' | 'otro';

export interface Venta {
  id: string;
  fecha: string;
  cliente_id: string;
  medio_pago: MedioPago;
  tipo: TipoCliente;
  total_pesos: number;
  total_usd?: number;
  precio_dolar_usado?: number;
  usuario_id: string;
  sucursal_id: string;
  conformidad: boolean;
  info_garantia?: string;
  reparacion_id?: string | null;
  created_at: string;
}

export interface VentaItem {
  id: string;
  venta_id: string;
  producto_id: string;
  precio_venta: number;
  cantidad: number;
  subtotal: number;
}

// Devoluciones
export interface Devolucion {
  id: string;
  venta_id: string;
  fecha: string;
  motivo: string;
  reembolso: number;
  items_devueltos: { producto_id: string; cantidad: number }[];
  created_at: string;
}

// Compras
export interface Compra {
  id: string;
  fecha: string;
  proveedor: string;
  total_costo: number;
  costo_envio: number;
  costo_total: number;
  sucursal_id: string;
  usuario_id: string;
  created_at: string;
}

export interface CompraItem {
  id: string;
  compra_id: string;
  producto_id: string;
  cantidad: number;
  costo_unitario: number;
  costo_envio_prorrateo: number;
  costo_final: number; // costo_unitario + prorrateo
}

// Reparaciones
export type EstadoReparacion = 'ingresado' | 'en_reparacion' | 'pendiente_entrega' | 'entregado' | 'rechazado';

export interface Reparacion {
  id: string;
  remito_id: string;
  fecha_ingreso: string;
  cliente_id: string;
  usuario_id?: string | null;
  imei: string;
  descripcion: string;
  color: string;
  bateria_porcentaje: number;
  detalles: string;
  estado: EstadoReparacion;
  fecha_estimada_entrega: string;
  fecha_real_entrega?: string;
  presupuesto?: number;
  foto_url?: string;
  sucursal_id: string;
  created_at: string;
  updated_at: string;
  cliente?: Cliente;
}

export interface ReparacionRemito {
  id: string;
  remito_id: string;
  reparacion_id: string;
  presupuesto?: number;
  constancia_pdf_url?: string;
  created_at: string;
}

export interface ReparacionTecnico {
  id: string;
  reparacion_id: string;
  tecnico_id: string;
  costo_trabajo: number;
  fecha_inicio: string;
  fecha_fin?: string;
  detalles: string;
  created_at: string;
}

// Gastos
export type CategoriaGasto = 'alquiler' | 'servicios' | 'sueldos' | 'impuestos' | 'otro';

export interface Gasto {
  id: string;
  fecha: string;
  categoria: CategoriaGasto;
  descripcion: string;
  monto: number;
  sucursal_id: string;
  created_at: string;
}

// Reportes
export interface ReporteDiario {
  fecha: string;
  sucursal_id: string;
  total_ventas: number;
  cantidad_items: number;
  por_medio_pago: Record<MedioPago, number>;
  por_tipo: Record<TipoCliente, number>;
}

export interface ReporteEstadoResultados {
  periodo_inicio: string;
  periodo_fin: string;
  sucursal_id: string;
  ingresos_ventas: number;
  costo_ventas: number;
  margen_bruto: number;
  gastos_operacionales: number;
  ganancia_neta: number;
}
