import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/auth.middleware";
import { AppError } from "../middlewares/errorHandler";
import { success } from "../utils/response";
import { uploadFile, getFileUrl, ensureBucket } from "../services/storage.service";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Upload any file
router.post("/", requireAuth, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError("Fichier requis", 400);
    const prefix = (req.body.prefix as string) || "uploads";
    const key = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, prefix);
    const url = await getFileUrl(key);
    success(res, { key, url, filename: req.file.originalname }, "Fichier uploadé");
  } catch (e) { next(e); }
});

// Upload photo employé
router.post("/employee-photo", requireAuth, upload.single("photo"), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError("Photo requise", 400);
    const key = await uploadFile(req.file.buffer, `emp-${Date.now()}.jpg`, "image/jpeg", "employees");
    const url = await getFileUrl(key);
    success(res, { key, url }, "Photo uploadée");
  } catch (e) { next(e); }
});

// Upload attestation PDF
router.post("/certificate", requireAuth, upload.single("document"), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError("Document requis", 400);
    const key = await uploadFile(req.file.buffer, `cert-${Date.now()}.pdf`, "application/pdf", "certificates");
    const url = await getFileUrl(key);
    success(res, { key, url }, "Attestation uploadée");
  } catch (e) { next(e); }
});

// Upload bulletin de paie PDF
router.post("/payslip", requireAuth, upload.single("document"), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError("Document requis", 400);
    const key = await uploadFile(req.file.buffer, `pay-${Date.now()}.pdf`, "application/pdf", "payslips");
    const url = await getFileUrl(key);
    success(res, { key, url }, "Bulletin uploadé");
  } catch (e) { next(e); }
});

// Get file URL
router.get("/url/:key(*)", requireAuth, async (req, res, next) => {
  try {
    const url = await getFileUrl(String(req.params.key));
    success(res, { url });
  } catch (e) { next(e); }
});

export default router;
