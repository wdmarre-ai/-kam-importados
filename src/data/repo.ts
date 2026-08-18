import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth
export const auth = {
  async signup(email: string, password: string) {
    return supabase.auth.signUp({ email, password });
  },

  async login(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async logout() {
    return supabase.auth.signOut();
  },

  async getCurrentUser() {
    const { data } = await supabase.auth.getSession();
    return data.session?.user ?? null;
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  },
};

// Perfiles
export const perfilRepo = {
  async getByUserId(userId: string) {
    const { data } = await supabase
      .from('perfiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return data;
  },

  async create(userId: string, nombre: string, rol: string, sucursalId: string) {
    const { data } = await supabase
      .from('perfiles')
      .insert([{ user_id: userId, nombre, rol, sucursal_id: sucursalId, activo: true }])
      .select()
      .single();
    return data;
  },
};

// Sucursales
export const sucursalRepo = {
  async getAll() {
    const { data } = await supabase.from('sucursales').select('*');
    return data ?? [];
  },

  async getById(id: string) {
    const { data } = await supabase
      .from('sucursales')
      .select('*')
      .eq('id', id)
      .single();
    return data;
  },

  async create(nombre: string, direccion: string, ciudad: string) {
    const { data } = await supabase
      .from('sucursales')
      .insert([{ nombre, direccion, ciudad }])
      .select()
      .single();
    return data;
  },
};

// Productos
export const productoRepo = {
  async getAll(sucursalId: string) {
    const { data } = await supabase
      .from('productos')
      .select('*')
      .eq('sucursal_id', sucursalId)
      .eq('estado', 'en_stock');
    return data ?? [];
  },

  async getByImei(imei: string, sucursalId: string) {
    const { data } = await supabase
      .from('productos')
      .select('*')
      .eq('imei', imei)
      .eq('sucursal_id', sucursalId)
      .single();
    return data;
  },

  async create(producto: any) {
    const { data, error } = await supabase
      .from('productos')
      .insert([producto])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('productos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async actualizarCostosPorCategoria(categoriaId: string, sucursalId: string, factor: number) {
    const { data: productos, error: errGet } = await supabase
      .from('productos')
      .select('id, costo_unitario, precio_minorista, precio_mayorista')
      .eq('categoria_id', categoriaId)
      .eq('sucursal_id', sucursalId);
    if (errGet) throw errGet;
    if (!productos || productos.length === 0) return [];

    const actualizaciones = await Promise.all(
      productos.map((p) =>
        supabase
          .from('productos')
          .update({
            costo_unitario: p.costo_unitario * factor,
            precio_minorista: p.precio_minorista * factor,
            precio_mayorista: p.precio_mayorista * factor,
          })
          .eq('id', p.id)
          .select()
          .single()
      )
    );

    const conError = actualizaciones.find((r) => r.error);
    if (conError?.error) throw conError.error;

    return actualizaciones.map((r) => r.data);
  },
};

// Stock
export const stockRepo = {
  async getByProductoId(productoId: string, sucursalId: string) {
    const { data } = await supabase
      .from('stock')
      .select('*')
      .eq('producto_id', productoId)
      .eq('sucursal_id', sucursalId)
      .single();
    return data;
  },

  async updateCantidad(productoId: string, sucursalId: string, cantidad: number) {
    const { data } = await supabase
      .from('stock')
      .update({ cantidad })
      .eq('producto_id', productoId)
      .eq('sucursal_id', sucursalId)
      .select()
      .single();
    return data;
  },

  async upsertSumando(productoId: string, sucursalId: string, cantidadAAgregar: number) {
    const existente = await stockRepo.getByProductoId(productoId, sucursalId).catch(() => null);
    if (existente) {
      return stockRepo.updateCantidad(productoId, sucursalId, existente.cantidad + cantidadAAgregar);
    }
    const { data, error } = await supabase
      .from('stock')
      .insert([{ producto_id: productoId, sucursal_id: sucursalId, cantidad: cantidadAAgregar }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getAll(sucursalId: string) {
    const { data } = await supabase
      .from('stock')
      .select('*')
      .eq('sucursal_id', sucursalId);
    return data ?? [];
  },
};

// Categorías
export const categoriaRepo = {
  async getAll() {
    const { data } = await supabase.from('categorias').select('*').order('nombre');
    return data ?? [];
  },

  async getOrCreate(nombre: string) {
    const { data: existente } = await supabase
      .from('categorias')
      .select('*')
      .eq('nombre', nombre)
      .maybeSingle();
    if (existente) return existente;

    const { data, error } = await supabase
      .from('categorias')
      .insert([{ nombre }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// Compras
export const compraRepo = {
  async create(compra: any) {
    const { data, error } = await supabase
      .from('compras')
      .insert([compra])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createItemsBatch(items: any[]) {
    const { data, error } = await supabase
      .from('compra_items')
      .insert(items)
      .select();
    if (error) throw error;
    return data;
  },

  async getAll(sucursalId: string, from?: string, to?: string) {
    let query = supabase
      .from('compras')
      .select('*')
      .eq('sucursal_id', sucursalId)
      .order('fecha', { ascending: false });

    if (from && to) {
      query = query.gte('fecha', from).lte('fecha', to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },
};

// Clientes
export const clienteRepo = {
  async getAll(sucursalId: string) {
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .eq('sucursal_id', sucursalId);
    return data ?? [];
  },

  async getByTelefono(telefono: string, sucursalId: string) {
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .eq('telefono', telefono)
      .eq('sucursal_id', sucursalId)
      .single();
    return data;
  },

  async create(cliente: any) {
    const { data, error } = await supabase
      .from('clientes')
      .insert([cliente])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getOrCreate(telefono: string, sucursalId: string, clienteData: any) {
    try {
      const existing = await this.getByTelefono(telefono, sucursalId);
      if (existing) return existing;
    } catch {
      // No existe, crear uno nuevo
    }

    return this.create({
      ...clienteData,
      telefono,
      sucursal_id: sucursalId,
    });
  },
};

// Ventas
export const ventaRepo = {
  async create(venta: any) {
    const { data, error } = await supabase
      .from('ventas')
      .insert([venta])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getAll(sucursalId: string, from?: string, to?: string) {
    let query = supabase
      .from('ventas')
      .select('*')
      .eq('sucursal_id', sucursalId);

    if (from && to) {
      query = query
        .gte('fecha', from)
        .lte('fecha', to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },
};

// Venta Items
export const ventaItemRepo = {
  async createBatch(items: any[]) {
    const { data, error } = await supabase
      .from('venta_items')
      .insert(items)
      .select();
    if (error) throw error;
    return data;
  },
};

// Reparaciones
export const reparacionRepo = {
  async create(reparacion: any) {
    const { data } = await supabase
      .from('reparaciones')
      .insert([reparacion])
      .select()
      .single();
    return data;
  },

  async getAll(sucursalId: string) {
    const { data } = await supabase
      .from('reparaciones')
      .select('*')
      .eq('sucursal_id', sucursalId);
    return data ?? [];
  },

  async getByImei(imei: string, sucursalId: string) {
    const { data } = await supabase
      .from('reparaciones')
      .select('*')
      .eq('imei', imei)
      .eq('sucursal_id', sucursalId);
    return data ?? [];
  },

  async update(id: string, updates: any) {
    const { data } = await supabase
      .from('reparaciones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return data;
  },
};

// Gastos
export const gastoRepo = {
  async create(gasto: any) {
    const { data } = await supabase
      .from('gastos')
      .insert([gasto])
      .select()
      .single();
    return data;
  },

  async getAll(sucursalId: string, from?: string, to?: string) {
    let query = supabase
      .from('gastos')
      .select('*')
      .eq('sucursal_id', sucursalId);

    if (from && to) {
      query = query
        .gte('fecha', from)
        .lte('fecha', to);
    }

    const { data } = await query;
    return data ?? [];
  },
};

// Storage (fotos)
export const storageRepo = {
  async uploadFoto(bucket: string, path: string, file: File) {
    const { data } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });
    return data;
  },

  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },
};
