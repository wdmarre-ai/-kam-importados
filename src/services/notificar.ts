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

export function mensajeIngresoReparacion(params: {
  remitoId: string;
  imei: string;
  descripcion: string;
  fechaEstimada: string;
  presupuesto?: number | null;
}): string {
  const { remitoId, imei, descripcion, fechaEstimada, presupuesto } = params;
  const lineas = [
    `KAM Importados - Recibimos tu equipo para reparación`,
    `Remito: ${remitoId}`,
    `Equipo: ${descripcion} (IMEI ${imei})`,
    `Fecha estimada de entrega: ${fechaEstimada}`,
    presupuesto ? `Presupuesto: $${presupuesto.toFixed(2)}` : `Presupuesto: a confirmar según diagnóstico`,
    `Guardá este mensaje, te lo van a pedir para retirar el equipo.`,
  ];
  return lineas.join('\n');
}

export function mensajeActualizacionReparacion(params: {
  remitoId: string;
  estado: string;
  detalle?: string;
}): string {
  const { remitoId, estado, detalle } = params;
  const estadoLegible: Record<string, string> = {
    ingresado: 'Ingresado',
    en_reparacion: 'En reparación',
    pendiente_entrega: 'Listo para retirar',
    entregado: 'Entregado',
    rechazado: 'Rechazado',
  };
  const lineas = [
    `KAM Importados - Actualización de tu reparación`,
    `Remito: ${remitoId}`,
    `Estado: ${estadoLegible[estado] ?? estado}`,
  ];
  if (detalle) lineas.push(detalle);
  return lineas.join('\n');
}
