import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface EscanerCodigoProps {
  onDetectado: (codigo: string) => void;
  onCerrar: () => void;
}

const ELEMENT_ID = 'lector-camara';

export default function EscanerCodigo({ onDetectado, onCerrar }: EscanerCodigoProps) {
  const [error, setError] = useState('');
  const lectorRef = useRef<Html5Qrcode | null>(null);
  const detectadoRef = useRef(false);

  useEffect(() => {
    const lector = new Html5Qrcode(ELEMENT_ID);
    lectorRef.current = lector;
    let iniciado = false;

    lector
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (codigo) => {
          if (detectadoRef.current) return;
          detectadoRef.current = true;
          onDetectado(codigo);
        },
        () => {
          // Se llama en cada frame sin detección, se ignora.
        }
      )
      .then(() => {
        iniciado = true;
      })
      .catch(() => {
        setError('No se pudo abrir la cámara. Revisá los permisos del navegador.');
      });

    return () => {
      // stop() tira una excepción sincrónica (no una promesa rechazada) si
      // la cámara nunca llegó a arrancar, por eso el try/catch además del
      // .catch() de la promesa.
      if (!iniciado) {
        lector.clear();
        return;
      }
      try {
        lector
          .stop()
          .catch(() => {})
          .finally(() => lector.clear());
      } catch {
        lector.clear();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Escanear código</h2>
          <button onClick={onCerrar} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl">
            ✕
          </button>
        </div>

        <div className="p-4">
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Apuntá la cámara al código de barras o QR del IMEI
            </p>
          )}
          <div id={ELEMENT_ID} className="w-full rounded-lg overflow-hidden bg-black" />
        </div>

        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onCerrar} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
