import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(4, "Mot de passe trop court"),
});

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(4, "Mot de passe trop court"),
  name: z.string().min(2, "Nom requis"),
  role: z.string().optional(),
});

export const employeeSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  position: z.string().min(1, "Poste requis"),
  departmentId: z.string().min(1, "Département requis"),
  hireDate: z.string().or(z.date()),
  salary: z.number().positive("Salaire positif requis"),
});

export const employeeUpdateSchema = employeeSchema.partial();

export const leaveSchema = z.object({
  employeeId: z.string().min(1),
  type: z.enum(["annual", "sick", "personal", "maternity"]),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  reason: z.string().min(2, "Motif requis"),
  documentUrl: z.string().optional(),
});

export const leaveStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reviewedBy: z.string().min(1),
});

export const productSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Catégorie requise"),
  barcode: z.string().min(1, "Code-barres requis"),
  price: z.number().positive("Prix positif requis"),
  quantity: z.number().int().min(0).default(0),
  minThreshold: z.number().int().min(0).default(5),
  location: z.string().optional(),
  image: z.string().optional(),
});

export const productUpdateSchema = productSchema.partial();

export const movementSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(["in", "out"]),
  reason: z.enum(["replenishment", "sale", "internal_use", "damaged"]),
  quantity: z.number().int().positive("Quantité positive requise"),
  employeeId: z.string().min(1),
  notes: z.string().optional(),
});

export const alertSchema = z.object({
  type: z.string().min(1),
  message: z.string().min(1),
  severity: z.enum(["info", "warning", "error"]),
  relatedId: z.string().optional(),
});

export const rfidSchema = z.object({
  uid: z.string().min(1, "UID requis"),
  employeeId: z.string().optional(),
});

export const rfidAssignSchema = z.object({
  cardId: z.string().min(1),
  employeeId: z.string().min(1),
});

export const certificateSchema = z.object({
  employeeId: z.string().min(1),
  type: z.enum(["work", "salary", "tax"]),
});

export const certificateStatusSchema = z.object({
  status: z.enum(["generated", "rejected"]),
});

export const payslipGenerateSchema = z.object({
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2020).max(2100).optional(),
});

export const userSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(4, "Mot de passe trop court"),
  name: z.string().min(2, "Nom requis"),
  role: z.string().min(1, "Rôle requis"),
});

export const userUpdateSchema = userSchema.partial();

export const checkinSchema = z.object({
  location: z.string().optional(),
  rfidCardId: z.string().optional(),
});
