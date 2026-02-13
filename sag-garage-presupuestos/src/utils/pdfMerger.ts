import { PDFDocument } from 'pdf-lib';

/**
 * Fusiona el PDF generado con el PDF de garantía
 * @param generatedPdfBlob - El Blob del PDF generado por react-pdf
 * @returns Promise<Blob> - El Blob del PDF fusionado
 */
export async function mergePDFWithGarantia(generatedPdfBlob: Blob): Promise<Blob> {
  try {
    // Cargar el PDF generado
    const generatedPdfBytes = await generatedPdfBlob.arrayBuffer();
    const generatedPdf = await PDFDocument.load(generatedPdfBytes);

    // Cargar el PDF de garantía desde public (con base path correcto)
    const baseUrl = import.meta.env.BASE_URL || '/';
    const garantiaUrl = `${baseUrl}Garantia.pdf`.replace('//', '/');
    const garantiaResponse = await fetch(garantiaUrl);
    if (!garantiaResponse.ok) {
      throw new Error(`No se pudo cargar el PDF de garantía desde ${garantiaUrl}`);
    }
    const garantiaPdfBytes = await garantiaResponse.arrayBuffer();
    const garantiaPdf = await PDFDocument.load(garantiaPdfBytes);

    // Crear un nuevo PDF que contendrá ambos
    const mergedPdf = await PDFDocument.create();

    // Copiar todas las páginas del PDF generado
    const generatedPages = await mergedPdf.copyPages(
      generatedPdf,
      generatedPdf.getPageIndices()
    );
    generatedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });

    // Copiar todas las páginas del PDF de garantía
    const garantiaPages = await mergedPdf.copyPages(
      garantiaPdf,
      garantiaPdf.getPageIndices()
    );
    garantiaPages.forEach((page) => {
      mergedPdf.addPage(page);
    });

    // Guardar el PDF fusionado
    const mergedPdfBytes = await mergedPdf.save();
    
    // Convertir a Blob
    return new Blob([new Uint8Array(mergedPdfBytes)], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error al fusionar PDFs:', error);
    throw error;
  }
}
