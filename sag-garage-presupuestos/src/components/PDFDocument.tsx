import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { Presupuesto } from '../types';

// Registrar fuentes Roboto
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 300,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf',
      fontWeight: 400,
      fontStyle: 'italic',
    },
  ],
});

// 🎨 PALETA SAG GARAGE - Basada en diseño de referencia
const COLORS = {
  // Verdes SAG
  primary: '#8BC34A', // Verde limón principal
  primaryDark: '#689F38',
  
  // Headers y acentos
  headerDark: '#37474F', // Azul gris oscuro para tablas
  headerLight: '#455A64',
  
  // Azul para totales importantes
  accentBlue: '#2196F3',
  accentBlueDark: '#1976D2',
  
  // Escala de grises
  black: '#212121',
  darkGray: '#424242',
  mediumGray: '#757575',
  lightGray: '#E0E0E0',
  ultraLightGray: '#F5F5F5',
  white: '#FFFFFF',
  
  // Estados
  success: '#4CAF50',
  danger: '#F44336',
  warning: '#FF9800',
};

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 9,
    fontFamily: 'Roboto',
    backgroundColor: COLORS.white,
    color: COLORS.darkGray,
  },
  
  // ===== HEADER SAG GARAGE =====
  header: {
    backgroundColor: COLORS.white,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `3px solid ${COLORS.primary}`,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 45,
    height: 45,
  },
  titleSection: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 20,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  ownerName: {
    fontSize: 8,
    fontFamily: 'Roboto',
    fontWeight: 400,
    color: COLORS.darkGray,
  },
  addressSection: {
    textAlign: 'right',
    flex: 1,
  },
  addressText: {
    fontSize: 7.5,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  dateTimeSection: {
    position: 'absolute',
    top: 20,
    right: 20,
    textAlign: 'right',
  },
  dateLabel: {
    fontSize: 8,
    color: COLORS.mediumGray,
    marginBottom: 1,
  },
  dateValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.darkGray,
  },
  
  // ===== CONTENIDO =====
  content: {
    padding: 20,
  },
  
  // ===== CARDS CLIENTE Y VEHÍCULO =====
  cardsRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 8,
    padding: 8,
    border: `1px solid ${COLORS.lightGray}`,
    borderLeft: `4px solid ${COLORS.accentBlue}`,
  },
  cardTitle: {
    fontSize: 10,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: COLORS.accentBlue,
    marginBottom: 5,
    paddingBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    borderBottom: `2px solid ${COLORS.accentBlue}`,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 2,
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 8,
    color: COLORS.darkGray,
    marginRight: 3,
  },
  cardValue: {
    fontSize: 8,
    fontFamily: 'Roboto',
    fontWeight: 500,
    color: COLORS.black,
    flex: 1,
  },
  
  // ===== TABLAS =====
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    backgroundColor: COLORS.headerDark,
    padding: 6,
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  
  // Headers de tabla
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.accentBlue,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  
  // Filas de tabla
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: `1px solid ${COLORS.lightGray}`,
    backgroundColor: COLORS.white,
  },
  tableRowAlt: {
    backgroundColor: COLORS.ultraLightGray,
  },
  tableCell: {
    fontSize: 8,
    color: COLORS.darkGray,
  },
  tableCellBold: {
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: COLORS.black,
  },
  
  // Anchos de columna
  col50: { width: '50%' },
  col60: { width: '60%' },
  col30: { width: '30%' },
  col25: { width: '25%' },
  col20: { width: '20%' },
  col15: { width: '15%' },
  col10: { width: '10%' },
  colRight: { textAlign: 'right' },
  colCenter: { textAlign: 'center' },
  
  // ===== TÉRMINOS Y RESUMEN =====
  bottomSection: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 8,
  },
  termsSection: {
    flex: 1,
  },
  termsTitle: {
    fontSize: 8,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: COLORS.darkGray,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  termsText: {
    fontSize: 7,
    color: COLORS.mediumGray,
    lineHeight: 1.3,
  },
  
  // ===== RESUMEN FINANCIERO =====
  summarySection: {
    width: '45%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottom: `1px solid ${COLORS.lightGray}`,
  },
  summaryLabel: {
    fontSize: 8,
    color: COLORS.darkGray,
  },
  summaryValue: {
    fontSize: 9,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: COLORS.black,
  },
  
  // Subtotal + IVA
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: COLORS.ultraLightGray,
  },
  ivaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottom: `2px solid ${COLORS.mediumGray}`,
  },
  
  // Total
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: COLORS.black,
    marginTop: 1,
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: COLORS.white,
    letterSpacing: 2,
  },
  totalValue: {
    fontSize: 20,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  
  // Proyecto/Anticipo
  proyectoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottom: `1px solid ${COLORS.lightGray}`,
    fontStyle: 'italic',
  },
  proyectoLabel: {
    fontSize: 8,
    color: COLORS.mediumGray,
  },
  proyectoValue: {
    fontSize: 8,
    color: COLORS.mediumGray,
  },
  
  // Saldo Restante - EL MÁS IMPORTANTE
  saldoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: COLORS.accentBlue,
    marginTop: 1,
  },
  saldoLabel: {
    fontSize: 10,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: COLORS.white,
    letterSpacing: 1.5,
  },
  saldoValue: {
    fontSize: 16,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: COLORS.white,
    letterSpacing: -0.5,
  },
});

