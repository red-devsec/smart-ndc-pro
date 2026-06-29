import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Captures a DOM element as canvas and exports it as a paginated PDF.
 */
export async function exportElementToPdf(element: HTMLElement, filename: string, title?: string) {
  const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const usableWidth = pageWidth - margin * 2;

  const imgHeight = (canvas.height * usableWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = margin;

  if (title) {
    pdf.setFontSize(16);
    pdf.setTextColor(0);
    pdf.text(title, margin, margin + 4);
    position = margin + 12;
    heightLeft -= 0;
  }

  pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);
  heightLeft -= pageHeight - position;

  while (heightLeft > 0) {
    pdf.addPage();
    const yOffset = -(imgHeight - heightLeft) + margin;
    pdf.addImage(imgData, "PNG", margin, yOffset, usableWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;
  }

  pdf.save(filename);
}