import nodemailer from "nodemailer";
import { getSettingOrEnv } from "./settings";

export async function createTransporter() {
  const host =
    (await getSettingOrEnv("smtp_host", "MAIL_HOST")) || "smtp.hostinger.com";
  const port = Number(await getSettingOrEnv("smtp_port", "MAIL_PORT")) || 465;
  const user = await getSettingOrEnv("smtp_username", "MAIL_USERNAME");
  const pass = await getSettingOrEnv("smtp_password", "MAIL_PASSWORD");
  return nodemailer.createTransport({
    host,
    port,
    secure: true,
    auth: { user, pass },
    // tls: { rejectUnauthorized: false },
  });
}
