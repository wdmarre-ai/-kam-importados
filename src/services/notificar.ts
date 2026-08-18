import type { Sucursal } from '../domain/tipos';

function limpiarTelefono(telefono: string): string {
  return telefono.replace(/[^\d]/g, '');
}

export function linkWhatsapp(telefono: string, mensaje: string): string {
  const numero = limpiarTelefono(telefono);
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export function linkEmail(email: string, asunto: string, mensaje: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(mensaje)}`;
}

/**
 * A diferencia de mailto: (que el sistema operativo redirige a la app de
 * correo predeterminada, ej. Outlook), este link abre directamente el
 * compositor web de Gmail en el navegador.
 */
export function linkGmail(email: string, asunto: string, mensaje: string): string {
  const params = new URLSearchParams({ view: 'cm', fs: '1', to: email, su: asunto, body: mensaje });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function encabezadoNegocio(sucursal?: Partial<Sucursal> | null): string[] {
  if (!sucursal?.nombre) return ['KAM Importados'];
  const lineas = [sucursal.nombre];
  const direccion = [sucursal.direccion, sucursal.ciudad].filter(Boolean).join(', ');
  if (direccion) lineas.push(direccion);
  if (sucursal.telefono) lineas.push(`Tel: ${sucursal.telefono}`);
  if (sucursal.cuit) lineas.push(`CUIT: ${sucursal.cuit}`);
  return lineas;
}

export function mensajeIngresoReparacion(params: {
  sucursal?: Partial<Sucursal> | null;
  remitoId: string;
  imei: string;
  descripcion: string;
  fechaEstimada: string;
  presupuesto?: number | null;
}): string {
  const { sucursal, remitoId, imei, descripcion, fechaEstimada, presupuesto } = params;
  const lineas = [
    ...encabezadoNegocio(sucursal),
    '',
    'Recibimos tu equipo para reparación',
    `Remito: ${remitoId}`,
    `Equipo: ${descripcion} (IMEI ${imei})`,
    `Fecha estimada de entrega: ${fechaEstimada}`,
    presupuesto ? `Presupuesto: $${presupuesto.toFixed(2)}` : `Presupuesto: a confirmar según diagnóstico`,
    '',
    'Guardá este mensaje, te lo van a pedir para retirar el equipo.',
  ];
  return lineas.join('\n');
}

export function mensajeActualizacionReparacion(params: {
  sucursal?: Partial<Sucursal> | null;
  remitoId: string;
  estado: string;
  detalle?: string;
}): string {
  const { sucursal, remitoId, estado, detalle } = params;
  const estadoLegible: Record<string, string> = {
    ingresado: 'Ingresado',
    en_reparacion: 'En reparación',
    pendiente_entrega: 'Listo para retirar',
    entregado: 'Entregado',
    rechazado: 'Rechazado',
  };
  const lineas = [
    ...encabezadoNegocio(sucursal),
    '',
    'Actualización de tu reparación',
    `Remito: ${remitoId}`,
    `Estado: ${estadoLegible[estado] ?? estado}`,
  ];
  if (detalle) lineas.push(detalle);
  return lineas.join('\n');
}

export interface ItemComprobante {
  modelo: string;
  cantidad: number;
  subtotal: number;
}

export function mensajeComprobanteVenta(params: {
  sucursal?: Partial<Sucursal> | null;
  clienteNombre: string;
  items: ItemComprobante[];
  costoEnvio?: number;
  total: number;
  medioPago: string;
  infoGarantia?: string;
  incluyeImagenAdjunta?: boolean;
}): string {
  const { sucursal, clienteNombre, items, costoEnvio, total, medioPago, infoGarantia, incluyeImagenAdjunta } = params;
  const medioPagoLabel: Record<string, string> = {
    efectivo: 'Efectivo',
    tarjeta_credito: 'Tarjeta de crédito',
    tarjeta_debito: 'Tarjeta de débito',
    transferencia: 'Transferencia',
    otro: 'Otro',
  };

  const lineas = [
    ...encabezadoNegocio(sucursal),
    '',
    'Comprobante de compra',
    `Cliente: ${clienteNombre}`,
    `Fecha: ${new Date().toLocaleDateString('es-AR')}`,
    '',
    ...items.map((i) => `• ${i.modelo} x${i.cantidad} — $${i.subtotal.toFixed(2)}`),
  ];

  if (costoEnvio) lineas.push(`Envío: $${costoEnvio.toFixed(2)}`);
  lineas.push(`Total: $${total.toFixed(2)} (${medioPagoLabel[medioPago] ?? medioPago})`);

  if (infoGarantia) lineas.push('', `Garantía: ${infoGarantia}`);

  lineas.push('', '¡Gracias por tu compra!');

  if (incluyeImagenAdjunta) {
    lineas.push('(Te adjuntamos el comprobante en imagen)');
  }

  return lineas.join('\n');
}
