import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { perfilRepo, supabase } from '../../data/repo';
import { useStore } from '../../store';
import type { UserRole } from '../../domain/tipos';

export interface NuevoUsuarioInput {
  email: string;
  password: string;
  nombre: string;
  rol: UserRole;
}

export function useUsuarios() {
  const sucursal = useStore((s) => s.sucursal);
  const queryClient = useQueryClient();

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['usuarios', sucursal?.id],
    queryFn: () => (sucursal ? perfilRepo.getAllBySucursal(sucursal.id) : Promise.resolve([])),
    enabled: !!sucursal,
  });

  const crearMutation = useMutation({
    mutationFn: async (input: NuevoUsuarioInput) => {
      if (!sucursal) throw new Error('No hay sucursal seleccionada');

      // Guardamos la sesión del admin actual: crear un usuario nuevo con
      // signUp puede reemplazar la sesión activa del cliente por la del
      // usuario recién creado. La restauramos después para no desloguear
      // a quien está creando la cuenta.
      const { data: sesionActual } = await supabase.auth.getSession();

      try {
        const { data, error } = await supabase.auth.signUp({
          email: input.email,
          password: input.password,
        });
        if (error) throw error;
        if (!data.user) throw new Error('No se pudo crear el usuario');

        return await perfilRepo.create(
          data.user.id,
          input.nombre,
          input.rol,
          sucursal.id,
          input.email
        );
      } finally {
        // Pase lo que pase (éxito o error), siempre se restaura la sesión
        // del admin que estaba creando el usuario.
        if (sesionActual.session) {
          await supabase.auth.setSession({
            access_token: sesionActual.session.access_token,
            refresh_token: sesionActual.session.refresh_token,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios', sucursal?.id] });
    },
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { rol?: UserRole; activo?: boolean } }) =>
      perfilRepo.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios', sucursal?.id] });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: string) => perfilRepo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios', sucursal?.id] });
    },
  });

  return {
    usuarios,
    isLoading,
    crear: crearMutation.mutate,
    isCreando: crearMutation.isPending,
    crearError: crearMutation.error,
    actualizar: actualizarMutation.mutate,
    isActualizando: actualizarMutation.isPending,
    eliminar: eliminarMutation.mutate,
    isEliminando: eliminarMutation.isPending,
  };
}