interface PDFDocumentProps {
  presupuesto: Presupuesto;
}

export const PDFDocument: React.FC<PDFDocumentProps> = ({ presupuesto }) => {
  // Información del taller (usada en renderHeader)
  const TALLER_INFO = {
    nombre: 'SAG GARAGE',
    encargado: 'SERVICIO AUTOMOTRIZ GUDIÑO',
    telefono: '5513422917',
    direccion: 'PRIVADA NICOLAS BRAVO 6, SAN MATEO NOPALA, NAUCALPAN.',
  };
  // Se usa TALLER_INFO.encargado en el header
  console.log(TALLER_INFO.nombre); // Evitar warning de variable no usada

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: string | Date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Renderizar header (reutilizable)
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoSection}>
        <Image src={`${window.location.origin}/logo.png`} style={styles.logo} />
        <View style={styles.titleSection}>
          <Text style={styles.companyName}>SAG GARAGE</Text>
          <Text style={styles.ownerName}>SERVICIO AUTOMOTRIZ GUDIÑO</Text>
        </View>
      </View>
      <View style={styles.addressSection}>
        <Text style={styles.addressText}>FECHA: {formatDate(presupuesto.fecha)}</Text>
        <Text style={styles.addressText}>HORA: {formatTime(presupuesto.fecha)}</Text>
        <Text style={styles.addressText}>PRIVADA NICOLAS BRAVO 6, SAN MATEO NOPALA, NAUCALPAN.</Text>
        <Text style={styles.addressText}>5513422917</Text>
      </View>
    </View>
  );

  // Renderizar cards Cliente y Vehículo (reutilizable)
  const renderClienteVehiculoCards = () => (
    <View style={styles.cardsRow}>
      {/* CLIENTE */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>CLIENTE</Text>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>SR. {presupuesto.cliente.nombreCompleto?.toUpperCase() || 'N/A'}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardValue}>{presupuesto.cliente.telefono || 'N/A'}</Text>
        </View>
        {presupuesto.cliente.domicilio && (
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>{presupuesto.cliente.domicilio}</Text>
          </View>
        )}
      </View>

      {/* VEHÍCULO - LAYOUT COMPACTO EN 2 COLUMNAS */}
      <View style={[styles.card, { padding: 6 }]}>
        <Text style={styles.cardTitle}>VEHÍCULO</Text>
        
        {/* Fila 1: Marca/Modelo | Color */}
        <View style={{ flexDirection: 'row', marginBottom: 2 }}>
          <View style={{ width: '60%' }}>
            <Text style={[styles.cardValue, { fontSize: 8 }]}>
              {presupuesto.vehiculo.marca} {presupuesto.vehiculo.modelo} {presupuesto.vehiculo.year || ''}
            </Text>
          </View>
          <View style={{ width: '40%', flexDirection: 'row' }}>
            <Text style={[styles.cardLabel, { fontSize: 7.5 }]}>Color: </Text>
            <Text style={[styles.cardValue, { fontSize: 7.5 }]}>{presupuesto.vehiculo.color || 'N/A'}</Text>
          </View>
        </View>
        
        {/* Fila 2: Placas | Kilómetros */}
        <View style={{ flexDirection: 'row', marginBottom: 2 }}>
          <View style={{ width: '60%', flexDirection: 'row' }}>
            <Text style={[styles.cardLabel, { fontSize: 7.5 }]}>Placas: </Text>
            <Text style={[styles.cardValue, { fontSize: 7.5 }]}>{presupuesto.vehiculo.placas || 'N/A'}</Text>
          </View>
          <View style={{ width: '40%', flexDirection: 'row' }}>
            <Text style={[styles.cardLabel, { fontSize: 7.5 }]}>Kilómetros: </Text>
            <Text style={[styles.cardValue, { fontSize: 7.5 }]}>{presupuesto.vehiculo.kilometrajeEntrada || 'N/A'}</Text>
          </View>
        </View>
        
        {/* Fila 3: NIV | Gasolina */}
        <View style={{ flexDirection: 'row' }}>
          {presupuesto.vehiculo.niv ? (
            <>
              <View style={{ width: '60%', flexDirection: 'row' }}>
                <Text style={[styles.cardLabel, { fontSize: 7.5 }]}>NIV(VIN): </Text>
                <Text style={[styles.cardValue, { fontSize: 7.5 }]}>{presupuesto.vehiculo.niv}</Text>
              </View>
              <View style={{ width: '40%', flexDirection: 'row' }}>
                <Text style={[styles.cardLabel, { fontSize: 7.5 }]}>Gas: </Text>
                <Text style={[styles.cardValue, { fontSize: 7.5 }]}>{presupuesto.vehiculo.nivelGasolina || '0'}%</Text>
              </View>
            </>
          ) : (
            <View style={{ width: '100%', flexDirection: 'row' }}>
              <Text style={[styles.cardLabel, { fontSize: 7.5 }]}>Gasolina: </Text>
              <Text style={[styles.cardValue, { fontSize: 7.5 }]}>{presupuesto.vehiculo.nivelGasolina || '0'}%</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <Document>
      {/* ============= PÁGINA 1: PRESUPUESTO ============= */}
      <Page size="A4" style={styles.page}>
        {renderHeader()}

        <View style={styles.content}>
          {renderClienteVehiculoCards()}

          {/* 1. SERVICIOS */}
          {presupuesto.servicios && presupuesto.servicios.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>1. SERVICIOS</Text>
              </View>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.col60]}>DESCRIPCIÓN</Text>
                <Text style={[styles.tableHeaderText, styles.col20, styles.colRight]}>IMPORTE</Text>
              </View>
              {presupuesto.servicios.map((servicio, idx) => (
                <View key={idx} style={idx % 2 === 0 ? styles.tableRow : [styles.tableRow, styles.tableRowAlt]}>
                  <Text style={[styles.tableCell, styles.col60]}>{servicio.descripcion.toUpperCase()}</Text>
                  <Text style={[styles.tableCell, styles.tableCellBold, styles.col20, styles.colRight]}>
                    {formatCurrency(servicio.precio)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* 2. REFACCIONES */}
          {presupuesto.refacciones && presupuesto.refacciones.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>2. REFACCIONES</Text>
              </View>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.col50]}>DESCRIPCIÓN</Text>
                <Text style={[styles.tableHeaderText, styles.col15, styles.colCenter]}>CANT.</Text>
                <Text style={[styles.tableHeaderText, styles.col20, styles.colRight]}>P. UNITARIO</Text>
                <Text style={[styles.tableHeaderText, styles.col20, styles.colRight]}>TOTAL</Text>
              </View>
              {presupuesto.refacciones.map((refaccion, idx) => {
                const precioUnitario = refaccion.total / refaccion.cantidad;
                return (
                  <View key={idx} style={idx % 2 === 0 ? styles.tableRow : [styles.tableRow, styles.tableRowAlt]}>
                    <Text style={[styles.tableCell, styles.col50]}>{refaccion.nombre.toUpperCase()}</Text>
                    <Text style={[styles.tableCell, styles.col15, styles.colCenter]}>{refaccion.cantidad}</Text>
                    <Text style={[styles.tableCell, styles.col20, styles.colRight]}>{formatCurrency(precioUnitario)}</Text>
                    <Text style={[styles.tableCell, styles.tableCellBold, styles.col20, styles.colRight]}>
                      {formatCurrency(refaccion.total)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* 3. MANO DE OBRA */}
          {presupuesto.manoDeObra && presupuesto.manoDeObra.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>3. MANO DE OBRA</Text>
              </View>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.col60]}>DESCRIPCIÓN</Text>
                <Text style={[styles.tableHeaderText, styles.col20, styles.colRight]}>IMPORTE</Text>
              </View>
              {presupuesto.manoDeObra.map((trabajo, idx) => (
                <View key={idx} style={idx % 2 === 0 ? styles.tableRow : [styles.tableRow, styles.tableRowAlt]}>
                  <Text style={[styles.tableCell, styles.col60]}>{trabajo.descripcion.toUpperCase()}</Text>
                  <Text style={[styles.tableCell, styles.tableCellBold, styles.col20, styles.colRight]}>
                    {formatCurrency(trabajo.precio)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* TÉRMINOS Y RESUMEN */}
          <View style={styles.bottomSection}>
            {/* TÉRMINOS Y CONDICIONES */}
            <View style={styles.termsSection}>
              <Text style={styles.termsTitle}>TÉRMINOS Y CONDICIONES:</Text>
              <Text style={styles.termsText}>
                Este documento es un presupuesto informativo y tiene una vigencia de 15 días. Los
                precios de refacciones están sujetos a cambio sin previo aviso. Toda reparación requiere
                un anticipo del 50%. La garantía en mano de obra es de 30 días naturales. No nos
                hacemos responsables por objetos de valor dejados dentro del vehículo.
              </Text>
            </View>

            {/* RESUMEN FINANCIERO */}
            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Servicios:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(presupuesto.resumen?.servicios || 0)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Refacciones:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(presupuesto.resumen?.refacciones || 0)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Mano de Obra:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(presupuesto.resumen?.manoDeObra || 0)}</Text>
              </View>

              {/* SUBTOTAL si incluye IVA */}
              {presupuesto.resumen?.incluirIVA && (
                <>
                  <View style={styles.subtotalRow}>
                    <Text style={styles.summaryLabel}>Subtotal:</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(presupuesto.resumen.subtotal || 0)}</Text>
                  </View>
                  <View style={styles.ivaRow}>
                    <Text style={styles.summaryLabel}>IVA (16%):</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(presupuesto.resumen.iva || 0)}</Text>
                  </View>
                </>
              )}

              {/* TOTAL */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL{presupuesto.resumen?.incluirIVA ? '' : ' (SIN IVA)'}</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(presupuesto.resumen?.incluirIVA ? presupuesto.resumen.total : presupuesto.resumen?.subtotal || 0)}
                </Text>
              </View>

              {/* PROYECTO (Anticipo) */}
              <View style={styles.proyectoRow}>
                <Text style={styles.proyectoLabel}>PROYECTO:</Text>
              </View>
              <View style={styles.proyectoRow}>
                <Text style={styles.proyectoLabel}>(-) Anticipo recibido:</Text>
                <Text style={styles.proyectoValue}>{formatCurrency(presupuesto.resumen?.anticipo || 0)}</Text>
              </View>

              {/* SALDO RESTANTE - LA ESTRELLA */}
              <View style={styles.saldoRow}>
                <Text style={styles.saldoLabel}>SALDO RESTANTE:</Text>
                <Text style={styles.saldoValue}>{formatCurrency(presupuesto.resumen?.restante || 0)}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>

      {/* ============= PÁGINA 2: ORDEN DE TRABAJO ============= */}
      <Page size="A4" style={styles.page}>
        {renderHeader()}

        <View style={styles.content}>
          {renderClienteVehiculoCards()}

          {/* PROBLEMA REPORTADO Y DIAGNÓSTICO */}
          {(presupuesto.problemaReportado || presupuesto.diagnosticoTecnico) && (
            <View style={styles.cardsRow}>
              {presupuesto.problemaReportado && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>PROBLEMA REPORTADO</Text>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardValue}>{presupuesto.problemaReportado}</Text>
                  </View>
                </View>
              )}
              {presupuesto.diagnosticoTecnico && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>DIAGNÓSTICO TÉCNICO</Text>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardValue}>{presupuesto.diagnosticoTecnico}</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* INSPECCIÓN VEHICULAR - 3 COLUMNAS: 33% - 33% - 34% */}
          {presupuesto.inspeccion && (
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              {/* EXTERIORES - 33% */}
              <View style={{ width: '33%' }}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>EXTERIORES</Text>
                </View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { width: '65%', fontSize: 7 }]}>COMPONENTE</Text>
                  <Text style={[styles.tableHeaderText, { width: '35%', fontSize: 7 }, styles.colCenter]}>ESTADO</Text>
                </View>
                {[
                  { key: 'lucesFrontales', label: 'Luces Frontales' },
                  { key: 'cuartoLuces', label: 'Cuarto Luces' },
                  { key: 'antena', label: 'Antena' },
                  { key: 'espejosLaterales', label: 'Espejos Laterales' },
                  { key: 'cristales', label: 'Cristales' },
                  { key: 'emblemas', label: 'Emblemas' },
                  { key: 'llantas', label: 'Llantas' },
                  { key: 'taponRuedas', label: 'Tapón Ruedas' },
                  { key: 'moldurasCompletas', label: 'Molduras Completas' },
                  { key: 'taponGasolina', label: 'Tapón Gasolina' },
                  { key: 'limpiadores', label: 'Limpiadores' },
                ].map((item, idx) => {
                  const value = presupuesto.inspeccion.exteriores[item.key as keyof typeof presupuesto.inspeccion.exteriores];
                  return (
                    <View key={item.key} style={[styles.tableRow, idx % 2 !== 0 ? styles.tableRowAlt : {}, { paddingVertical: 2 }]}>
                      <Text style={[styles.tableCell, { width: '65%', fontSize: 6.5 }]}>{item.label}</Text>
                      <Text style={[styles.tableCell, styles.tableCellBold, { width: '35%', fontSize: 6.5, color: value ? COLORS.success : COLORS.danger }, styles.colCenter]}>
                        {value ? 'OK' : 'FALTA'}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* INTERIORES - 33% */}
              <View style={{ width: '33%' }}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>INTERIORES</Text>
                </View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { width: '65%', fontSize: 7 }]}>COMPONENTE</Text>
                  <Text style={[styles.tableHeaderText, { width: '35%', fontSize: 7 }, styles.colCenter]}>ESTADO</Text>
                </View>
                {[
                  { key: 'instrumentoTablero', label: 'Instrumento Tablero' },
                  { key: 'calefaccion', label: 'Calefacción' },
                  { key: 'sistemaSonido', label: 'Sistema Sonido' },
                  { key: 'bocinas', label: 'Bocinas' },
                  { key: 'espejoRetrovisor', label: 'Espejo Retrovisor' },
                  { key: 'cinturones', label: 'Cinturones' },
                  { key: 'botoniaGeneral', label: 'Botonería General' },
                  { key: 'manijas', label: 'Manijas' },
                  { key: 'tapetes', label: 'Tapetes' },
                  { key: 'vestiduras', label: 'Vestiduras' },
                  { key: 'otros', label: 'Otros' },
                ].map((item, idx) => {
                  const value = presupuesto.inspeccion.interiores[item.key as keyof typeof presupuesto.inspeccion.interiores];
                  return (
                    <View key={item.key} style={[styles.tableRow, idx % 2 !== 0 ? styles.tableRowAlt : {}, { paddingVertical: 2 }]}>
                      <Text style={[styles.tableCell, { width: '65%', fontSize: 6.5 }]}>{item.label}</Text>
                      <Text style={[styles.tableCell, styles.tableCellBold, { width: '35%', fontSize: 6.5, color: value ? COLORS.success : COLORS.danger }, styles.colCenter]}>
                        {value ? 'OK' : 'FALTA'}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* PUNTOS DE SEGURIDAD - 34% */}
              <View style={{ width: '34%' }}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>PUNTOS DE SEGURIDAD</Text>
                </View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { width: '70%', fontSize: 7 }]}>VERIFICACIÓN</Text>
                  <Text style={[styles.tableHeaderText, { width: '30%', fontSize: 7 }, styles.colCenter]}>ESTADO</Text>
                </View>
                {presupuesto.puntosSeguridad && presupuesto.puntosSeguridad.length > 0 ? (
                  presupuesto.puntosSeguridad.map((puntoOrden, idx) => {
                    const nombrePunto = puntoOrden.punto?.nombre || 'Punto desconocido';
                    const nombreEstado = puntoOrden.estado?.nombre || 'N/A';
                    
                    const getEstadoColor = (estado: string) => {
                      const estadoNorm = estado.toLowerCase();
                      if (estadoNorm === 'bueno') return COLORS.success; // Verde
                      if (estadoNorm === 'recomendado') return COLORS.warning; // Amarillo/Naranja
                      if (estadoNorm === 'urgente') return COLORS.danger; // Rojo
                      return COLORS.mediumGray; // Default gris
                    };

                    return (
                      <View key={puntoOrden.id} style={[styles.tableRow, idx % 2 !== 0 ? styles.tableRowAlt : {}, { paddingVertical: 3 }]}>
                        <Text style={[styles.tableCell, { width: '70%', fontSize: 6.5 }]}>{nombrePunto}</Text>
                        <Text style={[
                          styles.tableCell, 
                          styles.tableCellBold, 
                          { width: '30%', fontSize: 6.5, color: getEstadoColor(nombreEstado) }, 
                          styles.colCenter
                        ]}>
                          {nombreEstado.toUpperCase()}
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  <View style={{ padding: 8, backgroundColor: COLORS.ultraLightGray, alignItems: 'center' }}>
                    <Text style={{ fontSize: 7, color: COLORS.mediumGray, fontStyle: 'italic' }}>
                      No hay puntos de seguridad registrados
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* SECCIÓN INFERIOR: SERVICIOS Y DAÑOS ADICIONALES */}
          <View style={{ flexDirection: 'row', gap: 15, marginTop: 10 }}>
            {/* SERVICIOS A REALIZAR */}
            <View style={{ flex: 1 }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>SERVICIOS A REALIZAR</Text>
              </View>
              {presupuesto.servicios && presupuesto.servicios.length > 0 ? (
                <View style={{ backgroundColor: COLORS.ultraLightGray, padding: 6 }}>
                  {presupuesto.servicios.slice(0, 5).map((servicio, idx) => (
                    <Text key={idx} style={{ fontSize: 7, marginBottom: 2, color: COLORS.darkGray }}>
                      • {servicio.descripcion}
                    </Text>
                  ))}
                  {presupuesto.servicios.length > 5 && (
                    <Text style={{ fontSize: 7, color: COLORS.mediumGray, fontStyle: 'italic' }}>
                      ...y {presupuesto.servicios.length - 5} más
                    </Text>
                  )}
                </View>
              ) : (
                <View style={{ padding: 8, backgroundColor: COLORS.ultraLightGray, alignItems: 'center' }}>
                  <Text style={{ fontSize: 7, color: COLORS.mediumGray, fontStyle: 'italic' }}>
                    No hay servicios registrados
                  </Text>
                </View>
              )}
            </View>

            {/* DAÑOS ADICIONALES */}
            <View style={{ flex: 1 }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>DAÑOS ADICIONALES</Text>
              </View>
              {presupuesto.inspeccion?.danosAdicionales && presupuesto.inspeccion.danosAdicionales.length > 0 ? (
                <>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { width: '30%', fontSize: 7 }]}>UBICACIÓN</Text>
                    <Text style={[styles.tableHeaderText, { width: '25%', fontSize: 7 }]}>TIPO</Text>
                    <Text style={[styles.tableHeaderText, { width: '45%', fontSize: 7 }]}>DESCRIPCIÓN</Text>
                  </View>
                  {presupuesto.inspeccion.danosAdicionales.slice(0, 5).map((dano, idx) => (
                    <View key={dano.id} style={[styles.tableRow, idx % 2 !== 0 ? styles.tableRowAlt : {}, { paddingVertical: 2 }]}>
                      <Text style={[styles.tableCell, { width: '30%', fontSize: 6.5 }]}>{dano.ubicacion}</Text>
                      <Text style={[styles.tableCell, { width: '25%', fontSize: 6.5 }]}>{dano.tipo}</Text>
                      <Text style={[styles.tableCell, { width: '45%', fontSize: 6.5 }]}>{dano.descripcion}</Text>
                    </View>
                  ))}
                </>
              ) : (
                <View style={{ padding: 8, backgroundColor: COLORS.ultraLightGray, alignItems: 'center' }}>
                  <Text style={{ fontSize: 7, color: COLORS.mediumGray, fontStyle: 'italic' }}>
                    Sin daños reportados
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* ESPACIADOR PARA SEPARAR DE LA PÁGINA 3 */}
   

        </View>
      </Page>

      {/* ============= PÁGINA 3: PRESUPUESTO Y FIRMAS ============= */}
      <Page size="A4" style={styles.page}>
        {renderHeader()}

        <View style={styles.content}>
          {renderClienteVehiculoCards()}

          {/* CONTENIDO CENTRADO PARA PRESUPUESTO Y FIRMAS */}
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            
            {/* TABLA DE PRESUPUESTO CENTRADA */}
            <View style={{ width: '60%', marginBottom: 40 }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>PRESUPUESTO</Text>
              </View>
              
              <View style={{ backgroundColor: COLORS.ultraLightGray, padding: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, paddingVertical: 4 }}>
                  <Text style={{ fontSize: 11, color: COLORS.darkGray, fontFamily: 'Roboto', fontWeight: 500 }}>Presupuesto:</Text>
                  <Text style={{ fontSize: 11, fontFamily: 'Roboto', fontWeight: 700, color: COLORS.black }}>
                    {formatCurrency(presupuesto.resumen?.total || 0)}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, paddingVertical: 4 }}>
                  <Text style={{ fontSize: 11, color: COLORS.darkGray, fontFamily: 'Roboto', fontWeight: 500 }}>Anticipo:</Text>
                  <Text style={{ fontSize: 11, fontFamily: 'Roboto', fontWeight: 700, color: COLORS.black }}>
                    {formatCurrency(presupuesto.resumen?.anticipo || 0)}
                  </Text>
                </View>
                
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    borderTop: `3px solid ${COLORS.accentBlue}`,
                    paddingTop: 8,
                    marginTop: 8,
                    paddingVertical: 6,
                  }}
                >
                  <Text style={{ fontSize: 14, fontFamily: 'Roboto', fontWeight: 700, color: COLORS.accentBlue }}>
                    Saldo:
                  </Text>
                  <Text style={{ fontSize: 16, fontFamily: 'Roboto', fontWeight: 700, color: COLORS.accentBlue }}>
                    {formatCurrency(presupuesto.resumen?.restante || 0)}
                  </Text>
                </View>
                
                <Text
                  style={{
                    fontSize: 8,
                    color: COLORS.danger,
                    fontStyle: 'italic',
                    marginTop: 8,
                    textAlign: 'center',
                    fontFamily: 'Roboto',
                  }}
                >
                  Todo trabajo autorizado requiere de un anticipo del 35%
                </Text>
              </View>
            </View>

            {/* SECCIÓN DE FIRMAS ESPACIOSA */}
            <View style={{ width: '80%', flexDirection: 'row', gap: 60, justifyContent: 'center' }}>
              {/* FIRMA ENCARGADO */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ height: 80, width: '100%', marginBottom: 10 }} />
                <View style={{ borderTop: `2px solid ${COLORS.darkGray}`, paddingTop: 6, width: '100%' }}>
                  <Text style={{ 
                    fontSize: 10, 
                    textAlign: 'center', 
                    color: COLORS.darkGray, 
                    fontFamily: 'Roboto', 
                    fontWeight: 700,
                    marginBottom: 4
                  }}>
                    FIRMA ENCARGADO
                  </Text>
                  <Text style={{ fontSize: 8, textAlign: 'center', color: COLORS.mediumGray, marginTop: 2 }}>
                    ENCARGADO
                  </Text>
                </View>
              </View>

              {/* FIRMA CLIENTE */}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ height: 80, width: '100%', marginBottom: 10 }} />
                <View style={{ borderTop: `2px solid ${COLORS.darkGray}`, paddingTop: 6, width: '100%' }}>
                  <Text style={{ 
                    fontSize: 10, 
                    textAlign: 'center', 
                    color: COLORS.darkGray, 
                    fontFamily: 'Roboto', 
                    fontWeight: 700,
                    marginBottom: 4
                  }}>
                    FIRMA CLIENTE
                  </Text>
                  <Text style={{ fontSize: 8, textAlign: 'center', color: COLORS.mediumGray, marginTop: 2 }}>
                    {presupuesto.cliente.nombreCompleto?.toUpperCase() || 'CLIENTE'}
                  </Text>
                </View>
              </View>
            </View>

            {/* NOTA ADICIONAL */}
            <View style={{ marginTop: 40, width: '70%', textAlign: 'center' }}>
              <Text style={{ 
                fontSize: 9, 
                color: COLORS.mediumGray, 
                textAlign: 'center', 
                fontStyle: 'italic',
                lineHeight: 1.4
              }}>
                Al firmar este documento, el cliente autoriza la realización de los trabajos especificados
                y acepta los términos y condiciones establecidos en el presupuesto.
              </Text>
            </View>

          </View>
        </View>
      </Page>
    </Document>
  );
};
