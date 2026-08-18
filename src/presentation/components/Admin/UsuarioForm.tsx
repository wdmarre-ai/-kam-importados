import { useState } from 'react';
import type { UserRole } from '../../../domain/tipos';

interface UsuarioFormProps {
  onSubmit: (data: { email: string; password: string; nombre: string; rol: UserRole }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrador (acceso total)' },
  { value: 'gerente', label: 'Gerente (su sucursal + compras/gastos)' },
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'empleado', label: 'Empleado (solo ventas de su sucursal)' },
];

export default function UsuarioForm({ onSubmit, onCancel, isLoading = false }: UsuarioFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<UserRole>('empleado');

  const completo = email.trim() && password.length >= 6 && nombre.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completo) return;
    onSubmit({ email: email.trim(), password, nombre: nombre.trim(), rol });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nuevo Usuario</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input-field w-full"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contraseña (mín. 6 caracteres) *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full"
              minLength={6}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rol *
            </label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value as UserRole)}
              className="input-field w-full"
              disabled={isLoading}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onCancel} className="btn-secondary" disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading || !completo}>
              {isLoading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
