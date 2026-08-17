import { useState } from 'react';
import type { Producto } from '../../../domain/tipos';

interface POSSearchProps {
  onProductoFound: (producto: Producto) => void;
  isSearching?: boolean;
}

export default function POSSearch({ onProductoFound: _onProductoFound, isSearching = false }: POSSearchProps) {
  const [searchInput, setSearchInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!searchInput.trim()) {
      setErrorMsg('Ingresá un IMEI o modelo para buscar');
      return;
    }

    // TODO: Implementar búsqueda en Supabase
    console.log('Buscando:', searchInput);
  };

  const handleScannerInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // El scanner emula un teclado, así que Enter después de pegar = scan completo
    if (e.key === 'Enter') {
      handleSearch(e as any);
      setSearchInput('');
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        🔍 Buscar Producto
      </h2>

      <form onSubmit={handleSearch} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Escanear IMEI o Buscar Modelo
          </label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleScannerInput}
            className="input-field w-full text-lg"
            placeholder="Pegá el IMEI del scanner o escribí el modelo..."
            autoFocus
            disabled={isSearching}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            💡 Podés usar scanner Bluetooth, manual o cámara QR
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={isSearching || !searchInput}
          className="btn-primary w-full"
        >
          {isSearching ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          <strong>Tipos de scanner soportados:</strong>
        </p>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>📱 Scanner Bluetooth/USB (emula teclado)</li>
          <li>✋ Ingreso manual (copiar-pegar)</li>
          <li>📷 Cámara QR/Código de barras (próximamente)</li>
        </ul>
      </div>
    </div>
  );
}
