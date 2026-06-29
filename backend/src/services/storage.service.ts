import { Client as MinioClient } from "minio";

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "minio";
const MINIO_PORT = parseInt(process.env.MINIO_PORT || "9000", 10);
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || "minioadmin";
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || "minioadmin";
const MINIO_BUCKET = process.env.MINIO_BUCKET || "smartndc";

let minioClient: MinioClient | null = null;

export function getStorageClient(): MinioClient {
  if (!minioClient) {
    minioClient = new MinioClient({
      endPoint: MINIO_ENDPOINT,
      port: MINIO_PORT,
      useSSL: false,
      accessKey: MINIO_ACCESS_KEY,
      secretKey: MINIO_SECRET_KEY,
    });
  }
  return minioClient;
}

export async function ensureBucket(): Promise<void> {
  const client = getStorageClient();
  const exists = await client.bucketExists(MINIO_BUCKET);
  if (!exists) {
    await client.makeBucket(MINIO_BUCKET, "us-east-1");
  }
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimetype: string,
  prefix = "uploads"
): Promise<string> {
  const client = getStorageClient();
  const key = `${prefix}/${Date.now()}-${filename}`;
  await client.putObject(MINIO_BUCKET, key, buffer, buffer.length, {
    "Content-Type": mimetype,
  });
  return key;
}

export async function getFileUrl(key: string): Promise<string> {
  const client = getStorageClient();
  return await client.presignedGetObject(MINIO_BUCKET, key, 24 * 60 * 60);
}

export async function deleteFile(key: string): Promise<void> {
  const client = getStorageClient();
  await client.removeObject(MINIO_BUCKET, key);
}

export async function uploadEmployeePhoto(
  buffer: Buffer,
  filename: string
): Promise<string> {
  return uploadFile(buffer, filename, "image/jpeg", "employees");
}

export async function uploadCertificate(
  buffer: Buffer,
  filename: string
): Promise<string> {
  return uploadFile(buffer, filename, "application/pdf", "certificates");
}

export async function uploadPayslip(
  buffer: Buffer,
  filename: string
): Promise<string> {
  return uploadFile(buffer, filename, "application/pdf", "payslips");
}
