import ejs from "ejs";
import path from "path";
import resend from "../lib/resend";

interface SendEmailPayload {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, unknown>;
}

const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
}: SendEmailPayload) => {
  const templatePath = path.join(
    process.cwd(),
    "src",
    "app",
    "templates",
    `${templateName}.ejs`,
  );

  const html = await ejs.renderFile(templatePath, templateData);

  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const EmailService = {
  sendEmail,
};