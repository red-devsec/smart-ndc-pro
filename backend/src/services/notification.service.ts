import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let initialized = false;
let fcm: any = null;

async function init() {
  if (initialized) return;
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : undefined;

    if (serviceAccount) {
      const fb = await import("firebase-admin");
      if (!fb.getApps().length) {
        fb.initializeApp({ credential: fb.cert(serviceAccount) });
      }
      fcm = fb;
      initialized = true;
      console.log("Firebase Admin SDK initialized");
    } else {
      console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not set — push notifications disabled");
    }
  } catch (err) {
    console.error("Firebase init error:", err instanceof Error ? err.message : err);
  }
}

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  await init();
  if (!initialized || !fcm) return;

  try {
    const setting = await prisma.setting.findUnique({
      where: { key: `push_token:${userId}` },
    });
    if (!setting) return;

    const message = {
      notification: { title, body },
      data: data || {},
      token: setting.value,
    };

    await fcm.messaging().send(message);
  } catch (err) {
    console.error("Push notification error:", err instanceof Error ? err.message : err);
  }
}

export async function sendPushToRole(
  role: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  await init();
  if (!initialized) return;

  try {
    const users = await prisma.user.findMany({ where: { role } });
    for (const user of users) {
      await sendPushNotification(user.id, title, body, data);
    }
  } catch (err) {
    console.error("Push to role error:", err instanceof Error ? err.message : err);
  }
}

export async function sendPushToAllAdmins(title: string, body: string, data?: Record<string, string>) {
  await sendPushToRole("ADMIN", title, body, data);
}

export function registerPushToken(userId: string, token: string) {
  return prisma.setting.upsert({
    where: { key: `push_token:${userId}` },
    update: { value: token },
    create: { key: `push_token:${userId}`, value: token },
  });
}
