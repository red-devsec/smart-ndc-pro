import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { uploadFile, getFileUrl } from "./storage.service";

export async function exportAttendanceExcel(
  records: { employeeName: string; date: string; checkIn: string; checkOut: string; hoursWorked: number; status: string }[]
): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Pointages");

  sheet.columns = [
    { header: "Employé", key: "employeeName", width: 25 },
    { header: "Date", key: "date", width: 15 },
    { header: "Entrée", key: "checkIn", width: 10 },
    { header: "Sortie", key: "checkOut", width: 10 },
    { header: "Heures", key: "hoursWorked", width: 10 },
    { header: "Statut", key: "status", width: 12 },
  ];

  sheet.getRow(1).font = { bold: true };
  records.forEach((r) => sheet.addRow(r));

  const buffer = await workbook.xlsx.writeBuffer();
  const key = await uploadFile(Buffer.from(buffer), `pointages-${Date.now()}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "exports");
  return await getFileUrl(key);
}

export async function exportInventoryPdf(
  products: { name: string; barcode: string; category: string; quantity: number; price: number; location: string }[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
    const buffers: Buffer[] = [];
    doc.on("data", (c: Buffer) => buffers.push(c));
    doc.on("end", async () => {
      const buf = Buffer.concat(buffers);
      const key = await uploadFile(buf, `inventaire-${Date.now()}.pdf`, "application/pdf", "exports");
      const url = await getFileUrl(key);
      resolve(url);
    });
    doc.on("error", reject);

    doc.fontSize(16).font("Helvetica-Bold").text("INVENTAIRE COMPLET", { align: "center" });
    doc.fontSize(10).font("Helvetica").text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, { align: "center" });
    doc.moveDown();

    const headers = ["Produit", "Code-barres", "Catégorie", "Qté", "Prix", "Emplacement"];
    const colWidths = [180, 100, 80, 50, 70, 80];
    let y = doc.y;

    const drawRow = (cells: string[], header = false) => {
      doc.font(header ? "Helvetica-Bold" : "Helvetica").fontSize(8);
      let x = 30;
      cells.forEach((cell, i) => {
        doc.text(cell, x, y, { width: colWidths[i], align: i >= 3 ? "center" : "left" });
        x += colWidths[i];
      });
      y += 18;
    };

    drawRow(headers, true);
    doc.moveTo(30, y - 2).lineTo(590, y - 2).stroke();

    products.forEach((p) => {
      if (y > 480) {
        doc.addPage();
        y = doc.y;
        drawRow(headers, true);
        doc.moveTo(30, y - 2).lineTo(590, y - 2).stroke();
      }
      drawRow([p.name, p.barcode, p.category, String(p.quantity), `${p.price} MAD`, p.location || "-"]);
    });

    doc.end();
  });
}

export async function exportMovementsExcel(
  movements: { date: string; employeeName: string; productName: string; type: string; reason: string; quantity: number }[]
): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Mouvements");

  sheet.columns = [
    { header: "Date", key: "date", width: 18 },
    { header: "Employé", key: "employeeName", width: 25 },
    { header: "Produit", key: "productName", width: 30 },
    { header: "Type", key: "type", width: 10 },
    { header: "Motif", key: "reason", width: 18 },
    { header: "Quantité", key: "quantity", width: 10 },
  ];

  sheet.getRow(1).font = { bold: true };
  movements.forEach((m) => sheet.addRow(m));

  const buffer = await workbook.xlsx.writeBuffer();
  const key = await uploadFile(Buffer.from(buffer), `mouvements-${Date.now()}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "exports");
  return await getFileUrl(key);
}

export async function exportDashboardPdf(
  stats: { label: string; value: string | number }[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers: Buffer[] = [];
    doc.on("data", (c: Buffer) => buffers.push(c));
    doc.on("end", async () => {
      const buf = Buffer.concat(buffers);
      const key = await uploadFile(buf, `dashboard-${Date.now()}.pdf`, "application/pdf", "exports");
      const url = await getFileUrl(key);
      resolve(url);
    });
    doc.on("error", reject);

    doc.fontSize(18).font("Helvetica-Bold").text("TABLEAU DE BORD", { align: "center" });
    doc.fontSize(10).font("Helvetica").text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, { align: "center" });
    doc.moveDown(2);

    stats.forEach((s) => {
      doc.fontSize(12).font("Helvetica-Bold").text(s.label, { continued: true });
      doc.font("Helvetica").text(`  ${s.value}`, { align: "right" });
      doc.moveDown(0.5);
    });

    doc.end();
  });
}
