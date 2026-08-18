import html2canvas from 'html2canvas';

export async function descargarComoImagen(elementId: string, nombreArchivo: string) {
  const el = document.getElementById(elementId);
  if (!el) return;

  // El elemento suele tener scroll interno (overflow-y-auto) para caber en
  // el modal. Si no se lo saca antes de capturar, html2canvas solo agarra
  // la parte visible y la imagen sale recortada.
  const overflowOriginal = el.style.overflow;
  const maxHeightOriginal = el.style.maxHeight;
  el.style.overflow = 'visible';
  el.style.maxHeight = 'none';

  try {
    const canvas = await html2canvas(el, {
      backgroundColor: '#ffffff',
      scale: 2,
      height: el.scrollHeight,
      windowHeight: el.scrollHeight,
    });
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nombreArchivo}.png`;
    link.click();
  } finally {
    el.style.overflow = overflowOriginal;
    el.style.maxHeight = maxHeightOriginal;
  }
}
