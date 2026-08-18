import html2canvas from 'html2canvas';

export async function descargarComoImagen(elementId: string, nombreArchivo: string) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale: 2 });
  const url = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = url;
  link.download = `${nombreArchivo}.png`;
  link.click();
}
