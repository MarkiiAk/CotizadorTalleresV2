import { PolizaGarantia } from '../types';

// Datos de la póliza de garantía de SAG Garage (extraídos del PDF)
export const POLIZA_GARANTIA: PolizaGarantia = {
  cobertura: 'Todas las reparaciones y servicios realizados en SAG Garage cuentan con garantía de 30 días naturales a partir de la fecha de entrega del vehículo. En partes eléctricas en ningún caso hay garantía. La garantía cubre únicamente las piezas y mano de obra relacionadas con la reparación realizada.',
  
  lugarGarantia: 'La garantía se hará válida únicamente en las instalaciones de SAG Garage. El cliente deberá presentar esta póliza junto con la factura o comprobante del servicio.',
  
  exclusiones: [
    'Si el vehículo es manipulado por terceros después del servicio realizado.',
    'Si el daño proviene de mal uso, accidentes, modificaciones no autorizadas o falta de mantenimiento.',
    'Si el cliente no respeta las recomendaciones de uso y cuidado emitidas por el taller.',
    'Daños ocasionados por condiciones externas (inundaciones, sobrecalentamiento, combustible adulterado, etc.).',
    'Reparaciones, modificaciones o alteraciones posteriores realizadas por talleres ajenos.',
    'Falta de mantenimiento preventivo recomendado por el Taller.'
  ],
  
  responsabilidadCliente: 'El cliente deberá notificar cualquier anomalía inmediatamente y dentro del plazo de la garantía. El vehículo deberá entregarse en las instalaciones del taller para su revisión.',
  
  tiempoRevision: 'El taller contará con un plazo razonable de hasta 5 días hábiles para revisar y diagnosticar el vehículo antes de determinar la procedencia de la garantía.',
  
  alcance: 'La garantía aplica únicamente a la reparación realizada y no cubre daños colaterales o piezas no intervenidas por SAG Garage.',
  
  horarios: 'Las garantías solo podrán hacerse válidas dentro de los horarios de atención del taller: Lunes a viernes de 9:00 a.m. a 6:00 p.m. / Sábados de 10:00 a.m. a 2:00 p.m. No se atenderán reclamaciones fuera de este horario.',
  
  traslado: 'La póliza de garantía no incluye de ninguna manera el traslado del vehículo desde el lugar donde se presente la falla hasta el taller. El cliente es responsable de llevar el vehículo a las instalaciones de SAG Garage.',
  
  responsabilidadLimitada: [
    'Daños indirectos, o en consecuencia de pérdidas económicas.',
    'Gastos de traslado, grúa, hospedaje o similares.'
  ],
  
  ajustesSinCosto: 'Si el servicio requiere ajustes dentro del periodo de garantía, estos se realizarán sin costo adicional, siempre que se cumpla con los requisitos establecidos.',
  
  revisionInmediata: 'El Cliente se compromete a informar de manera inmediata cualquier anomalía relacionada con la reparación.',
  
  aceptacion: 'Al firmar la orden de servicio y recibir el vehículo, el Cliente acepta los presentes términos y condiciones.'
};

export const HORARIOS_ATENCION = {
  lunesAViernes: '9:00 a.m. a 6:00 p.m.',
  sabados: '10:00 a.m. a 2:00 p.m.',
  domingos: 'Cerrado'
};

export const DIAS_GARANTIA = 30;
export const DIAS_REVISION = 5;
