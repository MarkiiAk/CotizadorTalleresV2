import React from 'react';
import { Presupuesto } from '../types';
import { POLIZA_GARANTIA } from '../constants/garantia';

interface PrintablePresupuestoProps {
  presupuesto: Presupuesto;
}

export const PrintablePresupuesto: React.FC<PrintablePresupuestoProps> = ({ presupuesto }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#ffffff',
      color: '#000000',
      padding: '20px',
      maxWidth: '210mm',
    },
    page: {
      pageBreakAfter: 'always' as const,
      pageBreakInside: 'avoid' as const,
    },
    headerMain: {
      borderBottom: '4px solid #2563eb',
      paddingBottom: '16px',
      marginBottom: '24px',
    },
    title: {
      fontSize: '36px',
      fontWeight: 'bold' as const,
      color: '#2563eb',
      marginBottom: '8px',
      margin: '0 0 8px 0',
    },
    subtitle: {
      fontSize: '18px',
      color: '#4b5563',
      margin: '4px 0',
    },
    smallText: {
      fontSize: '14px',
      color: '#6b7280',
      margin: '2px 0',
    },
    gridTwo: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
      marginBottom: '24px',
    },
    card: {
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      padding: '16px',
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: 'bold' as const,
      color: '#2563eb',
      marginBottom: '12px',
      paddingBottom: '8px',
      borderBottom: '1px solid #d1d5db',
    },
    infoRow: {
      margin: '8px 0',
      fontSize: '14px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      fontSize: '14px',
      marginTop: '12px',
    },
    th: {
      textAlign: 'left' as const,
      padding: '8px',
      borderBottom: '1px solid #d1d5db',
      fontWeight: 'bold' as const,
    },
    td: {
      padding: '8px',
      borderBottom: '1px solid #e5e7eb',
    },
    resumenBox: {
      border: '2px solid #2563eb',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: '#eff6ff',
      marginBottom: '24px',
    },
    resumenRow: {
      display: 'flex',
      justifyContent: 'space-between',
      margin: '8px 0',
      fontSize: '14px',
    },
    resumenTotal: {
      display: 'flex',
      justifyContent: 'space-between',
      margin: '12px 0 0 0',
      paddingTop: '12px',
      borderTop: '2px solid #2563eb',
      fontSize: '20px',
      fontWeight: 'bold' as const,
      color: '#2563eb',
    },
    firmas: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '32px',
      marginTop: '48px',
      paddingTop: '32px',
      borderTop: '2px solid #d1d5db',
    },
    firmaLine: {
      borderTop: '2px solid #000',
      paddingTop: '8px',
      marginTop: '64px',
      textAlign: 'center' as const,
    },
    headerGarantia: {
      borderBottom: '4px solid #dc2626',
      paddingBottom: '16px',
      marginBottom: '24px',
    },
    titleGarantia: {
      fontSize: '30px',
      fontWeight: 'bold' as const,
      color: '#dc2626',
      marginBottom: '8px',
      margin: '0 0 8px 0',
    },
    garantiaCard: {
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
    },
    garantiaTitleSection: {
      fontWeight: 'bold' as const,
      color: '#dc2626',
      marginBottom: '8px',
      fontSize: '14px',
    },
    garantiaText: {
      color: '#374151',
      lineHeight: '1.6',
      fontSize: '13px',
      margin: '4px 0',
    },
    list: {
      marginLeft: '20px',
      marginTop: '8px',
    },
    listItem: {
      margin: '4px 0',
      fontSize: '13px',
      color: '#374151',
    },
    footer: {
      textAlign: 'center' as const,
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '32px',
    },
  };

  return (
    <div className="printable-content" style={styles.container}>
      {/* PÁGINA 1: PRESUPUESTO */}
      <div style={styles.page}>
        {/* Header */}
        <div style={styles.headerMain}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <img 
              src="/logo.png" 
              alt="SAG Garage Logo" 
              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }}
            />
            <div>
              <h1 style={styles.title}>SAG GARAGE</h1>
              <p style={styles.subtitle}>Orden de Servicio y Presupuesto</p>
            </div>
          </div>
          <p style={styles.smallText}>Folio: {presupuesto.folio}</p>
          <p style={styles.smallText}>Fecha de emisión: {formatDate(presupuesto.fecha)}</p>
        </div>

        {/* Información del Cliente y Vehículo */}
        <div style={styles.gridTwo}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Información del Cliente</h2>
            <div>
              <p style={styles.infoRow}><strong>Nombre:</strong> {presupuesto.cliente.nombreCompleto || 'N/A'}</p>
              <p style={styles.infoRow}><strong>Teléfono:</strong> {presupuesto.cliente.telefono || 'N/A'}</p>
              <p style={styles.infoRow}><strong>Email:</strong> {presupuesto.cliente.email || 'N/A'}</p>
              <p style={styles.infoRow}><strong>Domicilio:</strong> {presupuesto.cliente.domicilio || 'N/A'}</p>
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Información del Vehículo</h2>
            <div>
              <p style={styles.infoRow}><strong>Marca:</strong> {presupuesto.vehiculo.marca || 'N/A'}</p>
              <p style={styles.infoRow}><strong>Modelo:</strong> {presupuesto.vehiculo.modelo || 'N/A'}</p>
              <p style={styles.infoRow}><strong>Color:</strong> {presupuesto.vehiculo.color || 'N/A'}</p>
              <p style={styles.infoRow}><strong>Placas:</strong> {presupuesto.vehiculo.placas || 'N/A'}</p>
              <p style={styles.infoRow}><strong>Kms Entrada:</strong> {presupuesto.vehiculo.kilometrajeEntrada || 'N/A'}</p>
              <p style={styles.infoRow}><strong>Fecha Entrada:</strong> {formatDate(presupuesto.fechaEntrada)}</p>
              <p style={styles.infoRow}><strong>Nivel Gasolina:</strong> {presupuesto.vehiculo.nivelGasolina}%</p>
            </div>
          </div>
        </div>

        {/* Problema y Diagnóstico */}
        {(presupuesto.problemaReportado || presupuesto.diagnosticoTecnico) && (
          <div style={{ ...styles.card, marginBottom: '24px' }}>
            <h2 style={styles.cardTitle}>Problema y Diagnóstico</h2>
            {presupuesto.problemaReportado && (
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ fontSize: '14px' }}>Descripción del Problema:</strong>
                <p style={{ ...styles.garantiaText, marginTop: '4px' }}>{presupuesto.problemaReportado}</p>
              </div>
            )}
            {presupuesto.diagnosticoTecnico && (
              <div>
                <strong style={{ fontSize: '14px' }}>Diagnóstico Técnico:</strong>
                <p style={{ ...styles.garantiaText, marginTop: '4px' }}>{presupuesto.diagnosticoTecnico}</p>
              </div>
            )}
          </div>
        )}

        {/* Servicios */}
        {presupuesto.servicios && presupuesto.servicios.length > 0 && (
          <div style={{ ...styles.card, marginBottom: '24px' }}>
            <h2 style={styles.cardTitle}>Servicios a Realizar</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Servicio</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Precio</th>
                </tr>
              </thead>
              <tbody>
                {presupuesto.servicios.map((servicio, idx) => (
                  <tr key={idx}>
                    <td style={styles.td}>{servicio.descripcion}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{formatCurrency(servicio.precio)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Refacciones */}
        {presupuesto.refacciones && presupuesto.refacciones.length > 0 && (
          <div style={{ ...styles.card, marginBottom: '24px' }}>
            <h2 style={styles.cardTitle}>Refacciones</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Descripción</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Cant.</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Precio Unit.</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {presupuesto.refacciones.map((refaccion, idx) => {
                  // Calcular precio unitario con el 30% incluido
                  const precioUnitario = refaccion.total / refaccion.cantidad;
                  return (
                    <tr key={idx}>
                      <td style={styles.td}>{refaccion.nombre}</td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>{refaccion.cantidad}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{formatCurrency(precioUnitario)}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{formatCurrency(refaccion.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Mano de Obra */}
        {presupuesto.manoDeObra && presupuesto.manoDeObra.length > 0 && (
          <div style={{ ...styles.card, marginBottom: '24px' }}>
            <h2 style={styles.cardTitle}>Mano de Obra</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Descripción</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Precio</th>
                </tr>
              </thead>
              <tbody>
                {presupuesto.manoDeObra.map((trabajo, idx) => (
                  <tr key={idx}>
                    <td style={styles.td}>{trabajo.descripcion}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{formatCurrency(trabajo.precio)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Resumen Financiero */}
        <div style={styles.resumenBox}>
          <h2 style={{ ...styles.cardTitle, color: '#2563eb' }}>Resumen Financiero</h2>
          <div style={styles.resumenRow}>
            <span>Servicios:</span>
            <span style={{ fontWeight: 'bold' }}>{formatCurrency(presupuesto.resumen?.servicios || 0)}</span>
          </div>
          <div style={styles.resumenRow}>
            <span>Refacciones:</span>
            <span style={{ fontWeight: 'bold' }}>{formatCurrency(presupuesto.resumen?.refacciones || 0)}</span>
          </div>
          <div style={styles.resumenRow}>
            <span>Mano de Obra:</span>
            <span style={{ fontWeight: 'bold' }}>{formatCurrency(presupuesto.resumen?.manoDeObra || 0)}</span>
          </div>
          <div style={styles.resumenTotal}>
            <span>Subtotal:</span>
            <span>{formatCurrency(presupuesto.resumen?.subtotal || 0)}</span>
          </div>
          {presupuesto.resumen?.anticipo > 0 && (
            <>
              <div style={{ ...styles.resumenRow, color: '#16a34a', marginTop: '8px' }}>
                <span>Anticipo:</span>
                <span style={{ fontWeight: 'bold' }}>{formatCurrency(presupuesto.resumen.anticipo)}</span>
              </div>
              <div style={{ ...styles.resumenTotal, color: '#dc2626' }}>
                <span>Saldo Pendiente:</span>
                <span>{formatCurrency(presupuesto.resumen.restante)}</span>
              </div>
            </>
          )}
          {(!presupuesto.resumen?.anticipo || presupuesto.resumen.anticipo === 0) && (
            <div style={{ ...styles.resumenTotal, fontSize: '24px' }}>
              <span>TOTAL A PAGAR:</span>
              <span>{formatCurrency(presupuesto.resumen?.subtotal || 0)}</span>
            </div>
          )}
        </div>

        {/* Firmas */}
        <div style={styles.firmas}>
          <div style={{ textAlign: 'center' }}>
            <div style={styles.firmaLine}>
              <p style={{ fontWeight: 'bold', margin: '4px 0' }}>Firma del Cliente</p>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>{presupuesto.cliente.nombreCompleto}</p>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={styles.firmaLine}>
              <p style={{ fontWeight: 'bold', margin: '4px 0' }}>Firma de SAG Garage</p>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>Autorización del Servicio</p>
            </div>
          </div>
        </div>
      </div>

      {/* PÁGINA 2: PÓLIZA DE GARANTÍA */}
      <div style={{ ...styles.page, pageBreakAfter: 'auto' }}>
        <div style={styles.headerGarantia}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <img 
              src="/logo.png" 
              alt="SAG Garage Logo" 
              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '12px' }}
            />
            <div>
              <h1 style={styles.titleGarantia}>PÓLIZA DE GARANTÍA</h1>
              <p style={styles.subtitle}>SAG Garage - Términos y Condiciones</p>
            </div>
          </div>
        </div>

        {/* Términos de Garantía */}
        <div>
          <div style={styles.garantiaCard}>
            <h3 style={styles.garantiaTitleSection}>1. Cobertura de la garantía</h3>
            <p style={styles.garantiaText}>{POLIZA_GARANTIA.cobertura}</p>
          </div>

          <div style={styles.garantiaCard}>
            <h3 style={styles.garantiaTitleSection}>2. Lugar de la garantía</h3>
            <p style={styles.garantiaText}>{POLIZA_GARANTIA.lugarGarantia}</p>
          </div>

          <div style={styles.garantiaCard}>
            <h3 style={styles.garantiaTitleSection}>3. Exclusiones</h3>
            <p style={styles.garantiaText}>La garantía quedará sin efecto en los siguientes casos:</p>
            <ul style={styles.list}>
              {POLIZA_GARANTIA.exclusiones.map((exclusion, idx) => (
                <li key={idx} style={styles.listItem}>{exclusion}</li>
              ))}
            </ul>
          </div>

          <div style={styles.garantiaCard}>
            <h3 style={styles.garantiaTitleSection}>4. Responsabilidad del cliente</h3>
            <p style={styles.garantiaText}>{POLIZA_GARANTIA.responsabilidadCliente}</p>
          </div>

          <div style={styles.garantiaCard}>
            <h3 style={styles.garantiaTitleSection}>5. Tiempo de revisión</h3>
            <p style={styles.garantiaText}>{POLIZA_GARANTIA.tiempoRevision}</p>
          </div>

          <div style={styles.garantiaCard}>
            <h3 style={styles.garantiaTitleSection}>6. Alcance de la garantía</h3>
            <p style={styles.garantiaText}>{POLIZA_GARANTIA.alcance}</p>
          </div>

          <div style={styles.garantiaCard}>
            <h3 style={styles.garantiaTitleSection}>7. Horarios de atención</h3>
            <p style={styles.garantiaText}>{POLIZA_GARANTIA.horarios}</p>
          </div>

          <div style={styles.garantiaCard}>
            <h3 style={styles.garantiaTitleSection}>8. Traslado del vehículo</h3>
            <p style={styles.garantiaText}>{POLIZA_GARANTIA.traslado}</p>
          </div>

          <div style={styles.garantiaCard}>
            <h3 style={styles.garantiaTitleSection}>9. Responsabilidad limitada</h3>
            <p style={styles.garantiaText}>El Taller no será responsable por:</p>
            <ul style={styles.list}>
              {POLIZA_GARANTIA.responsabilidadLimitada.map((item, idx) => (
                <li key={idx} style={styles.listItem}>{item}</li>
              ))}
            </ul>
          </div>

          <div style={styles.garantiaCard}>
            <h3 style={styles.garantiaTitleSection}>10. Ajustes sin costo</h3>
            <p style={styles.garantiaText}>{POLIZA_GARANTIA.ajustesSinCosto}</p>
          </div>
        </div>

        {/* Aceptación de términos */}
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '2px solid #d1d5db' }}>
          <div style={{ backgroundColor: '#f3f4f6', padding: '24px', borderRadius: '8px' }}>
            <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '16px' }}>
              {POLIZA_GARANTIA.aceptacion}
            </p>
            <div style={styles.gridTwo}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ ...styles.firmaLine, marginTop: '48px' }}>
                  <p style={{ fontWeight: 'bold' }}>Firma del Cliente</p>
                  <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>He leído y acepto los términos</p>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Fecha:</p>
                <div style={{ ...styles.firmaLine, marginTop: '40px' }}>
                  <p style={{ fontSize: '13px' }}>{formatDate(new Date())}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p>SAG Garage - Sistema de Presupuestos</p>
          <p>© {new Date().getFullYear()} Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  );
};
