import PDFDocument from "pdfkit";
import { uploadFile, getFileUrl } from "./storage.service";

const DEFAULT_CFG = {
  companyName: "SMART NDC Pro",
  companySubtitle: "Nouvelles Ducasses Confiserie Maroc",
  companyPhone: "Bureau : +212 5XX XX XX XX",
  companyEmail: "Email : rh@smartndc.ma",
  city: "Casablanca",
  primaryColor: "#465FFF",
  signatureText: "SMART NDC Pro",
};

interface AttestationData {
  employeeName: string;
  employeePosition: string;
  hireDate: string;
  salary: number;
  companyName?: string;
}

interface PayslipData {
  employeeName: string;
  month: number;
  year: number;
  baseSalary: number;
  bonuses: number;
  overtime: number;
  paidLeave: number;
  cnss: number;
  tax: number;
  netSalary: number;
}

let templateCache: Record<string, string> | null = null;

function loadTemplateSettings() {
  return {
    companyName: templateCache?.companyName || DEFAULT_CFG.companyName,
    companySubtitle: templateCache?.companySubtitle || DEFAULT_CFG.companySubtitle,
    companyPhone: templateCache?.companyPhone || DEFAULT_CFG.companyPhone,
    companyEmail: templateCache?.companyEmail || DEFAULT_CFG.companyEmail,
    city: templateCache?.city || DEFAULT_CFG.city,
    primaryColor: templateCache?.primaryColor || DEFAULT_CFG.primaryColor,
    signatureText: templateCache?.signatureText || DEFAULT_CFG.signatureText,
    logoUrl: templateCache?.logoUrl,
  };
}

export function reloadTemplateCache(settings: Record<string, string>) {
  templateCache = settings;
}

function generateHeader(doc: any) {
  const cfg = loadTemplateSettings();
  doc.fontSize(20).font("Helvetica-Bold").text(cfg.companyName, { align: "center" });
  doc.fontSize(10).font("Helvetica").text(cfg.companySubtitle, { align: "center" });
  doc.text(`${cfg.companyPhone} | ${cfg.companyEmail}`, { align: "center" });
  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();
}

export async function generateAttestationPdf(
  type: "work" | "salary" | "tax",
  data: AttestationData
): Promise<string> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => buffers.push(chunk));
    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(buffers);
        const filename = `attestation-${type}-${Date.now()}.pdf`;
        const key = await uploadFile(pdfBuffer, filename, "application/pdf", "certificates");
        const url = await getFileUrl(key);
        resolve(url);
      } catch (err) {
        reject(err);
      }
    });
    doc.on("error", reject);

    generateHeader(doc);

    const titles: Record<string, string> = {
      work: "ATTESTATION DE TRAVAIL",
      salary: "ATTESTATION DE SALAIRE",
      tax: "ATTESTATION FISCALE (IR)",
    };

    doc.fontSize(14).font("Helvetica-Bold").text(titles[type], { align: "center" });
    doc.moveDown(2);

    const date = new Date().toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric",
    });
    const cfg = loadTemplateSettings();
    doc.fontSize(10).font("Helvetica").text(`Fait à ${cfg.city}, le ${date}`, { align: "right" });
    doc.moveDown();

    doc.text(`Je soussigné, représentant légal de ${cfg.companyName}, certifie que :`);
    doc.moveDown();
    doc.font("Helvetica-Bold").text(`Monsieur/Madame ${data.employeeName}`);
    doc.font("Helvetica").text(`Occupant le poste de : ${data.employeePosition}`);
    doc.text(`Date d'embauche : ${data.hireDate}`);

    if (type === "salary" || type === "tax") {
      doc.text(`Salaire mensuel brut : ${data.salary.toLocaleString("fr-FR")} MAD`);
    }

    doc.moveDown(2);
    doc.text("Cette attestation est délivrée à l'intéressé(e) pour faire valoir ce que de droit.");
    doc.moveDown(3);

    doc.text("Signature et cachet :", { align: "right" });
    doc.moveDown(2);
    doc.text(cfg.signatureText, { align: "right" });

    doc.end();
  });
}

export async function generatePayslipPdf(data: PayslipData): Promise<string> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => buffers.push(chunk));
    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(buffers);
        const filename = `bulletin-${data.year}-${String(data.month).padStart(2, "0")}-${Date.now()}.pdf`;
        const key = await uploadFile(pdfBuffer, filename, "application/pdf", "payslips");
        const url = await getFileUrl(key);
        resolve(url);
      } catch (err) {
        reject(err);
      }
    });
    doc.on("error", reject);

    generateHeader(doc);

    const monthNames = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
    ];

    doc.fontSize(14).font("Helvetica-Bold").text("BULLETIN DE PAIE", { align: "center" });
    doc.fontSize(11).text(`Mois de ${monthNames[data.month - 1]} ${data.year}`, { align: "center" });
    doc.moveDown(2);

    doc.fontSize(11).font("Helvetica-Bold").text(`Employé : ${data.employeeName}`);
    doc.moveDown();

    const lineHeight = 18;
    let y = doc.y;

    const drawRow = (label: string, value: string, bold = false) => {
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(10);
      doc.text(label, 50, y, { width: 250 });
      doc.text(value, 300, y, { width: 200, align: "right" });
      y += lineHeight;
    };

    drawRow("Salaire de base", `${data.baseSalary.toLocaleString("fr-FR")} MAD`, true);
    drawRow("Primes", `${data.bonuses.toLocaleString("fr-FR")} MAD`);
    drawRow("Heures supplémentaires", `${data.overtime.toLocaleString("fr-FR")} MAD`);
    drawRow("Congés payés", `${data.paidLeave.toLocaleString("fr-FR")} MAD`);

    y += 5;
    doc.moveTo(50, y).lineTo(500, y).stroke();
    y += 10;

    const brut = data.baseSalary + data.bonuses + data.overtime + data.paidLeave;
    drawRow("Salaire Brut", `${brut.toLocaleString("fr-FR")} MAD`, true);

    y += 5;
    doc.moveTo(50, y).lineTo(500, y).stroke();
    y += 10;

    drawRow("CNSS", `${data.cnss.toLocaleString("fr-FR")} MAD`);
    drawRow("Impôt sur le Revenu (IR)", `${data.tax.toLocaleString("fr-FR")} MAD`);

    y += 5;
    doc.moveTo(50, y).lineTo(500, y).stroke();
    y += 10;

    drawRow("NET À PAYER", `${data.netSalary.toLocaleString("fr-FR")} MAD`, true);

    doc.y = y + 30;
    doc.moveDown(2);
    doc.fontSize(8).font("Helvetica").text(
      "Arrêté la présente à la somme de " + data.netSalary.toLocaleString("fr-FR") + " Dirhams Marocains.",
      { align: "center" }
    );

    doc.end();
  });
}
